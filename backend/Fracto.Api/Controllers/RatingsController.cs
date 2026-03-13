using Fracto.Api.DTOs.Ratings;
using Fracto.Api.Helpers;
using Fracto.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Fracto.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public sealed class RatingsController(IRatingService ratingService) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<object>> CreateRating(
        [FromBody] RatingCreateDto request,
        CancellationToken cancellationToken)
    {
        var rating = await ratingService.CreateRatingAsync(User.GetUserId(), request, cancellationToken);

        return Ok(new
        {
            message = "Rating submitted successfully.",
            rating
        });
    }
}
