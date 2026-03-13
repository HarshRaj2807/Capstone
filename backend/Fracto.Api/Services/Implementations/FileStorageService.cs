using Fracto.Api.Helpers;
using Fracto.Api.Services.Interfaces;

namespace Fracto.Api.Services.Implementations;

public sealed class FileStorageService(IWebHostEnvironment environment) : IFileStorageService
{
    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp"
    };

    private const long MaxFileSizeInBytes = 5 * 1024 * 1024;

    public async Task<string> SaveImageAsync(IFormFile file, string folderName, CancellationToken cancellationToken = default)
    {
        if (file.Length <= 0)
        {
            throw new ValidationException("Please select a valid image file.");
        }

        if (file.Length > MaxFileSizeInBytes)
        {
            throw new ValidationException("Image size must be 5 MB or less.");
        }

        var extension = Path.GetExtension(file.FileName);
        if (!AllowedExtensions.Contains(extension))
        {
            throw new ValidationException("Only JPG, JPEG, PNG, and WEBP images are allowed.");
        }

        var webRootPath = environment.WebRootPath;
        if (string.IsNullOrWhiteSpace(webRootPath))
        {
            webRootPath = Path.Combine(environment.ContentRootPath, "wwwroot");
        }

        var folderPath = Path.Combine(webRootPath, "uploads", folderName);
        Directory.CreateDirectory(folderPath);

        var fileName = $"{Guid.NewGuid():N}{extension.ToLowerInvariant()}";
        var fullPath = Path.Combine(folderPath, fileName);

        // Save the file under wwwroot so it can be served back to the Angular client.
        await using var stream = File.Create(fullPath);
        await file.CopyToAsync(stream, cancellationToken);

        return $"/uploads/{folderName}/{fileName}".Replace("\\", "/");
    }
}
