using Fracto.Api.Data;
using Fracto.Api.DTOs.Auth;
using Fracto.Api.Entities;
using Fracto.Api.Helpers;
using Fracto.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Fracto.Api.Services.Implementations;

public sealed class AuthService(
    FractoDbContext dbContext,
    JwtTokenGenerator jwtTokenGenerator,
    IFileStorageService fileStorageService) : IAuthService
{
    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request, CancellationToken cancellationToken = default)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var exists = await dbContext.Users.AnyAsync(user => user.Email == email, cancellationToken);
        if (exists)
        {
            throw new ConflictException("An account with this email already exists.");
        }

        var user = new User
        {
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            PhoneNumber = request.PhoneNumber?.Trim(),
            City = request.City?.Trim(),
            Role = UserRole.User
        };

        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync(cancellationToken);

        return BuildAuthResponse(user, "Registration successful.");
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken = default)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(currentUser => currentUser.Email == email, cancellationToken);

        if (user is null || !user.IsActive || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new ValidationException("Invalid email or password.");
        }

        return BuildAuthResponse(user, "Login successful.");
    }

    public async Task<UserSummaryDto> GetCurrentUserAsync(int userId, CancellationToken cancellationToken = default)
    {
        var user = await dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(currentUser => currentUser.UserId == userId && currentUser.IsActive, cancellationToken);

        return user is null
            ? throw new NotFoundException("User not found.")
            : MapUser(user);
    }

    public async Task<string> UploadProfileImageAsync(int userId, IFormFile file, CancellationToken cancellationToken = default)
    {
        var user = await dbContext.Users.FirstOrDefaultAsync(currentUser => currentUser.UserId == userId, cancellationToken);
        if (user is null)
        {
            throw new NotFoundException("User not found.");
        }

        user.ProfileImagePath = await fileStorageService.SaveImageAsync(file, "profiles", cancellationToken);
        user.UpdatedAtUtc = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);
        return user.ProfileImagePath;
    }

    private AuthResponseDto BuildAuthResponse(User user, string message)
    {
        var tokenResult = jwtTokenGenerator.Generate(user);

        return new AuthResponseDto
        {
            Message = message,
            Token = tokenResult.Token,
            ExpiresAtUtc = tokenResult.ExpiresAtUtc,
            User = MapUser(user)
        };
    }

    private static UserSummaryDto MapUser(User user) =>
        new()
        {
            UserId = user.UserId,
            FullName = $"{user.FirstName} {user.LastName}".Trim(),
            Email = user.Email,
            Role = user.Role.ToString(),
            City = user.City,
            ProfileImagePath = user.ProfileImagePath
        };
}
