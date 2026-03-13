using System.ComponentModel.DataAnnotations;

namespace Fracto.Api.Entities;

public sealed class Doctor
{
    public int DoctorId { get; set; }

    [MaxLength(200)]
    public string FullName { get; set; } = string.Empty;

    public int SpecializationId { get; set; }

    public Specialization? Specialization { get; set; }

    [MaxLength(100)]
    public string City { get; set; } = string.Empty;

    public int ExperienceYears { get; set; }

    public decimal ConsultationFee { get; set; }

    public decimal AverageRating { get; set; }

    public int TotalReviews { get; set; }

    public TimeOnly ConsultationStartTime { get; set; } = new(9, 0);

    public TimeOnly ConsultationEndTime { get; set; } = new(13, 0);

    public int SlotDurationMinutes { get; set; } = 30;

    [MaxLength(500)]
    public string? ProfileImagePath { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAtUtc { get; set; }

    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();

    public ICollection<Rating> Ratings { get; set; } = new List<Rating>();
}
