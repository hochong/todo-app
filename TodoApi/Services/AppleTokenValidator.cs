using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;

namespace TodoApi.Services;

public record AppleIdentity(string Subject, string? Email);

public class AppleTokenValidator
{
    private const string KeysUrl = "https://appleid.apple.com/auth/keys";

    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _config;

    private static JsonWebKeySet? _cachedKeys;
    private static DateTime _cacheExpiresAt = DateTime.MinValue;
    private static readonly SemaphoreSlim CacheLock = new(1, 1);

    public AppleTokenValidator(IHttpClientFactory httpClientFactory, IConfiguration config)
    {
        _httpClientFactory = httpClientFactory;
        _config = config;
    }

    public async Task<AppleIdentity> ValidateAsync(string identityToken)
    {
        var keys = await GetApplePublicKeysAsync();

        var handler = new JwtSecurityTokenHandler();
        var parameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = "https://appleid.apple.com",
            ValidateAudience = true,
            ValidAudience = _config["Apple:ClientId"],
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKeys = keys.Keys,
        };

        var principal = handler.ValidateToken(identityToken, parameters, out _);
        var subject = principal.FindFirst("sub")?.Value
            ?? throw new SecurityTokenException("Apple identity token is missing a subject claim");
        var email = principal.FindFirst("email")?.Value;

        return new AppleIdentity(subject, email);
    }

    private async Task<JsonWebKeySet> GetApplePublicKeysAsync()
    {
        if (_cachedKeys != null && DateTime.UtcNow < _cacheExpiresAt)
            return _cachedKeys;

        await CacheLock.WaitAsync();
        try
        {
            if (_cachedKeys != null && DateTime.UtcNow < _cacheExpiresAt)
                return _cachedKeys;

            var client = _httpClientFactory.CreateClient();
            var json = await client.GetStringAsync(KeysUrl);
            _cachedKeys = new JsonWebKeySet(json);
            _cacheExpiresAt = DateTime.UtcNow.AddHours(6);
            return _cachedKeys;
        }
        finally
        {
            CacheLock.Release();
        }
    }
}
