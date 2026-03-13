using System.ComponentModel.DataAnnotations;

namespace Fracto.Api.DTOs.Doctors;

public sealed class DoctorUpsertDto
{
    [Required]
    [MaxLength(200)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    public int SpecializationId { get; set; }

    [Required]
    [MaxLength(100)]
    public string City { get; set; } = string.Empty;

    [Range(0, 50)]
    public int ExperienceYears { get; set; }

    [Range(0, 100000)]
    public decimal ConsultationFee { get; set; }

    [Required]
    public TimeOnly ConsultationStartTime { get; set; }

    [Required]
    public TimeOnly ConsultationEndTime { get; set; }

    [Range(10, 120)]
    public int SlotDurationMinutes { get; set; } = 30;

    [MaxLength(500)]
    public string? ProfileImagePath { get; set; }

    public bool IsActive { get; set; } = true;
}
