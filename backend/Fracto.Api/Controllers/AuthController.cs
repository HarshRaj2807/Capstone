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
public sealed class AuthController(
    IAuthService securityService,
    IWebHostEnvironment environment) : ControllerBase
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
        var session = await securityService.RegisterAsync(registrationData, token);
        SetRefreshTokenCookie(session.RefreshToken, session.RefreshTokenExpiresAtUtc);
        return Ok(session.Auth);
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
        var session = await securityService.LoginAsync(loginData, token);
        SetRefreshTokenCookie(session.RefreshToken, session.RefreshTokenExpiresAtUtc);
        return Ok(session.Auth);
    }

    /// <summary>
    /// Refreshes an access token using a valid refresh token cookie or body value.
    /// </summary>
    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponseDto>> RefreshSession(
        [FromBody] RefreshRequestDto? refreshRequest,
        CancellationToken token)
    {
        var refreshToken = refreshRequest?.RefreshToken ?? Request.Cookies["fracto.refresh"];
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            return Unauthorized(new { message = "Refresh token is missing." });
        }

        var session = await securityService.RefreshAsync(refreshToken, token);
        SetRefreshTokenCookie(session.RefreshToken, session.RefreshTokenExpiresAtUtc);
        return Ok(session.Auth);
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
    /// Updates the profile information for the current user.
    /// </summary>
    [Authorize]
    [HttpPut("me")]
    public async Task<ActionResult<UserSummaryDto>> UpdateCurrentUserProfile(
        [FromBody] UpdateProfileRequestDto request,
        CancellationToken token)
    {
        var updatedProfile = await securityService.UpdateProfileAsync(User.GetUserId(), request, token);
        return Ok(updatedProfile);
    }

    /// <summary>
    /// Allows the user to change their password after verifying the current password.
    /// </summary>
    [Authorize]
    [HttpPut("change-password")]
    public async Task<ActionResult<object>> ChangePassword(
        [FromBody] ChangePasswordRequestDto request,
        CancellationToken token)
    {
        await securityService.ChangePasswordAsync(User.GetUserId(), request, token);
        return Ok(new { message = "Password updated successfully." });
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

    /// <summary>
    /// Logs out the current user by revoking the refresh token and clearing the cookie.
    /// </summary>
    [HttpPost("logout")]
    public async Task<ActionResult<object>> Logout(CancellationToken token)
    {
        var refreshToken = Request.Cookies["fracto.refresh"];
        if (!string.IsNullOrWhiteSpace(refreshToken))
        {
            await securityService.LogoutAsync(refreshToken, token);
        }

        ClearRefreshTokenCookie();
        return Ok(new { message = "Logged out successfully." });
    }

    private void SetRefreshTokenCookie(string refreshToken, DateTime expiresAtUtc)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = environment.IsProduction(),
            SameSite = SameSiteMode.Lax,
            Expires = expiresAtUtc,
            Path = "/api/auth"
        };

        Response.Cookies.Append("fracto.refresh", refreshToken, cookieOptions);
    }

    private void ClearRefreshTokenCookie()
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = environment.IsProduction(),
            SameSite = SameSiteMode.Lax,
            Path = "/api/auth"
        };

        Response.Cookies.Delete("fracto.refresh", cookieOptions);
    }
}
