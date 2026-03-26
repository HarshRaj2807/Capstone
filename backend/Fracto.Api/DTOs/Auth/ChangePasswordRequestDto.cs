using System.ComponentModel.DataAnnotations;

namespace Fracto.Api.DTOs.Auth;

public sealed class ChangePasswordRequestDto
{
    [Required]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required]
    [MinLength(8)]
    [MaxLength(100)]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$",
        ErrorMessage = "Password must contain uppercase, lowercase, number, and symbol.")]
    public string NewPassword { get; set; } = string.Empty;
}
