using Fracto.Api.DTOs.Appointments;
using Fracto.Api.DTOs.Common;
using Fracto.Api.Entities;

namespace Fracto.Api.Services.Interfaces;

public interface IAppointmentService
{
    Task<PagedResponse<AppointmentResponseDto>> GetAppointmentsAsync(
        int userId,
        UserRole role,
        string? status,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default);

    Task<AppointmentResponseDto> BookAppointmentAsync(int userId, BookAppointmentRequestDto request, CancellationToken cancellationToken = default);

    Task CancelAppointmentAsync(int appointmentId, int userId, UserRole role, string? cancellationReason, CancellationToken cancellationToken = default);

    Task<AppointmentResponseDto> UpdateAppointmentStatusAsync(
        int appointmentId,
        UpdateAppointmentStatusDto request,
        UserRole role,
        CancellationToken cancellationToken = default);
}
