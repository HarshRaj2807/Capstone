using Fracto.Api.DTOs.Specializations;

namespace Fracto.Api.Services.Interfaces;

public interface ISpecializationService
{
    Task<IReadOnlyCollection<SpecializationResponseDto>> GetSpecializationsAsync(CancellationToken cancellationToken = default);
}
