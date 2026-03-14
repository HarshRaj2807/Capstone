namespace Fracto.Api.DTOs.Doctors;

public sealed class DoctorResponseDto
{
    public int DoctorId { get; set; }

    public string FullName { get; set; } = string.Empty;

    public int SpecializationId { get; set; }

    public string SpecializationName { get; set; } = string.Empty;

    public string City { get; set; } = string.Empty;

    public int ExperienceYears { get; set; }

    public decimal ConsultationFee { get; set; }

    public decimal AverageRating { get; set; }

    public int TotalReviews { get; set; }

    public string ConsultationStartTime { get; set; } = string.Empty;

    public string ConsultationEndTime { get; set; } = string.Empty;

    public int SlotDurationMinutes { get; set; }

    public string? ProfileImagePath { get; set; }

    public IReadOnlyCollection<SlotDto> AvailableSlots { get; set; } = Array.Empty<SlotDto>();
}

public record SlotDto(string Time, bool IsAvailable);
