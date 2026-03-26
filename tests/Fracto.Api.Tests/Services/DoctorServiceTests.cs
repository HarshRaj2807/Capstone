using Fracto.Api.DTOs.Doctors;
using Fracto.Api.Entities;
using Fracto.Api.Services.Implementations;
using Fracto.Api.Tests.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Fracto.Api.Tests.Services;

using ApiValidationException = Fracto.Api.Helpers.ValidationException;

public sealed class DoctorServiceTests
{
    [Fact]
    public async Task GetDoctorsAsync_FiltersByCityAndMinRating_AndSortsByRatingThenName()
    {
        await using var dbFactory = new SqliteTestDbContextFactory();

        await using (var seedContext = await dbFactory.CreateDbContextAsync())
        {
            var specialization = new Specialization
            {
                SpecializationName = "Cardiologist"
            };

            seedContext.Specializations.Add(specialization);
            await seedContext.SaveChangesAsync();

            seedContext.Doctors.AddRange(
                CreateDoctor("Dr. Anika Rao", "Chennai", specialization.SpecializationId, averageRating: 4.8m),
                CreateDoctor("Dr. Bala Nair", "chennai", specialization.SpecializationId, averageRating: 4.5m),
                CreateDoctor("Dr. Cyrus Mehta", "Mumbai", specialization.SpecializationId, averageRating: 4.9m));

            await seedContext.SaveChangesAsync();
        }

        await using var queryContext = await dbFactory.CreateDbContextAsync();
        var service = new DoctorService(queryContext);

        var result = await service.GetDoctorsAsync(
            "  ChEnNaI  ",
            specializationId: null,
            minRating: 4.5m,
            appointmentDate: null,
            pageNumber: 0,
            pageSize: 999,
            includeInactive: false);

        Assert.Equal(1, result.PageNumber);
        Assert.Equal(50, result.PageSize);
        Assert.Equal(2, result.TotalRecords);
        Assert.Equal(new[] { "Dr. Anika Rao", "Dr. Bala Nair" }, result.Items.Select(item => item.FullName).ToArray());
    }

    [Fact]
    public async Task GetAvailableSlotsAsync_LeavesCancelledAppointmentsAvailable()
    {
        await using var dbFactory = new SqliteTestDbContextFactory();
        var appointmentDate = new DateOnly(2026, 3, 20);

        await using (var seedContext = await dbFactory.CreateDbContextAsync())
        {
            var specialization = new Specialization
            {
                SpecializationName = "Dentist"
            };
            var user = CreateUser();

            seedContext.Specializations.Add(specialization);
            seedContext.Users.Add(user);
            await seedContext.SaveChangesAsync();

            var doctor = CreateDoctor("Dr. Kavya Iyer", "Chennai", specialization.SpecializationId, averageRating: 4.2m);
            doctor.ConsultationStartTime = new TimeOnly(9, 0);
            doctor.ConsultationEndTime = new TimeOnly(11, 0);
            doctor.SlotDurationMinutes = 30;

            seedContext.Doctors.Add(doctor);
            await seedContext.SaveChangesAsync();

            seedContext.Appointments.AddRange(
                new Appointment
                {
                    UserId = user.UserId,
                    DoctorId = doctor.DoctorId,
                    AppointmentDate = appointmentDate,
                    TimeSlot = new TimeOnly(9, 30),
                    Status = AppointmentStatus.Booked
                },
                new Appointment
                {
                    UserId = user.UserId,
                    DoctorId = doctor.DoctorId,
                    AppointmentDate = appointmentDate,
                    TimeSlot = new TimeOnly(10, 0),
                    Status = AppointmentStatus.Cancelled
                });

            await seedContext.SaveChangesAsync();
        }

        await using var queryContext = await dbFactory.CreateDbContextAsync();
        var service = new DoctorService(queryContext);
        var doctorId = await queryContext.Doctors.Select(doctor => doctor.DoctorId).SingleAsync();

        var slots = await service.GetAvailableSlotsAsync(doctorId, appointmentDate);

        var availableSlots = slots.Where(slot => slot.IsAvailable).Select(slot => slot.Time).ToArray();
        Assert.Equal(new[] { "09:00", "10:00", "10:30" }, availableSlots);
    }

    [Fact]
    public async Task CreateDoctorAsync_ThrowsValidationException_WhenScheduleEndsBeforeItStarts()
    {
        await using var dbFactory = new SqliteTestDbContextFactory();

        await using var dbContext = await dbFactory.CreateDbContextAsync();
        var specialization = new Specialization
        {
            SpecializationName = "Neurologist"
        };

        dbContext.Specializations.Add(specialization);
        await dbContext.SaveChangesAsync();

        var service = new DoctorService(dbContext);
        var request = new DoctorUpsertDto
        {
            FullName = "Dr. Priya Menon",
            SpecializationId = specialization.SpecializationId,
            City = "Bengaluru",
            ExperienceYears = 12,
            ConsultationFee = 850,
            ConsultationStartTime = new TimeOnly(14, 0),
            ConsultationEndTime = new TimeOnly(13, 30),
            SlotDurationMinutes = 30,
            IsActive = true
        };

        var exception = await Assert.ThrowsAsync<ApiValidationException>(() => service.CreateDoctorAsync(request));

        Assert.Equal("Consultation end time must be later than the start time.", exception.Message);
        Assert.Empty(dbContext.Doctors);
    }

    [Fact]
    public async Task CreateDoctorAsync_TrimsPersistedFieldsAndReturnsMappedDoctor()
    {
        await using var dbFactory = new SqliteTestDbContextFactory();

        await using var dbContext = await dbFactory.CreateDbContextAsync();
        var specialization = new Specialization
        {
            SpecializationName = "Pediatrician"
        };

        dbContext.Specializations.Add(specialization);
        await dbContext.SaveChangesAsync();

        var service = new DoctorService(dbContext);
        var request = new DoctorUpsertDto
        {
            FullName = "  Dr. Rhea Thomas  ",
            SpecializationId = specialization.SpecializationId,
            City = "  Kochi ",
            ExperienceYears = 8,
            ConsultationFee = 600,
            ConsultationStartTime = new TimeOnly(10, 0),
            ConsultationEndTime = new TimeOnly(12, 0),
            SlotDurationMinutes = 30,
            ProfileImagePath = "/profiles/rhea.png",
            IsActive = true
        };

        var doctor = await service.CreateDoctorAsync(request);

        Assert.Equal("Dr. Rhea Thomas", doctor.FullName);
        Assert.Equal("Kochi", doctor.City);
        Assert.Equal("10:00", doctor.ConsultationStartTime);
        Assert.Equal("12:00", doctor.ConsultationEndTime);
        Assert.Equal("Pediatrician", doctor.SpecializationName);
    }

    private static Doctor CreateDoctor(string fullName, string city, int specializationId, decimal averageRating) =>
        new()
        {
            FullName = fullName,
            City = city,
            SpecializationId = specializationId,
            ExperienceYears = 10,
            ConsultationFee = 700,
            AverageRating = averageRating,
            TotalReviews = 12,
            ConsultationStartTime = new TimeOnly(9, 0),
            ConsultationEndTime = new TimeOnly(12, 0),
            SlotDurationMinutes = 30,
            IsActive = true
        };

    private static User CreateUser() =>
        new()
        {
            FirstName = "Test",
            LastName = "User",
            Email = "test.user@example.com",
            PasswordHash = "hash",
            City = "Chennai",
            Role = UserRole.User,
            IsActive = true
        };
}
