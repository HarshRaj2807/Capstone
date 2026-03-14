using Fracto.Api.Data;
using Fracto.Api.DTOs.Appointments;
using Fracto.Api.DTOs.Common;
using Fracto.Api.Entities;
using Fracto.Api.Helpers;
using Fracto.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Fracto.Api.Services.Implementations;

public sealed class AppointmentService(FractoDbContext dbContext) : IAppointmentService
{
    public async Task<PagedResponse<AppointmentResponseDto>> GetAppointmentsAsync(
        int userId,
        UserRole role,
        string? status,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        pageNumber = Math.Max(pageNumber, 1);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var query = dbContext.Appointments
            .AsNoTracking()
            .Include(appointment => appointment.User)
            .Include(appointment => appointment.Doctor)
            .Include(appointment => appointment.Rating)
            .AsQueryable();

        if (role != UserRole.Admin)
        {
            query = query.Where(appointment => appointment.UserId == userId);
        }

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<AppointmentStatus>(status, true, out var parsedStatus))
        {
            query = query.Where(appointment => appointment.Status == parsedStatus);
        }

        var totalRecords = await query.CountAsync(cancellationToken);
        var appointments = await query
            .OrderByDescending(appointment => appointment.BookedAtUtc)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResponse<AppointmentResponseDto>
        {
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalRecords = totalRecords,
            Items = appointments.Select(MapAppointment).ToArray()
        };
    }

    public async Task<AppointmentResponseDto> BookAppointmentAsync(
        int userId,
        BookAppointmentRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var doctor = await dbContext.Doctors
            .AsNoTracking()
            .FirstOrDefaultAsync(currentDoctor => currentDoctor.DoctorId == request.DoctorId && currentDoctor.IsActive, cancellationToken);

        if (doctor is null)
        {
            throw new NotFoundException("Doctor not found.");
        }

        if (request.AppointmentDate < DateOnly.FromDateTime(DateTime.Now))
        {
            throw new ValidationException("Appointment date cannot be in the past.");
        }

        if (!TimeOnly.TryParse(request.TimeSlot, out var requestedSlot))
        {
            throw new ValidationException("Time slot format is invalid.");
        }

        if (requestedSlot < doctor.ConsultationStartTime || requestedSlot >= doctor.ConsultationEndTime)
        {
            throw new ValidationException("Selected slot is outside the doctor's consultation hours.");
        }

        var minutesFromStart = (requestedSlot.ToTimeSpan() - doctor.ConsultationStartTime.ToTimeSpan()).TotalMinutes;
        if (minutesFromStart % doctor.SlotDurationMinutes != 0)
        {
            throw new ValidationException("Selected slot does not align with the doctor's schedule.");
        }

        var slotIsTaken = await dbContext.Appointments.AnyAsync(
            appointment =>
                appointment.DoctorId == request.DoctorId &&
                appointment.AppointmentDate == request.AppointmentDate &&
                appointment.TimeSlot == requestedSlot &&
                appointment.Status != AppointmentStatus.Cancelled,
            cancellationToken);

        if (slotIsTaken)
        {
            throw new ConflictException("Selected time slot is no longer available.");
        }

        var appointment = new Appointment
        {
            UserId = userId,
            DoctorId = request.DoctorId,
            AppointmentDate = request.AppointmentDate,
            TimeSlot = requestedSlot,
            ReasonForVisit = request.ReasonForVisit?.Trim(),
            Status = AppointmentStatus.Booked,
            BookedAtUtc = DateTime.UtcNow
        };

        dbContext.Appointments.Add(appointment);
        await dbContext.SaveChangesAsync(cancellationToken);

        var savedAppointment = await dbContext.Appointments
            .AsNoTracking()
            .Include(currentAppointment => currentAppointment.User)
            .Include(currentAppointment => currentAppointment.Doctor)
            .Include(currentAppointment => currentAppointment.Rating)
            .FirstAsync(currentAppointment => currentAppointment.AppointmentId == appointment.AppointmentId, cancellationToken);

        return MapAppointment(savedAppointment);
    }

    public async Task CancelAppointmentAsync(
        int appointmentId,
        int userId,
        UserRole role,
        string? cancellationReason,
        CancellationToken cancellationToken = default)
    {
        var appointment = await dbContext.Appointments.FirstOrDefaultAsync(
            currentAppointment => currentAppointment.AppointmentId == appointmentId,
            cancellationToken);

        if (appointment is null)
        {
            throw new NotFoundException("Appointment not found.");
        }

        if (role != UserRole.Admin && appointment.UserId != userId)
        {
            throw new ForbiddenException("You are not allowed to cancel this appointment.");
        }

        if (appointment.Status == AppointmentStatus.Cancelled)
        {
            throw new ValidationException("The appointment is already cancelled.");
        }

        appointment.Status = AppointmentStatus.Cancelled;
        appointment.CancellationReason = cancellationReason?.Trim();
        appointment.CancelledAtUtc = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<AppointmentResponseDto> UpdateAppointmentStatusAsync(
        int appointmentId,
        UpdateAppointmentStatusDto request,
        UserRole role,
        CancellationToken cancellationToken = default)
    {
        if (role != UserRole.Admin)
        {
            throw new ForbiddenException("Only admins can update appointment statuses.");
        }

        if (!Enum.TryParse<AppointmentStatus>(request.Status, true, out var status))
        {
            throw new ValidationException("The selected appointment status is invalid.");
        }

        var appointment = await dbContext.Appointments
            .Include(currentAppointment => currentAppointment.User)
            .Include(currentAppointment => currentAppointment.Doctor)
            .Include(currentAppointment => currentAppointment.Rating)
            .FirstOrDefaultAsync(currentAppointment => currentAppointment.AppointmentId == appointmentId, cancellationToken);

        if (appointment is null)
        {
            throw new NotFoundException("Appointment not found.");
        }

        appointment.Status = status;
        appointment.CancellationReason = status == AppointmentStatus.Cancelled ? request.CancellationReason?.Trim() : null;
        appointment.CancelledAtUtc = status == AppointmentStatus.Cancelled ? DateTime.UtcNow : null;

        await dbContext.SaveChangesAsync(cancellationToken);
        return MapAppointment(appointment);
    }

    private static AppointmentResponseDto MapAppointment(Appointment appointment) =>
        new()
        {
            AppointmentId = appointment.AppointmentId,
            UserId = appointment.UserId,
            UserName = appointment.User == null ? string.Empty : $"{appointment.User.FirstName} {appointment.User.LastName}".Trim(),
            DoctorId = appointment.DoctorId,
            DoctorName = appointment.Doctor?.FullName ?? string.Empty,
            AppointmentDate = appointment.AppointmentDate.ToString("yyyy-MM-dd"),
            TimeSlot = appointment.TimeSlot.ToString("HH:mm"),
            Status = appointment.Status.ToString(),
            ReasonForVisit = appointment.ReasonForVisit,
            CancellationReason = appointment.CancellationReason,
            CanRate = appointment.Status == AppointmentStatus.Completed && appointment.Rating is null
        };
}
