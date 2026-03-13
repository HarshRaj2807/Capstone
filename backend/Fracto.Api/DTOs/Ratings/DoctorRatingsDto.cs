namespace Fracto.Api.DTOs.Ratings;

public sealed class DoctorRatingsDto
{
    public int DoctorId { get; set; }

    public decimal AverageRating { get; set; }

    public int TotalReviews { get; set; }

    public IReadOnlyCollection<RatingResponseDto> Items { get; set; } = Array.Empty<RatingResponseDto>();
}
