using System.ComponentModel.DataAnnotations;

namespace Fracto.Api.Entities;

public sealed class Appointment
{
    public int AppointmentId { get; set; }

    public int UserId { get; set; }

    public User? User { get; set; }

    public int DoctorId { get; set; }

    public Doctor? Doctor { get; set; }

    public DateOnly AppointmentDate { get; set; }

    public TimeOnly TimeSlot { get; set; }

    public AppointmentStatus Status { get; set; } = AppointmentStatus.Booked;

    [MaxLength(500)]
    public string? ReasonForVisit { get; set; }

    [MaxLength(500)]
    public string? CancellationReason { get; set; }

    public DateTime BookedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime? CancelledAtUtc { get; set; }

    public Rating? Rating { get; set; }
}
