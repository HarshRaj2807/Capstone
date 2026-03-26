using System.ComponentModel.DataAnnotations;

namespace Fracto.Api.DTOs.Specializations;

public sealed class SpecializationUpsertDto
{
    [Required]
    [MaxLength(150)]
    public string SpecializationName { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    public bool IsActive { get; set; } = true;
}
