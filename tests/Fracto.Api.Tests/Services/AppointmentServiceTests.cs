using Fracto.Api.DTOs.Appointments;
using Fracto.Api.Entities;
using Fracto.Api.Helpers;
using Fracto.Api.Services.Implementations;
using Fracto.Api.Tests.Infrastructure;

namespace Fracto.Api.Tests.Services;

using ApiConflictException = Fracto.Api.Helpers.ConflictException;
using ApiForbiddenException = Fracto.Api.Helpers.ForbiddenException;
using ApiValidationException = Fracto.Api.Helpers.ValidationException;

public sealed class AppointmentServiceTests
{
    [Fact]
    public async Task RescheduleAppointmentAsync_ThrowsConflict_WhenSlotIsTaken()
    {
        await using var dbFactory = new SqliteTestDbContextFactory();
        var appointmentDate = DateOnly.FromDateTime(DateTime.Now).AddDays(1);

        await using (var seedContext = await dbFactory.CreateDbContextAsync())
        {
            var specialization = new Specialization { SpecializationName = "Cardiologist" };
            var user = CreateUser("user1@example.com");
            var otherUser = CreateUser("user2@example.com");

            seedContext.Specializations.Add(specialization);
            seedContext.Users.AddRange(user, otherUser);
            await seedContext.SaveChangesAsync();

            var doctor = CreateDoctor("Dr. Ira Nair", specialization.SpecializationId);
            seedContext.Doctors.Add(doctor);
            await seedContext.SaveChangesAsync();

            seedContext.Appointments.AddRange(
                new Appointment
                {
                    UserId = user.UserId,
                    DoctorId = doctor.DoctorId,
                    AppointmentDate = appointmentDate,
                    TimeSlot = new TimeOnly(9, 0),
                    Status = AppointmentStatus.Booked
                },
                new Appointment
                {
                    UserId = otherUser.UserId,
                    DoctorId = doctor.DoctorId,
                    AppointmentDate = appointmentDate,
                    TimeSlot = new TimeOnly(9, 30),
                    Status = AppointmentStatus.Booked
                });

            await seedContext.SaveChangesAsync();
        }

        await using var dbContext = await dbFactory.CreateDbContextAsync();
        var service = new AppointmentService(dbContext);
        var appointmentId = dbContext.Appointments.Select(a => a.AppointmentId).First();
        var userId = dbContext.Appointments.Select(a => a.UserId).First();

        await Assert.ThrowsAsync<ApiConflictException>(() =>
            service.RescheduleAppointmentAsync(
                appointmentId,
                userId,
                UserRole.User,
                new RescheduleAppointmentRequestDto
                {
                    AppointmentDate = appointmentDate,
                    TimeSlot = "09:30"
                }));
    }

    [Fact]
    public async Task RescheduleAppointmentAsync_UpdatesDateAndTime()
    {
        await using var dbFactory = new SqliteTestDbContextFactory();
        var appointmentDate = DateOnly.FromDateTime(DateTime.Now).AddDays(1);

        await using (var seedContext = await dbFactory.CreateDbContextAsync())
        {
            var specialization = new Specialization { SpecializationName = "Dermatologist" };
            var user = CreateUser("user3@example.com");
            seedContext.Specializations.Add(specialization);
            seedContext.Users.Add(user);
            await seedContext.SaveChangesAsync();

            var doctor = CreateDoctor("Dr. Mira Das", specialization.SpecializationId);
            seedContext.Doctors.Add(doctor);
            await seedContext.SaveChangesAsync();

            seedContext.Appointments.Add(new Appointment
            {
                UserId = user.UserId,
                DoctorId = doctor.DoctorId,
                AppointmentDate = appointmentDate,
                TimeSlot = new TimeOnly(9, 0),
                Status = AppointmentStatus.Booked
            });

            await seedContext.SaveChangesAsync();
        }

        await using var dbContext = await dbFactory.CreateDbContextAsync();
        var service = new AppointmentService(dbContext);
        var appointmentId = dbContext.Appointments.Select(a => a.AppointmentId).First();
        var userId = dbContext.Appointments.Select(a => a.UserId).First();

        var updated = await service.RescheduleAppointmentAsync(
            appointmentId,
            userId,
            UserRole.User,
            new RescheduleAppointmentRequestDto
            {
                AppointmentDate = appointmentDate.AddDays(1),
                TimeSlot = "09:30"
            });

        Assert.Equal(appointmentDate.AddDays(1).ToString("yyyy-MM-dd"), updated.AppointmentDate);
        Assert.Equal("09:30", updated.TimeSlot);
    }

