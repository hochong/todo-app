using Google.Apis.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using TodoApi.Models;
using TodoApi.Services;

namespace TodoApi.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly TokenService _tokenService;
    private readonly AppleTokenValidator _appleValidator;
    private readonly IConfiguration _config;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        TokenService tokenService,
        AppleTokenValidator appleValidator,
        IConfiguration config)
    {
        _userManager = userManager;
        _tokenService = tokenService;
        _appleValidator = appleValidator;
        _config = config;
    }

    // POST /api/auth/register
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var user = new ApplicationUser { UserName = request.Email, Email = request.Email };
        var result = await _userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
            return BadRequest(result.Errors.Select(e => e.Description));

        var token = _tokenService.CreateToken(user);
        return Ok(new AuthResponse(token, user.Email!));
    }

    // POST /api/auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null || !await _userManager.CheckPasswordAsync(user, request.Password))
            return Unauthorized("Invalid email or password");

        var token = _tokenService.CreateToken(user);
        return Ok(new AuthResponse(token, user.Email!));
    }

    // POST /api/auth/google
    [HttpPost("google")]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleAuthRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var clientId = _config["Google:ClientId"];
        if (string.IsNullOrWhiteSpace(clientId))
            return StatusCode(501, "Google sign-in is not configured on this server");

        GoogleJsonWebSignature.Payload payload;
        try
        {
            payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken, new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new[] { clientId },
            });
        }
        catch (InvalidJwtException)
        {
            return Unauthorized("Invalid Google token");
        }

        var user = await FindOrCreateExternalUserAsync("Google", payload.Subject, payload.Email);
        var token = _tokenService.CreateToken(user);
        return Ok(new AuthResponse(token, user.Email!));
    }

    // POST /api/auth/apple
    [HttpPost("apple")]
    public async Task<IActionResult> AppleLogin([FromBody] AppleAuthRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var clientId = _config["Apple:ClientId"];
        if (string.IsNullOrWhiteSpace(clientId))
            return StatusCode(501, "Apple sign-in is not configured on this server");

        AppleIdentity identity;
        try
        {
            identity = await _appleValidator.ValidateAsync(request.IdentityToken);
        }
        catch (Exception)
        {
            return Unauthorized("Invalid Apple token");
        }

        // Apple only returns the real email on the user's first sign-in; fall back to a
        // stable synthetic address tied to their subject so later sign-ins still resolve.
        var email = identity.Email ?? $"{identity.Subject}@privaterelay.appleid.local";

        var user = await FindOrCreateExternalUserAsync("Apple", identity.Subject, email);
        var token = _tokenService.CreateToken(user);
        return Ok(new AuthResponse(token, user.Email!));
    }

    private async Task<ApplicationUser> FindOrCreateExternalUserAsync(string provider, string providerKey, string email)
    {
        var existing = await _userManager.FindByLoginAsync(provider, providerKey);
        if (existing != null) return existing;

        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
        {
            user = new ApplicationUser { UserName = email, Email = email, EmailConfirmed = true };
            var result = await _userManager.CreateAsync(user);
            if (!result.Succeeded)
                throw new InvalidOperationException(string.Join(' ', result.Errors.Select(e => e.Description)));
        }

        await _userManager.AddLoginAsync(user, new UserLoginInfo(provider, providerKey, provider));
        return user;
    }
}
