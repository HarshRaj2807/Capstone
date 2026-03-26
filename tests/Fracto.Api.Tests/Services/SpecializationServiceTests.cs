using Fracto.Api.Entities;
using Fracto.Api.Services.Implementations;
using Fracto.Api.Tests.Infrastructure;

namespace Fracto.Api.Tests.Services;

using ApiConflictException = Fracto.Api.Helpers.ConflictException;
using ApiValidationException = Fracto.Api.Helpers.ValidationException;

public sealed class SpecializationServiceTests
{
    [Fact]
    public async Task GetSpecializationsAsync_ReturnsOnlyActiveItemsInAlphabeticalOrder()
    {
        await using var dbFactory = new SqliteTestDbContextFactory();

        await using (var seedContext = await dbFactory.CreateDbContextAsync())
        {
            seedContext.Specializations.AddRange(
                new Specialization
                {
                    SpecializationName = "Neurologist",
                    Description = "Brain and nervous system specialist",
                    IsActive = true
                },
                new Specialization
                {
                    SpecializationName = "Cardiologist",
                    Description = "Heart specialist",
                    IsActive = true
                },
                new Specialization
                {
                    SpecializationName = "Dermatologist",
                    Description = "Skin specialist",
                    IsActive = false
                });

            await seedContext.SaveChangesAsync();
        }

        await using var queryContext = await dbFactory.CreateDbContextAsync();
        var service = new SpecializationService(queryContext);

        var result = await service.GetSpecializationsAsync();

        Assert.Equal(new[] { "Cardiologist", "Neurologist" }, result.Select(item => item.SpecializationName).ToArray());
        Assert.All(result, item => Assert.NotEqual("Dermatologist", item.SpecializationName));
    }

    [Fact]
    public async Task CreateSpecializationAsync_ReactivatesInactiveMatch()
    {
        await using var dbFactory = new SqliteTestDbContextFactory();

        await using (var seedContext = await dbFactory.CreateDbContextAsync())
        {
            seedContext.Specializations.Add(new Specialization
            {
                SpecializationName = "Oncologist",
                Description = "Cancer specialist",
                IsActive = false
            });
            await seedContext.SaveChangesAsync();
        }

        await using var dbContext = await dbFactory.CreateDbContextAsync();
        var service = new SpecializationService(dbContext);

        var created = await service.CreateSpecializationAsync(new DTOs.Specializations.SpecializationUpsertDto
        {
            SpecializationName = "Oncologist",
            Description = "Updated",
            IsActive = true
        });

        Assert.Equal("Oncologist", created.SpecializationName);
        Assert.True(dbContext.Specializations.Single().IsActive);
    }

    [Fact]
    public async Task CreateSpecializationAsync_ThrowsWhenNameExists()
    {
        await using var dbFactory = new SqliteTestDbContextFactory();
        await using var dbContext = await dbFactory.CreateDbContextAsync();

        dbContext.Specializations.Add(new Specialization { SpecializationName = "Dentist", IsActive = true });
        await dbContext.SaveChangesAsync();

        var service = new SpecializationService(dbContext);

        await Assert.ThrowsAsync<ApiConflictException>(() =>
            service.CreateSpecializationAsync(new DTOs.Specializations.SpecializationUpsertDto
            {
                SpecializationName = "Dentist",
                Description = "Dental care",
                IsActive = true
            }));
    }

    [Fact]
    public async Task DeleteSpecializationAsync_ThrowsWhenActiveDoctorsExist()
    {
        await using var dbFactory = new SqliteTestDbContextFactory();

        await using (var seedContext = await dbFactory.CreateDbContextAsync())
        {
            var specialization = new Specialization { SpecializationName = "Urologist", IsActive = true };
            seedContext.Specializations.Add(specialization);
            await seedContext.SaveChangesAsync();

            seedContext.Doctors.Add(new Doctor
            {
                FullName = "Dr. Tara Bose",
                SpecializationId = specialization.SpecializationId,
                City = "Delhi",
                ExperienceYears = 5,
                ConsultationFee = 450,
                ConsultationStartTime = new TimeOnly(9, 0),
                ConsultationEndTime = new TimeOnly(12, 0),
                SlotDurationMinutes = 30,
                AverageRating = 4.2m,
                TotalReviews = 5,
                IsActive = true
            });
            await seedContext.SaveChangesAsync();
        }

        await using var dbContext = await dbFactory.CreateDbContextAsync();
        var service = new SpecializationService(dbContext);
        var specializationId = dbContext.Specializations.Select(s => s.SpecializationId).Single();

        await Assert.ThrowsAsync<ApiValidationException>(() => service.DeleteSpecializationAsync(specializationId));
    }
}
