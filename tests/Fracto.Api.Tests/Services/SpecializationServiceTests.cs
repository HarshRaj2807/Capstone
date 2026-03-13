using Fracto.Api.Entities;
using Fracto.Api.Services.Implementations;
using Fracto.Api.Tests.Infrastructure;

namespace Fracto.Api.Tests.Services;

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
}
