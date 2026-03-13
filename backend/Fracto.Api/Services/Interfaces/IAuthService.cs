using Fracto.Api.DTOs.Auth;

namespace Fracto.Api.Services.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request, CancellationToken cancellationToken = default);

    Task<AuthResponseDto> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken = default);

    Task<UserSummaryDto> GetCurrentUserAsync(int userId, CancellationToken cancellationToken = default);

    Task<string> UploadProfileImageAsync(int userId, IFormFile file, CancellationToken cancellationToken = default);
}
