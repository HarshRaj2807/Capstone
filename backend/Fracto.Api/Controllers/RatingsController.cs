using Fracto.Api.DTOs.Ratings;
using Fracto.Api.Helpers;
using Fracto.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Fracto.Api.Controllers;

/// <summary>
/// Handles user feedback and ratings for medical professionals.
/// </summary>
[ApiController]
[Authorize]
[Route("api/[controller]")]
public sealed class RatingsController(IRatingService feedbackManagementService) : ControllerBase
{
    /// <summary>
    /// Processes and saves a new rating and review from a patient.
    /// </summary>
    /// <param name="feedbackData">The rating and comment details.</param>
    /// <param name="token">Cancellation token.</param>
    /// <returns>A confirmation message and the saved rating data.</returns>
    [HttpPost]
    public async Task<ActionResult<object>> PostNewRating(
        [FromBody] RatingCreateDto feedbackData,
        CancellationToken token)
    {
        var savedRating = await feedbackManagementService.CreateRatingAsync(User.GetUserId(), feedbackData, token);

        return Ok(new
        {
            message = "Your feedback has been submitted successfully.",
            data = savedRating
        });
    }
}
