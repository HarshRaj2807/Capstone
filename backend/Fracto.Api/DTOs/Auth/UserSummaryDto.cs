namespace Fracto.Api.DTOs.Auth;

public sealed class UserSummaryDto
{
    public int UserId { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Role { get; set; } = string.Empty;

    public string? City { get; set; }

    public string? ProfileImagePath { get; set; }
}
