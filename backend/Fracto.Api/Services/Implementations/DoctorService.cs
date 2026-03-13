using Fracto.Api.Data;
using Fracto.Api.DTOs.Common;
using Fracto.Api.DTOs.Doctors;
using Fracto.Api.DTOs.Ratings;
using Fracto.Api.Entities;
using Fracto.Api.Helpers;
using Fracto.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Fracto.Api.Services.Implementations;

public sealed class DoctorService(FractoDbContext dbContext) : IDoctorService
{
    public async Task<PagedResponse<DoctorResponseDto>> GetDoctorsAsync(
        string? city,
        int? specializationId,
        decimal? minRating,
        DateOnly? appointmentDate,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        pageNumber = Math.Max(pageNumber, 1);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var query = dbContext.Doctors
            .AsNoTracking()
            .Include(doctor => doctor.Specialization)
            .Where(doctor => doctor.IsActive)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(city))
        {
            var normalizedCity = city.Trim().ToLower();
            query = query.Where(doctor => doctor.City.ToLower() == normalizedCity);
        }

        if (specializationId.HasValue)
        {
            query = query.Where(doctor => doctor.SpecializationId == specializationId.Value);
        }

        if (minRating.HasValue)
        {
            query = query.Where(doctor => doctor.AverageRating >= minRating.Value);
        }

        var totalRecords = await query.CountAsync(cancellationToken);
        var doctors = await query
            .OrderByDescending(doctor => doctor.AverageRating)
            .ThenBy(doctor => doctor.FullName)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var slotLookup = appointmentDate.HasValue
            ? await BuildSlotLookupAsync(doctors, appointmentDate.Value, cancellationToken)
            : new Dictionary<int, IReadOnlyCollection<string>>();

