using Fracto.Api.DTOs.Specializations;

namespace Fracto.Api.Services.Interfaces;

public interface ISpecializationService
{
    Task<IReadOnlyCollection<SpecializationResponseDto>> GetSpecializationsAsync(CancellationToken cancellationToken = default);

    Task<SpecializationResponseDto> CreateSpecializationAsync(SpecializationUpsertDto request, CancellationToken cancellationToken = default);

    Task<SpecializationResponseDto> UpdateSpecializationAsync(int specializationId, SpecializationUpsertDto request, CancellationToken cancellationToken = default);

    Task DeleteSpecializationAsync(int specializationId, CancellationToken cancellationToken = default);
}
