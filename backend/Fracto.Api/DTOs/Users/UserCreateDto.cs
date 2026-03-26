using System.ComponentModel.DataAnnotations;

namespace Fracto.Api.DTOs.Users;

public sealed class UserCreateDto
{
    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(8)]
    [MaxLength(100)]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$",
        ErrorMessage = "Password must contain uppercase, lowercase, number, and symbol.")]
    public string Password { get; set; } = string.Empty;

    [MaxLength(20)]
    [RegularExpression(@"^\+?[0-9]{7,15}$", ErrorMessage = "Phone number must contain 7-15 digits.")]
    public string? PhoneNumber { get; set; }

    [MaxLength(100)]
    public string? City { get; set; }

    [Required]
    [RegularExpression("^(User|Admin)$", ErrorMessage = "Role must be User or Admin.")]
    public string Role { get; set; } = "User";
}
