using System.ComponentModel.DataAnnotations;

namespace Fracto.Api.Entities;

public sealed class RefreshToken
{
    public int RefreshTokenId { get; set; }

    public int UserId { get; set; }

    public User? User { get; set; }

    [MaxLength(64)]
    public string TokenHash { get; set; } = string.Empty;

    public DateTime ExpiresAtUtc { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime? RevokedAtUtc { get; set; }

    [MaxLength(64)]
    public string? ReplacedByTokenHash { get; set; }
}
