using Fracto.Api.DTOs.Auth;
using Fracto.Api.Helpers;
using Fracto.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Fracto.Api.Controllers;

/// <summary>
/// Controller for handling authentication and user profile-related operations.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public sealed class AuthController(IAuthService securityService) : ControllerBase
{
    /// <summary>
    /// Registers a new user.
    /// </summary>
    /// <param name="registrationData">The registration information.</param>
    /// <param name="token">Cancellation token.</param>
    /// <returns>Authentication response containing user info and token.</returns>
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register(
        [FromBody] RegisterRequestDto registrationData,
        CancellationToken token)
    {
        var result = await securityService.RegisterAsync(registrationData, token);
        return Ok(result);
    }

    /// <summary>
    /// Authenticates a user and generates a token.
    /// </summary>
    /// <param name="loginData">The login credentials.</param>
    /// <param name="token">Cancellation token.</param>
    /// <returns>Authentication response containing user info and token.</returns>
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(
        [FromBody] LoginRequestDto loginData,
        CancellationToken token)
    {
        var result = await securityService.LoginAsync(loginData, token);
        return Ok(result);
    }

    /// <summary>
    /// Retrieves the profile summary for the currently authenticated user.
    /// </summary>
    /// <param name="token">Cancellation token.</param>
    /// <returns>A summary of the current user's profile.</returns>
    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserSummaryDto>> GetCurrentUserProfile(CancellationToken token)
    {
        var userProfile = await securityService.GetCurrentUserAsync(User.GetUserId(), token);
        return Ok(userProfile);
    }

    /// <summary>
    /// Uploads a new profile image for the current user.
    /// </summary>
    /// <param name="imageUploadRequest">The file upload data.</param>
    /// <param name="token">Cancellation token.</param>
    /// <returns>A message indicating success and the path to the uploaded image.</returns>
    [Authorize]
    [HttpPost("profile-image")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<object>> UploadProfileImage(
        [FromForm] ProfileImageUploadRequestDto imageUploadRequest,
        CancellationToken token)
    {
        var storedPath = await securityService.UploadProfileImageAsync(User.GetUserId(), imageUploadRequest.File, token);
        return Ok(new
        {
            message = "Profile photo has been successfully updated.",
            path = storedPath
        });
    }
}
