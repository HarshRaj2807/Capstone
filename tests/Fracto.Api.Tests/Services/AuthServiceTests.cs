using Fracto.Api.Configuration;
using Fracto.Api.DTOs.Auth;
using Fracto.Api.Helpers;
using Fracto.Api.Services.Implementations;
using Fracto.Api.Services.Interfaces;
using Fracto.Api.Tests.Infrastructure;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace Fracto.Api.Tests.Services;

using ApiValidationException = Fracto.Api.Helpers.ValidationException;

public sealed class AuthServiceTests
{
    [Fact]
    public async Task RegisterAsync_CreatesUserAndRefreshToken()
    {
        await using var dbFactory = new SqliteTestDbContextFactory();
        await using var dbContext = await dbFactory.CreateDbContextAsync();

        var service = CreateAuthService(dbContext);
        var request = new RegisterRequestDto
        {
            FirstName = "Rhea",
            LastName = "Thomas",
            Email = "rhea@example.com",
            Password = "Password@123",
            PhoneNumber = "+919876543210",
            City = "Kochi"
        };

        var session = await service.RegisterAsync(request);

        Assert.False(string.IsNullOrWhiteSpace(session.Auth.Token));
        Assert.False(string.IsNullOrWhiteSpace(session.RefreshToken));
        Assert.Single(dbContext.Users);
        Assert.Single(dbContext.RefreshTokens);
    }

    [Fact]
    public async Task RefreshAsync_RotatesRefreshToken()
    {
        await using var dbFactory = new SqliteTestDbContextFactory();
        await using var dbContext = await dbFactory.CreateDbContextAsync();

        var service = CreateAuthService(dbContext);
        var session = await service.RegisterAsync(new RegisterRequestDto
        {
            FirstName = "Anika",
            LastName = "Rao",
            Email = "anika@example.com",
            Password = "Password@123"
        });

        var refreshed = await service.RefreshAsync(session.RefreshToken);

        Assert.NotEqual(session.RefreshToken, refreshed.RefreshToken);

        var tokens = dbContext.RefreshTokens.ToList();
        Assert.Equal(2, tokens.Count);
        Assert.Single(tokens, token => token.RevokedAtUtc.HasValue);
        Assert.Single(tokens, token => !token.RevokedAtUtc.HasValue);
    }

    [Fact]
    public async Task ChangePasswordAsync_RejectsIncorrectCurrentPassword()
    {
        await using var dbFactory = new SqliteTestDbContextFactory();
        await using var dbContext = await dbFactory.CreateDbContextAsync();

        var service = CreateAuthService(dbContext);
        var session = await service.RegisterAsync(new RegisterRequestDto
        {
            FirstName = "Sam",
            LastName = "Lee",
            Email = "sam@example.com",
            Password = "Password@123"
        });

        var exception = await Assert.ThrowsAsync<ApiValidationException>(() =>
            service.ChangePasswordAsync(session.Auth.User.UserId, new ChangePasswordRequestDto
            {
                CurrentPassword = "WrongPassword@1",
                NewPassword = "NewPassword@123"
            }));

        Assert.Equal("Current password is incorrect.", exception.Message);
    }

    private static AuthService CreateAuthService(Fracto.Api.Data.FractoDbContext dbContext)
    {
        var jwtSettings = new JwtSettings
        {
            Issuer = "TestIssuer",
            Audience = "TestAudience",
            Key = "TestKey-For-AuthService-UnitTests-123456",
            ExpiryMinutes = 60,
            RefreshTokenExpiryDays = 7
        };

        var options = Options.Create(jwtSettings);
        var tokenGenerator = new JwtTokenGenerator(options);
        var fileStorage = new StubFileStorageService();

        return new AuthService(dbContext, tokenGenerator, fileStorage, options);
    }

    private sealed class StubFileStorageService : IFileStorageService
    {
        public Task<string> SaveImageAsync(IFormFile file, string folderName, CancellationToken cancellationToken = default)
        {
            return Task.FromResult("/uploads/test.png");
        }
    }
}
