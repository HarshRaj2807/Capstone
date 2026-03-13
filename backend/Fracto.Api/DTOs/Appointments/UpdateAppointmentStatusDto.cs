using System.ComponentModel.DataAnnotations;

namespace Fracto.Api.DTOs.Appointments;

public sealed class UpdateAppointmentStatusDto
{
    [Required]
    public string Status { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? CancellationReason { get; set; }
}
