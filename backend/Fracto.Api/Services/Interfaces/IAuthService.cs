using Fracto.Api.DTOs.Auth;

namespace Fracto.Api.Services.Interfaces;

public interface IAuthService
{
    Task<AuthSessionDto> RegisterAsync(RegisterRequestDto request, CancellationToken cancellationToken = default);

    Task<AuthSessionDto> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken = default);

    Task<AuthSessionDto> RefreshAsync(string refreshToken, CancellationToken cancellationToken = default);

    Task LogoutAsync(string refreshToken, CancellationToken cancellationToken = default);

    Task<UserSummaryDto> GetCurrentUserAsync(int userId, CancellationToken cancellationToken = default);

    Task<UserSummaryDto> UpdateProfileAsync(int userId, UpdateProfileRequestDto request, CancellationToken cancellationToken = default);

    Task ChangePasswordAsync(int userId, ChangePasswordRequestDto request, CancellationToken cancellationToken = default);

    Task<string> UploadProfileImageAsync(int userId, IFormFile file, CancellationToken cancellationToken = default);
}
