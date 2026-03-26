using Fracto.Api.DTOs.Ratings;
using Fracto.Api.Entities;
using Fracto.Api.Helpers;
using Fracto.Api.Services.Implementations;
using Fracto.Api.Tests.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Fracto.Api.Tests.Services;

using ApiConflictException = Fracto.Api.Helpers.ConflictException;
using ApiForbiddenException = Fracto.Api.Helpers.ForbiddenException;
using ApiValidationException = Fracto.Api.Helpers.ValidationException;

public sealed class RatingServiceTests
{
    [Fact]
    public async Task CreateRatingAsync_PersistsRating_AndUpdatesDoctorSummary()
    {
        await using var dbFactory = new SqliteTestDbContextFactory();
        await using var dbContext = await dbFactory.CreateDbContextAsync();

        var specialization = new Specialization { SpecializationName = "Dermatologist" };
        var user = CreateUser("patient@example.com");
        var doctor = CreateDoctor("Dr. Rhea Nair");

        dbContext.Specializations.Add(specialization);
        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync();

        doctor.SpecializationId = specialization.SpecializationId;
        dbContext.Doctors.Add(doctor);
        await dbContext.SaveChangesAsync();

        var appointment = CreateAppointment(user.UserId, doctor.DoctorId, AppointmentStatus.Completed);
        dbContext.Appointments.Add(appointment);
        await dbContext.SaveChangesAsync();

        var service = new RatingService(dbContext);

        var response = await service.CreateRatingAsync(user.UserId, new RatingCreateDto
        {
            AppointmentId = appointment.AppointmentId,
            DoctorId = doctor.DoctorId,
            RatingValue = 4,
            ReviewComment = "Great experience"
        });

        Assert.Equal(4, response.RatingValue);
        Assert.Equal("Great experience", response.ReviewComment);

        var updatedDoctor = await dbContext.Doctors.AsNoTracking().FirstAsync(d => d.DoctorId == doctor.DoctorId);
        Assert.Equal(1, updatedDoctor.TotalReviews);
        Assert.Equal(4m, updatedDoctor.AverageRating);
    }

    [Fact]
    public async Task CreateRatingAsync_ThrowsWhenUserDoesNotOwnAppointment()
    {
        await using var dbFactory = new SqliteTestDbContextFactory();
        await using var dbContext = await dbFactory.CreateDbContextAsync();

        var specialization = new Specialization { SpecializationName = "Neurologist" };
        var owner = CreateUser("owner@example.com");
        var outsider = CreateUser("outsider@example.com");
        var doctor = CreateDoctor("Dr. Amrita Rao");

        dbContext.Specializations.Add(specialization);
        dbContext.Users.AddRange(owner, outsider);
        await dbContext.SaveChangesAsync();

        doctor.SpecializationId = specialization.SpecializationId;
        dbContext.Doctors.Add(doctor);
        await dbContext.SaveChangesAsync();

        var appointment = CreateAppointment(owner.UserId, doctor.DoctorId, AppointmentStatus.Completed);
        dbContext.Appointments.Add(appointment);
        await dbContext.SaveChangesAsync();

        var service = new RatingService(dbContext);

        await Assert.ThrowsAsync<ApiForbiddenException>(() =>
            service.CreateRatingAsync(outsider.UserId, new RatingCreateDto
            {
                AppointmentId = appointment.AppointmentId,
                DoctorId = doctor.DoctorId,
                RatingValue = 5
            }));
    }

    [Fact]
    public async Task CreateRatingAsync_ThrowsWhenAppointmentNotCompleted()
    {
        await using var dbFactory = new SqliteTestDbContextFactory();
        await using var dbContext = await dbFactory.CreateDbContextAsync();

        var specialization = new Specialization { SpecializationName = "Cardiologist" };
        var user = CreateUser("patient2@example.com");
        var doctor = CreateDoctor("Dr. Kiran Mehta");

        dbContext.Specializations.Add(specialization);
        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync();

        doctor.SpecializationId = specialization.SpecializationId;
        dbContext.Doctors.Add(doctor);
        await dbContext.SaveChangesAsync();

        var appointment = CreateAppointment(user.UserId, doctor.DoctorId, AppointmentStatus.Booked);
        dbContext.Appointments.Add(appointment);
        await dbContext.SaveChangesAsync();

        var service = new RatingService(dbContext);

        await Assert.ThrowsAsync<ApiValidationException>(() =>
            service.CreateRatingAsync(user.UserId, new RatingCreateDto
            {
                AppointmentId = appointment.AppointmentId,
                DoctorId = doctor.DoctorId,
                RatingValue = 5
            }));
    }

    [Fact]
    public async Task CreateRatingAsync_ThrowsWhenDuplicateRatingSubmitted()
    {
        await using var dbFactory = new SqliteTestDbContextFactory();
        await using var dbContext = await dbFactory.CreateDbContextAsync();

        var specialization = new Specialization { SpecializationName = "Pediatrician" };
        var user = CreateUser("repeat@example.com");
        var doctor = CreateDoctor("Dr. Nisha Roy");

        dbContext.Specializations.Add(specialization);
        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync();

        doctor.SpecializationId = specialization.SpecializationId;
        dbContext.Doctors.Add(doctor);
        await dbContext.SaveChangesAsync();

        var appointment = CreateAppointment(user.UserId, doctor.DoctorId, AppointmentStatus.Completed);
        dbContext.Appointments.Add(appointment);
        await dbContext.SaveChangesAsync();

        var service = new RatingService(dbContext);

        await service.CreateRatingAsync(user.UserId, new RatingCreateDto
        {
            AppointmentId = appointment.AppointmentId,
            DoctorId = doctor.DoctorId,
            RatingValue = 4
        });

        await Assert.ThrowsAsync<ApiConflictException>(() =>
            service.CreateRatingAsync(user.UserId, new RatingCreateDto
            {
                AppointmentId = appointment.AppointmentId,
                DoctorId = doctor.DoctorId,
                RatingValue = 3
            }));
    }

    private static Doctor CreateDoctor(string fullName) =>
        new()
        {
            FullName = fullName,
            City = "Chennai",
            ExperienceYears = 8,
            ConsultationFee = 600,
            AverageRating = 0,
            TotalReviews = 0,
            ConsultationStartTime = new TimeOnly(9, 0),
            ConsultationEndTime = new TimeOnly(12, 0),
            SlotDurationMinutes = 30,
            IsActive = true
        };

    private static User CreateUser(string email) =>
        new()
        {
            FirstName = "Test",
            LastName = "User",
            Email = email,
            PasswordHash = "hash",
            City = "Chennai",
            Role = UserRole.User,
            IsActive = true
        };

    private static Appointment CreateAppointment(int userId, int doctorId, AppointmentStatus status) =>
        new()
        {
            UserId = userId,
            DoctorId = doctorId,
            AppointmentDate = DateOnly.FromDateTime(DateTime.Now).AddDays(1),
            TimeSlot = new TimeOnly(9, 0),
            Status = status,
            BookedAtUtc = DateTime.UtcNow
        };
}
