namespace Fracto.Api.DTOs.Ratings;

public sealed class RatingResponseDto
{
    public int RatingId { get; set; }

    public string UserName { get; set; } = string.Empty;

    public int RatingValue { get; set; }

    public string? ReviewComment { get; set; }

    public DateTime CreatedAtUtc { get; set; }
}
