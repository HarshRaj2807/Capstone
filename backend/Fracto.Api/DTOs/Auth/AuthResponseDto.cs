namespace Fracto.Api.DTOs.Auth;

public sealed class AuthResponseDto
{
    public string Message { get; set; } = string.Empty;

    public string Token { get; set; } = string.Empty;

    public DateTime ExpiresAtUtc { get; set; }

    public UserSummaryDto User { get; set; } = new();
}
