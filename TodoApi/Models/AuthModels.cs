using System.ComponentModel.DataAnnotations;

namespace TodoApi.Models;

public class RegisterRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(8)]
    public string Password { get; set; } = string.Empty;
}

public class LoginRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}

public record AuthResponse(string Token, string Email);

public class GoogleAuthRequest
{
    [Required]
    public string IdToken { get; set; } = string.Empty;
}

public class AppleAuthRequest
{
    [Required]
    public string IdentityToken { get; set; } = string.Empty;
}
