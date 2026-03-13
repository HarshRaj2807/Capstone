using Fracto.Api.Data;
using Fracto.Api.DTOs.Common;
using Fracto.Api.DTOs.Users;
using Fracto.Api.Helpers;
using Fracto.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Fracto.Api.Services.Implementations;

public sealed class UserService(FractoDbContext dbContext) : IUserService
{
    public async Task<PagedResponse<UserListItemDto>> GetUsersAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        pageNumber = Math.Max(pageNumber, 1);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var query = dbContext.Users
            .AsNoTracking()
            .OrderByDescending(user => user.CreatedAtUtc);

        var totalRecords = await query.CountAsync(cancellationToken);
        var users = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(user => new UserListItemDto
            {
                UserId = user.UserId,
                FullName = $"{user.FirstName} {user.LastName}".Trim(),
                Email = user.Email,
                Role = user.Role.ToString(),
                City = user.City,
                IsActive = user.IsActive,
                CreatedAtUtc = user.CreatedAtUtc
            })
            .ToListAsync(cancellationToken);

        return new PagedResponse<UserListItemDto>
        {
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalRecords = totalRecords,
            Items = users
        };
    }

    public async Task ToggleUserStatusAsync(int userId, CancellationToken cancellationToken = default)
    {
        var user = await dbContext.Users.FirstOrDefaultAsync(currentUser => currentUser.UserId == userId, cancellationToken);
        if (user is null)
        {
            throw new NotFoundException("User not found.");
        }

        user.IsActive = !user.IsActive;
        user.UpdatedAtUtc = DateTime.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
