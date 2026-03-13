using Fracto.Api.DTOs.Auth;
using Fracto.Api.Helpers;
using Fracto.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Fracto.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register(
        [FromBody] RegisterRequestDto request,
        CancellationToken cancellationToken)
    {
        var response = await authService.RegisterAsync(request, cancellationToken);
        return Ok(response);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(
        [FromBody] LoginRequestDto request,
        CancellationToken cancellationToken)
    {
        var response = await authService.LoginAsync(request, cancellationToken);
        return Ok(response);
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserSummaryDto>> GetCurrentUser(CancellationToken cancellationToken)
    {
        var currentUser = await authService.GetCurrentUserAsync(User.GetUserId(), cancellationToken);
        return Ok(currentUser);
    }

    [Authorize]
    [HttpPost("profile-image")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<object>> UploadProfileImage(
        [FromForm] ProfileImageUploadRequestDto request,
        CancellationToken cancellationToken)
    {
        var path = await authService.UploadProfileImageAsync(User.GetUserId(), request.File, cancellationToken);
        return Ok(new
        {
            message = "Profile image uploaded successfully.",
            path
        });
    }
}
