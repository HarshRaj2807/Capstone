using System.ComponentModel.DataAnnotations;

namespace Fracto.Api.DTOs.Auth;

public sealed class ProfileImageUploadRequestDto
{
    // Wrapping the file in a form DTO keeps Swagger happy for multipart uploads.
    [Required]
    public IFormFile File { get; set; } = null!;
}
