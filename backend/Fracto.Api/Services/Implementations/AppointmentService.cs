using Fracto.Api.Data;
using Fracto.Api.DTOs.Appointments;
using Fracto.Api.DTOs.Common;
using Fracto.Api.Entities;
using Fracto.Api.Helpers;
using Fracto.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Fracto.Api.Services.Implementations;

public sealed class AppointmentService(FractoDbContext databaseContext) : IAppointmentService
{
    public async Task<PagedResponse<AppointmentResponseDto>> GetAppointmentsAsync(
        int userId,
        UserRole userRole,
        string? statusFilter,
        int pageIndex,
        int resultsPerPage,
        CancellationToken cancelToken = default)
    {
        // Ensure pagination parameters fall within sensible bounds.
        pageIndex = Math.Max(pageIndex, 1);
        resultsPerPage = Math.Clamp(resultsPerPage, 1, 50);

        var queryableAppointments = databaseContext.Appointments
            .AsNoTracking()
            .Include(a => a.User)
            .Include(a => a.Doctor)
            .Include(a => a.Rating)
            .AsQueryable();

        // If the user isn't an administrator, restrict results to their own bookings.
        if (userRole != UserRole.Admin)
        {
            queryableAppointments = queryableAppointments.Where(a => a.UserId == userId);
        }

        // Apply status filtering if a valid status string is provided.
        if (!string.IsNullOrWhiteSpace(statusFilter) && Enum.TryParse<AppointmentStatus>(statusFilter, true, out var currentStatus))
        {
            queryableAppointments = queryableAppointments.Where(a => a.Status == currentStatus);
        }

        var totalCount = await queryableAppointments.CountAsync(cancelToken);
        var pagedResults = await queryableAppointments
            .OrderByDescending(a => a.BookedAtUtc)
            .Skip((pageIndex - 1) * resultsPerPage)
            .Take(resultsPerPage)
            .ToListAsync(cancelToken);

        return new PagedResponse<AppointmentResponseDto>
        {
            PageNumber = pageIndex,
            PageSize = resultsPerPage,
            TotalRecords = totalCount,
            Items = pagedResults.Select(entry => TransformToDto(entry)).ToArray()
        };
    }

    public async Task<AppointmentResponseDto> BookAppointmentAsync(
        int userId,
        BookAppointmentRequestDto bookingRequest,
        CancellationToken cancelToken = default)
    {
        var targetDoctor = await databaseContext.Doctors
            .AsNoTracking()
            .FirstOrDefaultAsync(d => d.DoctorId == bookingRequest.DoctorId && d.IsActive, cancelToken);

        if (targetDoctor is null)
        {
            throw new NotFoundException("The requested medical practitioner could not be found.");
        }

        // Validate that the appointment date is not in the past.
        if (bookingRequest.AppointmentDate < DateOnly.FromDateTime(DateTime.Now))
        {
            throw new ValidationException("Selected date must be in the future.");
        }

        if (!TimeOnly.TryParse(bookingRequest.TimeSlot, out var parsedTimeSlot))
        {
            throw new ValidationException("The provided time slot format is not recognized.");
        }

        // Verify the requested time falls within the doctor's available hours.
        if (parsedTimeSlot < targetDoctor.ConsultationStartTime || parsedTimeSlot >= targetDoctor.ConsultationEndTime)
        {
            throw new ValidationException("This time slot is outside of the doctor's practicing hours.");
        }

        var gapFromStart = (parsedTimeSlot.ToTimeSpan() - targetDoctor.ConsultationStartTime.ToTimeSpan()).TotalMinutes;
        if (gapFromStart % targetDoctor.SlotDurationMinutes != 0)
        {
            throw new ValidationException("The selected time does not align with the professional's schedule intervals.");
        }

        // Check if another appointment already occupies this specific slot.
        var isSlotOccupied = await databaseContext.Appointments.AnyAsync(
            a =>
                a.DoctorId == bookingRequest.DoctorId &&
                a.AppointmentDate == bookingRequest.AppointmentDate &&
                a.TimeSlot == parsedTimeSlot &&
                a.Status != AppointmentStatus.Cancelled,
            cancelToken);

        if (isSlotOccupied)
        {
            throw new ConflictException("The chosen time slot has already been reserved by another patient.");
        }

        var newAppointmentEntry = new Appointment
        {
            UserId = userId,
            DoctorId = bookingRequest.DoctorId,
            AppointmentDate = bookingRequest.AppointmentDate,
            TimeSlot = parsedTimeSlot,
            ReasonForVisit = bookingRequest.ReasonForVisit?.Trim(),
            Status = AppointmentStatus.Booked,
            BookedAtUtc = DateTime.UtcNow
        };

        databaseContext.Appointments.Add(newAppointmentEntry);
        await databaseContext.SaveChangesAsync(cancelToken);

        var finalizedEntry = await databaseContext.Appointments
            .AsNoTracking()
            .Include(a => a.User)
            .Include(a => a.Doctor)
            .Include(a => a.Rating)
            .FirstAsync(a => a.AppointmentId == newAppointmentEntry.AppointmentId, cancelToken);

        return TransformToDto(finalizedEntry);
    }