        return new PagedResponse<DoctorResponseDto>
        {
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalRecords = totalRecords,
            Items = doctors
                .Select(doctor => MapDoctor(doctor, slotLookup.GetValueOrDefault(doctor.DoctorId)))
                .ToArray()
        };
    }

    public async Task<DoctorResponseDto> GetDoctorByIdAsync(int doctorId, CancellationToken cancellationToken = default)
    {
        var doctor = await dbContext.Doctors
            .AsNoTracking()
            .Include(currentDoctor => currentDoctor.Specialization)
            .FirstOrDefaultAsync(currentDoctor => currentDoctor.DoctorId == doctorId && currentDoctor.IsActive, cancellationToken);

        return doctor is null
            ? throw new NotFoundException("Doctor not found.")
            : MapDoctor(doctor);
    }

    public async Task<IReadOnlyCollection<string>> GetAvailableSlotsAsync(int doctorId, DateOnly appointmentDate, CancellationToken cancellationToken = default)
    {
        var doctor = await dbContext.Doctors
            .AsNoTracking()
            .FirstOrDefaultAsync(currentDoctor => currentDoctor.DoctorId == doctorId && currentDoctor.IsActive, cancellationToken);

        if (doctor is null)
        {
            throw new NotFoundException("Doctor not found.");
        }

        return await BuildSlotsAsync(doctor, appointmentDate, cancellationToken);
    }

    public async Task<DoctorResponseDto> CreateDoctorAsync(DoctorUpsertDto request, CancellationToken cancellationToken = default)
    {
        await EnsureSpecializationExistsAsync(request.SpecializationId, cancellationToken);
        ValidateDoctorSchedule(request);

        var doctor = new Doctor
        {
            FullName = request.FullName.Trim(),
            SpecializationId = request.SpecializationId,
            City = request.City.Trim(),
            ExperienceYears = request.ExperienceYears,
            ConsultationFee = request.ConsultationFee,
            ConsultationStartTime = request.ConsultationStartTime,
            ConsultationEndTime = request.ConsultationEndTime,
            SlotDurationMinutes = request.SlotDurationMinutes,
            ProfileImagePath = request.ProfileImagePath,
            IsActive = request.IsActive
        };

        dbContext.Doctors.Add(doctor);
        await dbContext.SaveChangesAsync(cancellationToken);

        return await GetDoctorByIdAsync(doctor.DoctorId, cancellationToken);
    }

    public async Task<DoctorResponseDto> UpdateDoctorAsync(int doctorId, DoctorUpsertDto request, CancellationToken cancellationToken = default)
    {
        await EnsureSpecializationExistsAsync(request.SpecializationId, cancellationToken);
        ValidateDoctorSchedule(request);

        var doctor = await dbContext.Doctors.FirstOrDefaultAsync(currentDoctor => currentDoctor.DoctorId == doctorId, cancellationToken);
        if (doctor is null)
        {
            throw new NotFoundException("Doctor not found.");
        }

        doctor.FullName = request.FullName.Trim();
        doctor.SpecializationId = request.SpecializationId;
        doctor.City = request.City.Trim();
        doctor.ExperienceYears = request.ExperienceYears;
        doctor.ConsultationFee = request.ConsultationFee;
        doctor.ConsultationStartTime = request.ConsultationStartTime;
        doctor.ConsultationEndTime = request.ConsultationEndTime;
        doctor.SlotDurationMinutes = request.SlotDurationMinutes;
        doctor.ProfileImagePath = request.ProfileImagePath;
        doctor.IsActive = request.IsActive;
        doctor.UpdatedAtUtc = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);
        return await GetDoctorByIdAsync(doctorId, cancellationToken);
    }

    public async Task DeleteDoctorAsync(int doctorId, CancellationToken cancellationToken = default)
    {
        var doctor = await dbContext.Doctors.FirstOrDefaultAsync(currentDoctor => currentDoctor.DoctorId == doctorId, cancellationToken);
        if (doctor is null)
        {
            throw new NotFoundException("Doctor not found.");
        }

        doctor.IsActive = false;
        doctor.UpdatedAtUtc = DateTime.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<DoctorRatingsDto> GetRatingsAsync(int doctorId, CancellationToken cancellationToken = default)
    {
        var doctor = await dbContext.Doctors
            .AsNoTracking()
            .FirstOrDefaultAsync(currentDoctor => currentDoctor.DoctorId == doctorId && currentDoctor.IsActive, cancellationToken);

        if (doctor is null)
        {
            throw new NotFoundException("Doctor not found.");
        }

        var ratings = await dbContext.Ratings
            .AsNoTracking()
            .Where(rating => rating.DoctorId == doctorId)
            .Include(rating => rating.User)
            .OrderByDescending(rating => rating.CreatedAtUtc)
            .Select(rating => new RatingResponseDto
            {
                RatingId = rating.RatingId,
                UserName = rating.User == null
                    ? "Unknown User"
                    : $"{rating.User.FirstName} {rating.User.LastName}".Trim(),
                RatingValue = rating.RatingValue,
                ReviewComment = rating.ReviewComment,
                CreatedAtUtc = rating.CreatedAtUtc
            })
            .ToListAsync(cancellationToken);

        return new DoctorRatingsDto
        {
            DoctorId = doctor.DoctorId,
            AverageRating = doctor.AverageRating,
            TotalReviews = doctor.TotalReviews,
            Items = ratings
        };
    }

    private async Task EnsureSpecializationExistsAsync(int specializationId, CancellationToken cancellationToken)
    {
        var exists = await dbContext.Specializations
            .AnyAsync(specialization => specialization.SpecializationId == specializationId && specialization.IsActive, cancellationToken);

        if (!exists)
        {
            throw new ValidationException("The selected specialization is not valid.");
        }
    }

    private static void ValidateDoctorSchedule(DoctorUpsertDto request)
    {
        if (request.ConsultationEndTime <= request.ConsultationStartTime)
        {
            throw new ValidationException("Consultation end time must be later than the start time.");
        }
    }

    private async Task<Dictionary<int, IReadOnlyCollection<string>>> BuildSlotLookupAsync(
        IReadOnlyCollection<Doctor> doctors,
        DateOnly appointmentDate,
        CancellationToken cancellationToken)
    {
        var result = new Dictionary<int, IReadOnlyCollection<string>>();

        foreach (var doctor in doctors)
        {
            result[doctor.DoctorId] = await BuildSlotsAsync(doctor, appointmentDate, cancellationToken);
        }

        return result;
    }

    private async Task<IReadOnlyCollection<string>> BuildSlotsAsync(
        Doctor doctor,
        DateOnly appointmentDate,
        CancellationToken cancellationToken)
    {
        var takenSlots = await dbContext.Appointments
            .AsNoTracking()
            .Where(appointment =>
                appointment.DoctorId == doctor.DoctorId &&
                appointment.AppointmentDate == appointmentDate &&
                appointment.Status != AppointmentStatus.Cancelled)
            .Select(appointment => appointment.TimeSlot)
            .ToListAsync(cancellationToken);

        var occupiedSlots = takenSlots.ToHashSet();
        var slots = new List<string>();
        var currentSlot = doctor.ConsultationStartTime;

        // Generate all valid time slots from the doctor's configured working window.
        while (currentSlot < doctor.ConsultationEndTime)
        {
            if (!occupiedSlots.Contains(currentSlot))
            {
                slots.Add(currentSlot.ToString("HH:mm"));
            }

            currentSlot = currentSlot.AddMinutes(doctor.SlotDurationMinutes);
        }

        return slots;
    }

    private static DoctorResponseDto MapDoctor(Doctor doctor, IReadOnlyCollection<string>? availableSlots = null) =>
        new()
        {
            DoctorId = doctor.DoctorId,
            FullName = doctor.FullName,
            SpecializationId = doctor.SpecializationId,
            SpecializationName = doctor.Specialization?.SpecializationName ?? string.Empty,
            City = doctor.City,
            ExperienceYears = doctor.ExperienceYears,
            ConsultationFee = doctor.ConsultationFee,
            AverageRating = doctor.AverageRating,
            TotalReviews = doctor.TotalReviews,
            ConsultationStartTime = doctor.ConsultationStartTime.ToString("HH:mm"),
            ConsultationEndTime = doctor.ConsultationEndTime.ToString("HH:mm"),
            SlotDurationMinutes = doctor.SlotDurationMinutes,
            ProfileImagePath = doctor.ProfileImagePath,
            AvailableSlots = availableSlots ?? Array.Empty<string>()
        };
}
