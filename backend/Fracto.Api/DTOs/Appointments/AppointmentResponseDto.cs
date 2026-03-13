namespace Fracto.Api.DTOs.Appointments;

public sealed class AppointmentResponseDto
{
    public int AppointmentId { get; set; }

    public int UserId { get; set; }

    public string UserName { get; set; } = string.Empty;

    public int DoctorId { get; set; }

    public string DoctorName { get; set; } = string.Empty;

    public string AppointmentDate { get; set; } = string.Empty;

    public string TimeSlot { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public string? ReasonForVisit { get; set; }

    public string? CancellationReason { get; set; }

    public bool CanRate { get; set; }
}
