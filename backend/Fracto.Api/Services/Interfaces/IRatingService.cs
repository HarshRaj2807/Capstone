using Fracto.Api.DTOs.Ratings;

namespace Fracto.Api.Services.Interfaces;

public interface IRatingService
{
    Task<RatingResponseDto> CreateRatingAsync(int userId, RatingCreateDto request, CancellationToken cancellationToken = default);
}
