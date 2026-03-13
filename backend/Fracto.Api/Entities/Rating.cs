using System.ComponentModel.DataAnnotations;

namespace Fracto.Api.Entities;

public sealed class Rating
{
    public int RatingId { get; set; }

    public int AppointmentId { get; set; }

    public Appointment? Appointment { get; set; }

    public int UserId { get; set; }

    public User? User { get; set; }

    public int DoctorId { get; set; }

    public Doctor? Doctor { get; set; }

    public int RatingValue { get; set; }

    [MaxLength(1000)]
    public string? ReviewComment { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
