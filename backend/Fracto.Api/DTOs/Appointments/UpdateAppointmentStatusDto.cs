using System.ComponentModel.DataAnnotations;

namespace Fracto.Api.DTOs.Appointments;

public sealed class UpdateAppointmentStatusDto
{
    [Required]
    [RegularExpression("^(Booked|Confirmed|Cancelled|Completed)$",
        ErrorMessage = "Status must be Booked, Confirmed, Cancelled, or Completed.")]
    public string Status { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? CancellationReason { get; set; }
}
