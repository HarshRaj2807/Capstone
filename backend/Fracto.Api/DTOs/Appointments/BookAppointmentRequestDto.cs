using System.ComponentModel.DataAnnotations;

namespace Fracto.Api.DTOs.Appointments;

public sealed class BookAppointmentRequestDto
{
    [Required]
    public int DoctorId { get; set; }

    [Required]
    public DateOnly AppointmentDate { get; set; }

    [Required]
    public string TimeSlot { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? ReasonForVisit { get; set; }
}
