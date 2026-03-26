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
    /// Retrieves a specific user by ID.
    /// </summary>
    [HttpGet("{uId:int}")]
    public async Task<ActionResult<UserDetailDto>> GetUserById(int uId, CancellationToken token)
    {
        var user = await userAccountService.GetUserByIdAsync(uId, token);
        return Ok(user);
    }

    /// <summary>
    /// Creates a new user account (admin only).
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<UserDetailDto>> CreateUser([FromBody] UserCreateDto request, CancellationToken token)
    {
        var created = await userAccountService.CreateUserAsync(request, token);
        return CreatedAtAction(nameof(GetUserById), new { uId = created.UserId }, created);
    }

    /// <summary>
    /// Updates an existing user account (admin only).
    /// </summary>
    [HttpPut("{uId:int}")]
    public async Task<ActionResult<UserDetailDto>> UpdateUser(
        int uId,
        [FromBody] UserUpdateDto request,
        CancellationToken token)
    {
        var updated = await userAccountService.UpdateUserAsync(uId, request, token);
        return Ok(updated);
    }

    /// <summary>
    /// Deactivates a user account (admin only).
    /// </summary>
    [HttpDelete("{uId:int}")]
    public async Task<ActionResult<object>> DeleteUser(int uId, CancellationToken token)
    {
        await userAccountService.DeleteUserAsync(uId, token);
        return Ok(new { message = "User account has been deactivated." });
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
