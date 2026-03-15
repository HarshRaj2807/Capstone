using Fracto.Api.DTOs.Specializations;
using Fracto.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Fracto.Api.Controllers;

/// <summary>
/// Provides information about various medical specializations available in the system.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public sealed class SpecializationsController(ISpecializationService medicalCategoryService) : ControllerBase
{
    /// <summary>
    /// Retrieves a complete list of all medical specializations.
    /// </summary>
    /// <param name="token">Cancellation token.</param>
    /// <returns>A collection of specialization details.</returns>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyCollection<SpecializationResponseDto>>> RetrieveAllSpecialties(CancellationToken token)
    {
        var specialties = await medicalCategoryService.GetSpecializationsAsync(token);
        return Ok(specialties);
    }
}
