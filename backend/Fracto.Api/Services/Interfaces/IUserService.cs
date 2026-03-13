using Fracto.Api.DTOs.Common;
using Fracto.Api.DTOs.Users;

namespace Fracto.Api.Services.Interfaces;

public interface IUserService
{
    Task<PagedResponse<UserListItemDto>> GetUsersAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default);

    Task ToggleUserStatusAsync(int userId, CancellationToken cancellationToken = default);
}
