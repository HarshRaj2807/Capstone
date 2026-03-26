using Fracto.Api.DTOs.Users;
using Fracto.Api.Entities;
using Fracto.Api.Helpers;
using Fracto.Api.Services.Implementations;
using Fracto.Api.Tests.Infrastructure;

namespace Fracto.Api.Tests.Services;

public sealed class UserServiceTests
{
    [Fact]
    public async Task CreateUserAsync_CreatesAdminUser()
    {
        await using var dbFactory = new SqliteTestDbContextFactory();
        await using var dbContext = await dbFactory.CreateDbContextAsync();
        var service = new UserService(dbContext);

        var created = await service.CreateUserAsync(new UserCreateDto
        {
            FirstName = "Admin",
            LastName = "User",
            Email = "admin.user@example.com",
            Password = "Password@123",
            Role = "Admin",
            City = "Mumbai"
        });

        Assert.Equal("Admin", created.Role);
        Assert.Equal("admin.user@example.com", created.Email);
        Assert.True(created.IsActive);
    }

    [Fact]
    public async Task UpdateUserAsync_UpdatesRoleAndStatus()
    {
        await using var dbFactory = new SqliteTestDbContextFactory();
        await using (var seedContext = await dbFactory.CreateDbContextAsync())
        {
            seedContext.Users.Add(new User
            {
                FirstName = "Test",
                LastName = "User",
                Email = "test.user@example.com",
                PasswordHash = "hash",
                Role = UserRole.User,
                IsActive = true
            });
            await seedContext.SaveChangesAsync();
        }

        await using var dbContext = await dbFactory.CreateDbContextAsync();
        var service = new UserService(dbContext);
        var userId = dbContext.Users.Select(user => user.UserId).Single();

        var updated = await service.UpdateUserAsync(userId, new UserUpdateDto
        {
            FirstName = "Test",
            LastName = "User",
            Email = "test.user@example.com",
            Role = "Admin",
            IsActive = false
        });

        Assert.Equal("Admin", updated.Role);
        Assert.False(updated.IsActive);
    }

    [Fact]
    public async Task ToggleUserStatusAsync_FlipsActiveFlag()
    {
        await using var dbFactory = new SqliteTestDbContextFactory();
        await using (var seedContext = await dbFactory.CreateDbContextAsync())
        {
            seedContext.Users.Add(new User
            {
                FirstName = "Toggle",
                LastName = "User",
                Email = "toggle.user@example.com",
                PasswordHash = "hash",
                Role = UserRole.User,
                IsActive = true
            });
            await seedContext.SaveChangesAsync();
        }

        await using var dbContext = await dbFactory.CreateDbContextAsync();
        var service = new UserService(dbContext);
        var userId = dbContext.Users.Select(user => user.UserId).Single();

        await service.ToggleUserStatusAsync(userId);

        var user = dbContext.Users.Single();
        Assert.False(user.IsActive);
    }

    [Fact]
    public async Task DeleteUserAsync_DisablesUserAndRevokesRefreshTokens()
    {
        await using var dbFactory = new SqliteTestDbContextFactory();
        await using (var seedContext = await dbFactory.CreateDbContextAsync())
        {
            var user = new User
            {
                FirstName = "Delete",
                LastName = "User",
                Email = "delete.user@example.com",
                PasswordHash = "hash",
                Role = UserRole.User,
                IsActive = true
            };
            seedContext.Users.Add(user);
            await seedContext.SaveChangesAsync();

            seedContext.RefreshTokens.Add(new RefreshToken
            {
                UserId = user.UserId,
                TokenHash = "token",
                ExpiresAtUtc = DateTime.UtcNow.AddDays(3),
                CreatedAtUtc = DateTime.UtcNow
            });
            await seedContext.SaveChangesAsync();
        }

        await using var dbContext = await dbFactory.CreateDbContextAsync();
        var service = new UserService(dbContext);
        var userId = dbContext.Users.Select(user => user.UserId).Single();

        await service.DeleteUserAsync(userId);

        var updatedUser = dbContext.Users.Single();
        Assert.False(updatedUser.IsActive);
        Assert.All(dbContext.RefreshTokens.ToList(), token => Assert.NotNull(token.RevokedAtUtc));
    }
}
