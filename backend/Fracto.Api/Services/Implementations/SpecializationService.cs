using Fracto.Api.Data;
using Fracto.Api.DTOs.Specializations;
using Fracto.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Fracto.Api.Services.Implementations;

public sealed class SpecializationService(FractoDbContext dbContext) : ISpecializationService
{
    public async Task<IReadOnlyCollection<SpecializationResponseDto>> GetSpecializationsAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext.Specializations
            .AsNoTracking()
            .Where(specialization => specialization.IsActive)
            .OrderBy(specialization => specialization.SpecializationName)
            .Select(specialization => new SpecializationResponseDto
            {
                SpecializationId = specialization.SpecializationId,
                SpecializationName = specialization.SpecializationName,
                Description = specialization.Description
            })
            .ToListAsync(cancellationToken);
    }
}