    public async Task CancelAppointmentAsync(
        int appointmentId,
        int currentUserId,
        UserRole currentUserRole,
        string? reasonForCancellation,
        CancellationToken cancelToken = default)
    {
        var recordToCancel = await databaseContext.Appointments.FirstOrDefaultAsync(
            a => a.AppointmentId == appointmentId,
            cancelToken);

        if (recordToCancel is null)
        {
            throw new NotFoundException("No matching appointment record found to cancel.");
        }

        // Security check: only the owner or an administrator can cancel.
        if (currentUserRole != UserRole.Admin && recordToCancel.UserId != currentUserId)
        {
            throw new ForbiddenException("Unauthorized attempt to cancel an appointment.");
        }

        if (recordToCancel.Status == AppointmentStatus.Cancelled)
        {
            throw new ValidationException("This appointment remains in a cancelled state already.");
        }

        recordToCancel.Status = AppointmentStatus.Cancelled;
        recordToCancel.CancellationReason = reasonForCancellation?.Trim();
        recordToCancel.CancelledAtUtc = DateTime.UtcNow;

        await databaseContext.SaveChangesAsync(cancelToken);
    }

    public async Task<AppointmentResponseDto> RescheduleAppointmentAsync(
        int appointmentId,
        int currentUserId,
        UserRole currentUserRole,
        RescheduleAppointmentRequestDto request,
        CancellationToken cancelToken = default)
    {
        var appointment = await databaseContext.Appointments
            .Include(a => a.Doctor)
            .Include(a => a.User)
            .Include(a => a.Rating)
            .FirstOrDefaultAsync(a => a.AppointmentId == appointmentId, cancelToken);

        if (appointment is null)
        {
            throw new NotFoundException("Appointment not found.");
        }

        if (currentUserRole != UserRole.Admin && appointment.UserId != currentUserId)
        {
            throw new ForbiddenException("Unauthorized attempt to reschedule this appointment.");
        }

        if (appointment.Status == AppointmentStatus.Cancelled)
        {
            throw new ValidationException("Cancelled appointments cannot be rescheduled.");
        }

        if (appointment.Status == AppointmentStatus.Completed)
        {
            throw new ValidationException("Completed appointments cannot be rescheduled.");
        }

        if (request.AppointmentDate < DateOnly.FromDateTime(DateTime.Now))
        {
            throw new ValidationException("Selected date must be in the future.");
        }

        if (!TimeOnly.TryParse(request.TimeSlot, out var parsedTimeSlot))
        {
            throw new ValidationException("The provided time slot format is not recognized.");
        }

        if (appointment.Doctor is null || !appointment.Doctor.IsActive)
        {
            throw new ValidationException("The selected doctor is not available.");
        }

        if (parsedTimeSlot < appointment.Doctor.ConsultationStartTime || parsedTimeSlot >= appointment.Doctor.ConsultationEndTime)
        {
            throw new ValidationException("This time slot is outside of the doctor's practicing hours.");
        }

        var gapFromStart = (parsedTimeSlot.ToTimeSpan() - appointment.Doctor.ConsultationStartTime.ToTimeSpan()).TotalMinutes;
        if (gapFromStart % appointment.Doctor.SlotDurationMinutes != 0)
        {
            throw new ValidationException("The selected time does not align with the professional's schedule intervals.");
        }

        var isSlotOccupied = await databaseContext.Appointments.AnyAsync(
            a =>
                a.DoctorId == appointment.DoctorId &&
                a.AppointmentDate == request.AppointmentDate &&
                a.TimeSlot == parsedTimeSlot &&
                a.AppointmentId != appointment.AppointmentId &&
                a.Status != AppointmentStatus.Cancelled,
            cancelToken);

        if (isSlotOccupied)
        {
            throw new ConflictException("The chosen time slot has already been reserved by another patient.");
        }

        appointment.AppointmentDate = request.AppointmentDate;
        appointment.TimeSlot = parsedTimeSlot;
        appointment.ReasonForVisit = request.ReasonForVisit?.Trim() ?? appointment.ReasonForVisit;
        appointment.Status = AppointmentStatus.Booked;
        appointment.CancellationReason = null;
        appointment.CancelledAtUtc = null;

        await databaseContext.SaveChangesAsync(cancelToken);
        return TransformToDto(appointment);
    }

