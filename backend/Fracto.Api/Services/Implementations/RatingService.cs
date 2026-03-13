using Fracto.Api.Data;
using Fracto.Api.DTOs.Ratings;
using Fracto.Api.Entities;
using Fracto.Api.Helpers;
using Fracto.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Fracto.Api.Services.Implementations;

public sealed class RatingService(FractoDbContext dbContext) : IRatingService
{
    public async Task<RatingResponseDto> CreateRatingAsync(
        int userId,
        RatingCreateDto request,
        CancellationToken cancellationToken = default)
    {
        var appointment = await dbContext.Appointments
            .Include(currentAppointment => currentAppointment.User)
            .Include(currentAppointment => currentAppointment.Doctor)
            .Include(currentAppointment => currentAppointment.Rating)
            .FirstOrDefaultAsync(currentAppointment => currentAppointment.AppointmentId == request.AppointmentId, cancellationToken);

        if (appointment is null)
        {
            throw new NotFoundException("Appointment not found.");
        }

        if (appointment.UserId != userId)
        {
            throw new ForbiddenException("You can only rate your own completed appointments.");
        }

        if (appointment.DoctorId != request.DoctorId)
        {
            throw new ValidationException("The selected doctor does not match the appointment.");
        }

        if (appointment.Status != AppointmentStatus.Completed)
        {
            throw new ValidationException("Rating can only be submitted for completed appointments.");
        }

        if (appointment.Rating is not null)
        {
            throw new ConflictException("A rating has already been submitted for this appointment.");
        }

        var rating = new Rating
        {
            AppointmentId = appointment.AppointmentId,
            UserId = appointment.UserId,
            DoctorId = appointment.DoctorId,
            RatingValue = request.RatingValue,
            ReviewComment = request.ReviewComment?.Trim(),
            CreatedAtUtc = DateTime.UtcNow
        };

        dbContext.Ratings.Add(rating);
        await dbContext.SaveChangesAsync(cancellationToken);

        await UpdateDoctorSummaryAsync(appointment.DoctorId, cancellationToken);

        return new RatingResponseDto
        {
            RatingId = rating.RatingId,
            UserName = appointment.User == null
                ? string.Empty
                : $"{appointment.User.FirstName} {appointment.User.LastName}".Trim(),
            RatingValue = rating.RatingValue,
            ReviewComment = rating.ReviewComment,
            CreatedAtUtc = rating.CreatedAtUtc
        };
    }

    private async Task UpdateDoctorSummaryAsync(int doctorId, CancellationToken cancellationToken)
    {
        var doctor = await dbContext.Doctors.FirstOrDefaultAsync(currentDoctor => currentDoctor.DoctorId == doctorId, cancellationToken);
        if (doctor is null)
        {
            return;
        }

        var ratingSummary = await dbContext.Ratings
            .Where(rating => rating.DoctorId == doctorId)
            .GroupBy(_ => 1)
            .Select(group => new
            {
                Count = group.Count(),
                Average = group.Average(rating => rating.RatingValue)
            })
            .FirstOrDefaultAsync(cancellationToken);

        doctor.TotalReviews = ratingSummary?.Count ?? 0;
        doctor.AverageRating = ratingSummary is null
            ? 0
            : Math.Round((decimal)ratingSummary.Average, 2);

        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
