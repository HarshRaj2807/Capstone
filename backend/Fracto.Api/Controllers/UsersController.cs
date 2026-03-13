using Fracto.Api.DTOs.Common;
using Fracto.Api.DTOs.Users;
using Fracto.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Fracto.Api.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/[controller]")]
public sealed class UsersController(IUserService userService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResponse<UserListItemDto>>> GetUsers(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var response = await userService.GetUsersAsync(pageNumber, pageSize, cancellationToken);
        return Ok(response);
    }

    [HttpPatch("{id:int}/toggle-status")]
    public async Task<ActionResult<object>> ToggleUserStatus(int id, CancellationToken cancellationToken)
    {
        await userService.ToggleUserStatusAsync(id, cancellationToken);
        return Ok(new { message = "User status updated successfully." });
    }
}