    public async Task<AppointmentResponseDto> UpdateAppointmentStatusAsync(
        int appointmentId,
        UpdateAppointmentStatusDto statusDto,
        UserRole adminRole,
        CancellationToken cancelToken = default)
    {
        if (adminRole != UserRole.Admin)
        {
            throw new ForbiddenException("Administrative privileges are required for status modifications.");
        }

        if (!Enum.TryParse<AppointmentStatus>(statusDto.Status, true, out var nextStatus))
        {
            throw new ValidationException("The provided status value is not valid within the system.");
        }

        var existingRecord = await databaseContext.Appointments
            .Include(a => a.User)
            .Include(a => a.Doctor)
            .Include(a => a.Rating)
            .FirstOrDefaultAsync(a => a.AppointmentId == appointmentId, cancelToken);

        if (existingRecord is null)
        {
            throw new NotFoundException("Target appointment record was not found.");
        }

        existingRecord.Status = nextStatus;
        
        // Handle cancellation-specific metadata if the status is being set to Cancelled.
        if (nextStatus == AppointmentStatus.Cancelled)
        {
            existingRecord.CancellationReason = statusDto.CancellationReason?.Trim();
            existingRecord.CancelledAtUtc = DateTime.UtcNow;
        }
        else
        {
            existingRecord.CancellationReason = null;
            existingRecord.CancelledAtUtc = null;
        }

        await databaseContext.SaveChangesAsync(cancelToken);
        return TransformToDto(existingRecord);
    }

    private static AppointmentResponseDto TransformToDto(Appointment entity)
    {
        return new AppointmentResponseDto
        {
            AppointmentId = entity.AppointmentId,
            UserId = entity.UserId,
            UserName = entity.User != null ? $"{entity.User.FirstName} {entity.User.LastName}".Trim() : "Unknown User",
            DoctorId = entity.DoctorId,
            DoctorName = entity.Doctor?.FullName ?? "Unknown Doctor",
            AppointmentDate = entity.AppointmentDate.ToString("yyyy-MM-dd"),
            TimeSlot = entity.TimeSlot.ToString("HH:mm"),
            Status = entity.Status.ToString(),
            ReasonForVisit = entity.ReasonForVisit,
            CancellationReason = entity.CancellationReason,
            CanRate = entity.Status == AppointmentStatus.Completed && entity.Rating == null
        };
    }
}
