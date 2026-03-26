using Fracto.Api.Data;
using Fracto.Api.DTOs.Specializations;
using Fracto.Api.Helpers;
using Fracto.Api.Entities;
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

    public async Task<SpecializationResponseDto> CreateSpecializationAsync(
        SpecializationUpsertDto request,
        CancellationToken cancellationToken = default)
    {
        var name = NormalizeName(request.SpecializationName);

        var existing = await dbContext.Specializations
            .FirstOrDefaultAsync(spec => spec.SpecializationName.ToLower() == name.ToLower(), cancellationToken);

        if (existing is not null)
        {
            if (!existing.IsActive)
            {
                existing.IsActive = true;
                existing.Description = request.Description?.Trim();
                await dbContext.SaveChangesAsync(cancellationToken);
                return MapSpecialization(existing);
            }

            throw new ConflictException("A specialization with this name already exists.");
        }

        var specialization = new Specialization
        {
            SpecializationName = name,
            Description = request.Description?.Trim(),
            IsActive = request.IsActive
        };

        dbContext.Specializations.Add(specialization);
        await dbContext.SaveChangesAsync(cancellationToken);

        return MapSpecialization(specialization);
    }

    public async Task<SpecializationResponseDto> UpdateSpecializationAsync(
        int specializationId,
        SpecializationUpsertDto request,
        CancellationToken cancellationToken = default)
    {
        var specialization = await dbContext.Specializations.FirstOrDefaultAsync(
            spec => spec.SpecializationId == specializationId,
            cancellationToken);

        if (specialization is null)
        {
            throw new NotFoundException("Specialization not found.");
        }

        var name = NormalizeName(request.SpecializationName);
        var nameExists = await dbContext.Specializations
            .AnyAsync(spec => spec.SpecializationId != specializationId &&
                              spec.SpecializationName.ToLower() == name.ToLower(), cancellationToken);

        if (nameExists)
        {
            throw new ConflictException("Another specialization already uses this name.");
        }

        specialization.SpecializationName = name;
        specialization.Description = request.Description?.Trim();
        specialization.IsActive = request.IsActive;

        await dbContext.SaveChangesAsync(cancellationToken);
        return MapSpecialization(specialization);
    }

    public async Task DeleteSpecializationAsync(int specializationId, CancellationToken cancellationToken = default)
    {
        var specialization = await dbContext.Specializations.FirstOrDefaultAsync(
            spec => spec.SpecializationId == specializationId,
            cancellationToken);

        if (specialization is null)
        {
            throw new NotFoundException("Specialization not found.");
        }

        var hasDoctors = await dbContext.Doctors
            .AnyAsync(doc => doc.SpecializationId == specializationId && doc.IsActive, cancellationToken);

        if (hasDoctors)
        {
            throw new ValidationException("Deactivate or reassign doctors before deleting this specialization.");
        }

        specialization.IsActive = false;
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private static string NormalizeName(string input)
    {
        var trimmed = input?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(trimmed))
        {
            throw new ValidationException("Specialization name is required.");
        }

        return trimmed;
    }

    private static SpecializationResponseDto MapSpecialization(Specialization specialization) =>
        new()
        {
            SpecializationId = specialization.SpecializationId,
            SpecializationName = specialization.SpecializationName,
            Description = specialization.Description
        };
}