    [Fact]
    public async Task BookAppointmentAsync_ThrowsWhenSlotOutsideHours()
    {
        await using var dbFactory = new SqliteTestDbContextFactory();
        var appointmentDate = DateOnly.FromDateTime(DateTime.Now).AddDays(1);

        await using (var seedContext = await dbFactory.CreateDbContextAsync())
        {
            var specialization = new Specialization { SpecializationName = "Oncologist" };
            var user = CreateUser("user4@example.com");
            seedContext.Specializations.Add(specialization);
            seedContext.Users.Add(user);
            await seedContext.SaveChangesAsync();

            var doctor = CreateDoctor("Dr. Varun Rao", specialization.SpecializationId);
            doctor.ConsultationStartTime = new TimeOnly(9, 0);
            doctor.ConsultationEndTime = new TimeOnly(12, 0);
            doctor.SlotDurationMinutes = 30;

            seedContext.Doctors.Add(doctor);
            await seedContext.SaveChangesAsync();
        }

        await using var dbContext = await dbFactory.CreateDbContextAsync();
        var service = new AppointmentService(dbContext);
        var doctorId = dbContext.Doctors.Select(d => d.DoctorId).First();
        var userId = dbContext.Users.Select(u => u.UserId).First();

        var exception = await Assert.ThrowsAsync<ApiValidationException>(() =>
            service.BookAppointmentAsync(userId, new BookAppointmentRequestDto
            {
                DoctorId = doctorId,
                AppointmentDate = appointmentDate,
                TimeSlot = "13:00",
                ReasonForVisit = "Checkup"
            }));

        Assert.Equal("This time slot is outside of the doctor's practicing hours.", exception.Message);
    }

    [Fact]
    public async Task CancelAppointmentAsync_ThrowsForbidden_WhenUserDoesNotOwnAppointment()
    {
        await using var dbFactory = new SqliteTestDbContextFactory();
        var appointmentDate = DateOnly.FromDateTime(DateTime.Now).AddDays(1);

        await using (var seedContext = await dbFactory.CreateDbContextAsync())
        {
            var specialization = new Specialization { SpecializationName = "ENT" };
            var owner = CreateUser("owner@example.com");
            var otherUser = CreateUser("other@example.com");
            seedContext.Specializations.Add(specialization);
            seedContext.Users.AddRange(owner, otherUser);
            await seedContext.SaveChangesAsync();

            var doctor = CreateDoctor("Dr. Leena Shah", specialization.SpecializationId);
            seedContext.Doctors.Add(doctor);
            await seedContext.SaveChangesAsync();

            seedContext.Appointments.Add(new Appointment
            {
                UserId = owner.UserId,
                DoctorId = doctor.DoctorId,
                AppointmentDate = appointmentDate,
                TimeSlot = new TimeOnly(9, 0),
                Status = AppointmentStatus.Booked
            });

            await seedContext.SaveChangesAsync();
        }

        await using var dbContext = await dbFactory.CreateDbContextAsync();
        var service = new AppointmentService(dbContext);
        var appointmentId = dbContext.Appointments.Select(a => a.AppointmentId).First();
        var otherUserId = dbContext.Users.OrderBy(u => u.UserId).Select(u => u.UserId).Last();

        await Assert.ThrowsAsync<ApiForbiddenException>(() =>
            service.CancelAppointmentAsync(appointmentId, otherUserId, UserRole.User, "nope"));
    }

    [Fact]
    public async Task UpdateAppointmentStatusAsync_SetsCancellationMetadata()
    {
        await using var dbFactory = new SqliteTestDbContextFactory();
        var appointmentDate = DateOnly.FromDateTime(DateTime.Now).AddDays(1);

        await using (var seedContext = await dbFactory.CreateDbContextAsync())
        {
            var specialization = new Specialization { SpecializationName = "General" };
            var user = CreateUser("user5@example.com");
            seedContext.Specializations.Add(specialization);
            seedContext.Users.Add(user);
            await seedContext.SaveChangesAsync();

            var doctor = CreateDoctor("Dr. Sana Patel", specialization.SpecializationId);
            seedContext.Doctors.Add(doctor);
            await seedContext.SaveChangesAsync();

            seedContext.Appointments.Add(new Appointment
            {
                UserId = user.UserId,
                DoctorId = doctor.DoctorId,
                AppointmentDate = appointmentDate,
                TimeSlot = new TimeOnly(10, 0),
                Status = AppointmentStatus.Booked
            });

            await seedContext.SaveChangesAsync();
        }

        await using var dbContext = await dbFactory.CreateDbContextAsync();
        var service = new AppointmentService(dbContext);
        var appointmentId = dbContext.Appointments.Select(a => a.AppointmentId).First();

        var updated = await service.UpdateAppointmentStatusAsync(appointmentId, new UpdateAppointmentStatusDto
        {
            Status = "Cancelled",
            CancellationReason = "Patient unavailable"
        }, UserRole.Admin);

        Assert.Equal("Cancelled", updated.Status);
        Assert.Equal("Patient unavailable", updated.CancellationReason);
    }

    private static Doctor CreateDoctor(string fullName, int specializationId) =>
        new()
        {
            FullName = fullName,
            City = "Chennai",
            SpecializationId = specializationId,
            ExperienceYears = 10,
            ConsultationFee = 700,
            AverageRating = 4.5m,
            TotalReviews = 10,
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
}
