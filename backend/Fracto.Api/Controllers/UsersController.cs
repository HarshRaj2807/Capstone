using Fracto.Api.DTOs.Common;
using Fracto.Api.DTOs.Users;
using Fracto.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Fracto.Api.Controllers;

/// <summary>
/// Managed by administrators to oversee user accounts and their statuses.
/// </summary>
[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/[controller]")]
public sealed class UsersController(IUserService userAccountService) : ControllerBase
{
    /// <summary>
    /// Returns a paginated list of all users registered in the system.
    /// </summary>
    /// <param name="pNum">The current page number to retrieve.</param>
    /// <param name="pSize">The number of users per page.</param>
    /// <param name="token">Cancellation token.</param>
    /// <returns>A paginated response containing user details.</returns>
    [HttpGet]
    public async Task<ActionResult<PagedResponse<UserListItemDto>>> FetchAllUsers(
        [FromQuery] int pNum = 1,
        [FromQuery] int pSize = 10,
        CancellationToken token = default)
    {
        var usersList = await userAccountService.GetUsersAsync(pNum, pSize, token);
        return Ok(usersList);
    }

    /// <summary>
    /// Toggles the active/inactive status of a specific user account.
    /// </summary>
    /// <param name="uId">The unique ID of the user.</param>
    /// <param name="token">Cancellation token.</param>
    /// <returns>A confirmation message.</returns>
    [HttpPatch("{uId:int}/toggle-status")]
    public async Task<ActionResult<object>> FlipUserAccountStatus(int uId, CancellationToken token)
    {
        await userAccountService.ToggleUserStatusAsync(uId, token);
        return Ok(new { message = "The user account status has been successfully modified." });
    }
}
