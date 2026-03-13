namespace Fracto.Api.Services.Interfaces;

public interface IFileStorageService
{
    Task<string> SaveImageAsync(IFormFile file, string folderName, CancellationToken cancellationToken = default);
}
