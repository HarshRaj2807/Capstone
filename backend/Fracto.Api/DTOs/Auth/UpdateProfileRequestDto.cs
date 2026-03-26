using System.ComponentModel.DataAnnotations;

namespace Fracto.Api.DTOs.Auth;

public sealed class UpdateProfileRequestDto
{
    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [MaxLength(20)]
    [RegularExpression(@"^\+?[0-9]{7,15}$", ErrorMessage = "Phone number must contain 7-15 digits.")]
    public string? PhoneNumber { get; set; }

    [MaxLength(100)]
    public string? City { get; set; }
}
