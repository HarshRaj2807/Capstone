using Fracto.Api.Data;
using Fracto.Api.DTOs.Common;
using Fracto.Api.DTOs.Users;
using Fracto.Api.Helpers;
using Fracto.Api.Entities;
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

    public async Task<UserDetailDto> GetUserByIdAsync(int userId, CancellationToken cancellationToken = default)
    {
        var user = await dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(currentUser => currentUser.UserId == userId, cancellationToken);

        return user is null
            ? throw new NotFoundException("User not found.")
            : MapUserDetail(user);
    }

    public async Task<UserDetailDto> CreateUserAsync(UserCreateDto request, CancellationToken cancellationToken = default)
    {
        var email = NormalizeEmail(request.Email);
        var exists = await dbContext.Users.AnyAsync(user => user.Email == email, cancellationToken);
        if (exists)
        {
            throw new ConflictException("An account with this email already exists.");
        }

        var role = ParseRole(request.Role);

        var user = new User
        {
            FirstName = NormalizeRequiredField(request.FirstName, "First name"),
            LastName = NormalizeRequiredField(request.LastName, "Last name"),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            PhoneNumber = request.PhoneNumber?.Trim(),
            City = request.City?.Trim(),
            Role = role,
            IsActive = true
        };

        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync(cancellationToken);

        return MapUserDetail(user);
    }

    public async Task<UserDetailDto> UpdateUserAsync(int userId, UserUpdateDto request, CancellationToken cancellationToken = default)
    {
        var user = await dbContext.Users.FirstOrDefaultAsync(currentUser => currentUser.UserId == userId, cancellationToken);
        if (user is null)
        {
            throw new NotFoundException("User not found.");
        }

        var email = NormalizeEmail(request.Email);
        var emailExists = await dbContext.Users
            .AnyAsync(current => current.Email == email && current.UserId != userId, cancellationToken);
        if (emailExists)
        {
            throw new ConflictException("Another account already uses this email address.");
        }

        user.FirstName = NormalizeRequiredField(request.FirstName, "First name");
        user.LastName = NormalizeRequiredField(request.LastName, "Last name");
        user.Email = email;
        user.PhoneNumber = request.PhoneNumber?.Trim();
        user.City = request.City?.Trim();
        user.Role = ParseRole(request.Role);
        user.IsActive = request.IsActive;
        user.UpdatedAtUtc = DateTime.UtcNow;

        if (!string.IsNullOrWhiteSpace(request.Password))
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        return MapUserDetail(user);
    }

    public async Task DeleteUserAsync(int userId, CancellationToken cancellationToken = default)
    {
        var user = await dbContext.Users.FirstOrDefaultAsync(currentUser => currentUser.UserId == userId, cancellationToken);
        if (user is null)
        {
            throw new NotFoundException("User not found.");
        }

        user.IsActive = false;
        user.UpdatedAtUtc = DateTime.UtcNow;

        var tokens = await dbContext.RefreshTokens
            .Where(token => token.UserId == userId && !token.RevokedAtUtc.HasValue)
            .ToListAsync(cancellationToken);

        foreach (var token in tokens)
        {
            token.RevokedAtUtc = DateTime.UtcNow;
        }

        await dbContext.SaveChangesAsync(cancellationToken);
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

    private static UserDetailDto MapUserDetail(User user) =>
        new()
        {
            UserId = user.UserId,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            Role = user.Role.ToString(),
            PhoneNumber = user.PhoneNumber,
            City = user.City,
            IsActive = user.IsActive,
            CreatedAtUtc = user.CreatedAtUtc,
            UpdatedAtUtc = user.UpdatedAtUtc
        };

    private static string NormalizeRequiredField(string input, string fieldName)
    {
        var trimmed = input?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(trimmed))
        {
            throw new ValidationException($"{fieldName} is required.");
        }

        return trimmed;
    }

    private static string NormalizeEmail(string email)
    {
        var trimmed = email?.Trim().ToLowerInvariant() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(trimmed))
        {
            throw new ValidationException("Email is required.");
        }

        return trimmed;
    }

    private static UserRole ParseRole(string role)
    {
        return Enum.TryParse<UserRole>(role, true, out var parsedRole)
            ? parsedRole
            : throw new ValidationException("Role must be User or Admin.");
    }
}
