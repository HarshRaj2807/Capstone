using Fracto.Api.Data;
using Fracto.Api.DTOs.Auth;
using Fracto.Api.Entities;
using Fracto.Api.Helpers;
using Fracto.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Fracto.Api.Configuration;

namespace Fracto.Api.Services.Implementations;

public sealed class AuthService(
    FractoDbContext dbContext,
    JwtTokenGenerator jwtTokenGenerator,
    IFileStorageService fileStorageService,
    IOptions<JwtSettings> jwtOptions) : IAuthService
{
    private readonly JwtSettings _jwtSettings = jwtOptions.Value;

    public async Task<AuthSessionDto> RegisterAsync(RegisterRequestDto request, CancellationToken cancellationToken = default)
    {
        var email = NormalizeEmail(request.Email);
        var exists = await dbContext.Users.AnyAsync(user => user.Email == email, cancellationToken);
        if (exists)
        {
            throw new ConflictException("An account with this email already exists.");
        }

        var user = new User
        {
            FirstName = NormalizeRequiredField(request.FirstName, "First name"),
            LastName = NormalizeRequiredField(request.LastName, "Last name"),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            PhoneNumber = request.PhoneNumber?.Trim(),
            City = request.City?.Trim(),
            Role = UserRole.User
        };

        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync(cancellationToken);

        return await BuildAuthSessionAsync(user, "Registration successful.", cancellationToken);
    }

    public async Task<AuthSessionDto> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken = default)
    {
        var email = NormalizeEmail(request.Email);
        var user = await dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(currentUser => currentUser.Email == email, cancellationToken);

        if (user is null || !user.IsActive || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new ValidationException("Invalid email or password.");
        }

        return await BuildAuthSessionAsync(user, "Login successful.", cancellationToken);
    }

    public async Task<AuthSessionDto> RefreshAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            throw new ValidationException("Refresh token is required.");
        }

        var tokenHash = RefreshTokenHelper.HashToken(refreshToken);
        var storedToken = await dbContext.RefreshTokens
            .Include(token => token.User)
            .FirstOrDefaultAsync(token => token.TokenHash == tokenHash, cancellationToken);

        if (storedToken is null || storedToken.RevokedAtUtc.HasValue || storedToken.ExpiresAtUtc <= DateTime.UtcNow)
        {
            throw new ValidationException("Refresh token is invalid or expired.");
        }

        if (storedToken.User is null || !storedToken.User.IsActive)
        {
            throw new ValidationException("User account is inactive.");
        }

        var newRefresh = CreateRefreshToken(storedToken.UserId, out var newToken, out var newExpiresAt);
        storedToken.RevokedAtUtc = DateTime.UtcNow;
        storedToken.ReplacedByTokenHash = newRefresh.TokenHash;

        dbContext.RefreshTokens.Add(newRefresh);
        await dbContext.SaveChangesAsync(cancellationToken);

        return new AuthSessionDto
        {
            Auth = BuildAuthResponse(storedToken.User, "Session refreshed."),
            RefreshToken = newToken,
            RefreshTokenExpiresAtUtc = newExpiresAt
        };
    }

    public async Task LogoutAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            return;
        }

        var tokenHash = RefreshTokenHelper.HashToken(refreshToken);
        var storedToken = await dbContext.RefreshTokens
            .FirstOrDefaultAsync(token => token.TokenHash == tokenHash, cancellationToken);

        if (storedToken is null || storedToken.RevokedAtUtc.HasValue)
        {
            return;
        }

        storedToken.RevokedAtUtc = DateTime.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
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

    public async Task<UserSummaryDto> UpdateProfileAsync(
        int userId,
        UpdateProfileRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var user = await dbContext.Users.FirstOrDefaultAsync(currentUser => currentUser.UserId == userId, cancellationToken);
        if (user is null || !user.IsActive)
        {
            throw new NotFoundException("User not found.");
        }

        user.FirstName = NormalizeRequiredField(request.FirstName, "First name");
        user.LastName = NormalizeRequiredField(request.LastName, "Last name");
        user.PhoneNumber = request.PhoneNumber?.Trim();
        user.City = request.City?.Trim();
        user.UpdatedAtUtc = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);
        return MapUser(user);
    }

    public async Task ChangePasswordAsync(
        int userId,
        ChangePasswordRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var user = await dbContext.Users.FirstOrDefaultAsync(currentUser => currentUser.UserId == userId, cancellationToken);
        if (user is null || !user.IsActive)
        {
            throw new NotFoundException("User not found.");
        }

        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
        {
            throw new ValidationException("Current password is incorrect.");
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.UpdatedAtUtc = DateTime.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
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

    private async Task<AuthSessionDto> BuildAuthSessionAsync(
        User user,
        string message,
        CancellationToken cancellationToken)
    {
        var auth = BuildAuthResponse(user, message);
        var refreshToken = CreateRefreshToken(user.UserId, out var rawToken, out var refreshExpiresAtUtc);

        dbContext.RefreshTokens.Add(refreshToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        return new AuthSessionDto
        {
            Auth = auth,
            RefreshToken = rawToken,
            RefreshTokenExpiresAtUtc = refreshExpiresAtUtc
        };
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

    private RefreshToken CreateRefreshToken(int userId, out string rawToken, out DateTime expiresAtUtc)
    {
        rawToken = RefreshTokenHelper.GenerateToken();
        expiresAtUtc = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpiryDays);

        return new RefreshToken
        {
            UserId = userId,
            TokenHash = RefreshTokenHelper.HashToken(rawToken),
            ExpiresAtUtc = expiresAtUtc,
            CreatedAtUtc = DateTime.UtcNow
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
}
