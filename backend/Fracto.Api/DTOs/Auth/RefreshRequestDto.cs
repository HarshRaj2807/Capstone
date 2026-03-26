using System.ComponentModel.DataAnnotations;

namespace Fracto.Api.DTOs.Auth;

public sealed class RefreshRequestDto
{
    [Required]
    public string RefreshToken { get; set; } = string.Empty;
}
