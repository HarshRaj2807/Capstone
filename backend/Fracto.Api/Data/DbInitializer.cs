using Fracto.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace Fracto.Api.Data;

public static class DbInitializer
{
    public static async Task InitializeAsync(IServiceProvider services)
    {
        await using var scope = services.CreateAsyncScope();
        var serviceProvider = scope.ServiceProvider;

        var dbContext = serviceProvider.GetRequiredService<FractoDbContext>();
        var environment = serviceProvider.GetRequiredService<IWebHostEnvironment>();

        var webRootPath = environment.WebRootPath;
        if (string.IsNullOrWhiteSpace(webRootPath))
        {
            webRootPath = Path.Combine(environment.ContentRootPath, "wwwroot");
        }

        Directory.CreateDirectory(Path.Combine(webRootPath, "uploads", "profiles"));
        Directory.CreateDirectory(Path.Combine(webRootPath, "uploads", "doctors"));

        await dbContext.Database.EnsureCreatedAsync();

        if (!await dbContext.Specializations.AnyAsync())
        {
            var specializations = new[]
            {
                new Specialization { SpecializationName = "Cardiologist", Description = "Heart and blood vessel specialist" },
                new Specialization { SpecializationName = "Dermatologist", Description = "Skin specialist" },
                new Specialization { SpecializationName = "Dentist", Description = "Oral and dental care specialist" },
                new Specialization { SpecializationName = "Neurologist", Description = "Brain and nervous system specialist" },
                new Specialization { SpecializationName = "Pediatrician", Description = "Child healthcare specialist" }
            };

            await dbContext.Specializations.AddRangeAsync(specializations);
            await dbContext.SaveChangesAsync();
        }

        if (!await dbContext.Users.AnyAsync())
        {
            var users = new[]
            {
                new User
                {
                    FirstName = "System",
                    LastName = "Admin",
                    Email = "admin@fracto.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                    Role = UserRole.Admin,
                    City = "Bengaluru"
                },
                new User
                {
                    FirstName = "Harsh",
                    LastName = "Raj",
                    Email = "user@fracto.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("User@123"),
                    Role = UserRole.User,
                    City = "Bengaluru"
                }
            };

            await dbContext.Users.AddRangeAsync(users);
            await dbContext.SaveChangesAsync();
        }

        if (!await dbContext.Doctors.AnyAsync())
        {
            var specializations = await dbContext.Specializations
                .OrderBy(specialization => specialization.SpecializationId)
                .ToListAsync();

            var doctors = new[]
            {
                new Doctor
                {
                    FullName = "Dr. Ananya Mehta",
                    SpecializationId = specializations[0].SpecializationId,
                    City = "Bengaluru",
                    ExperienceYears = 12,
                    ConsultationFee = 800,
                    AverageRating = 4.7m,
                    TotalReviews = 15,
                    ConsultationStartTime = new TimeOnly(9, 0),
                    ConsultationEndTime = new TimeOnly(13, 0),
                    SlotDurationMinutes = 30,
                    ProfileImagePath = null
                },
                new Doctor
                {
                    FullName = "Dr. Rohan Kapoor",
                    SpecializationId = specializations[1].SpecializationId,
                    City = "Mumbai",
                    ExperienceYears = 9,
                    ConsultationFee = 650,
                    AverageRating = 4.4m,
                    TotalReviews = 11,
                    ConsultationStartTime = new TimeOnly(10, 0),
                    ConsultationEndTime = new TimeOnly(14, 0),
                    SlotDurationMinutes = 30,
                    ProfileImagePath = null
                },
                new Doctor
                {
                    FullName = "Dr. Sneha Verma",
                    SpecializationId = specializations[4].SpecializationId,
                    City = "Delhi",
                    ExperienceYears = 14,
                    ConsultationFee = 700,
                    AverageRating = 4.9m,
                    TotalReviews = 25,
                    ConsultationStartTime = new TimeOnly(8, 30),
                    ConsultationEndTime = new TimeOnly(12, 30),
                    SlotDurationMinutes = 20,
                    ProfileImagePath = null
                }
            };

            await dbContext.Doctors.AddRangeAsync(doctors);
            await dbContext.SaveChangesAsync();
        }
    }
}
