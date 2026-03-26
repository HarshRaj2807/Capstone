namespace Fracto.Api.DTOs.Auth;

public sealed class AuthSessionDto
{
    public AuthResponseDto Auth { get; set; } = new();

    public string RefreshToken { get; set; } = string.Empty;

    public DateTime RefreshTokenExpiresAtUtc { get; set; }
}
