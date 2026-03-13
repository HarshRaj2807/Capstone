using Fracto.Api.DTOs.Common;
using Fracto.Api.DTOs.Doctors;
using Fracto.Api.DTOs.Ratings;

namespace Fracto.Api.Services.Interfaces;

public interface IDoctorService
{
    Task<PagedResponse<DoctorResponseDto>> GetDoctorsAsync(
        string? city,
        int? specializationId,
        decimal? minRating,
        DateOnly? appointmentDate,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default);

    Task<DoctorResponseDto> GetDoctorByIdAsync(int doctorId, CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<string>> GetAvailableSlotsAsync(int doctorId, DateOnly appointmentDate, CancellationToken cancellationToken = default);

    Task<DoctorResponseDto> CreateDoctorAsync(DoctorUpsertDto request, CancellationToken cancellationToken = default);

    Task<DoctorResponseDto> UpdateDoctorAsync(int doctorId, DoctorUpsertDto request, CancellationToken cancellationToken = default);

    Task DeleteDoctorAsync(int doctorId, CancellationToken cancellationToken = default);

    Task<DoctorRatingsDto> GetRatingsAsync(int doctorId, CancellationToken cancellationToken = default);
}
