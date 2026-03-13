using System.ComponentModel.DataAnnotations;

namespace Fracto.Api.DTOs.Ratings;

public sealed class RatingCreateDto
{
    [Required]
    public int AppointmentId { get; set; }

    [Required]
    public int DoctorId { get; set; }

    [Range(1, 5)]
    public int RatingValue { get; set; }

    [MaxLength(1000)]
    public string? ReviewComment { get; set; }
}
