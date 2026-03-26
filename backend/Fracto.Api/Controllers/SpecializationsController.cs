using Fracto.Api.DTOs.Specializations;
using Fracto.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
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

    /// <summary>
    /// Adds a new specialization (admin only).
    /// </summary>
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<SpecializationResponseDto>> CreateSpecialization(
        [FromBody] SpecializationUpsertDto request,
        CancellationToken token)
    {
        var created = await medicalCategoryService.CreateSpecializationAsync(request, token);
        return CreatedAtAction(nameof(RetrieveAllSpecialties), new { }, created);
    }

    /// <summary>
    /// Updates an existing specialization (admin only).
    /// </summary>
    [Authorize(Roles = "Admin")]
    [HttpPut("{specializationId:int}")]
    public async Task<ActionResult<SpecializationResponseDto>> UpdateSpecialization(
        int specializationId,
        [FromBody] SpecializationUpsertDto request,
        CancellationToken token)
    {
        var updated = await medicalCategoryService.UpdateSpecializationAsync(specializationId, request, token);
        return Ok(updated);
    }

    /// <summary>
    /// Deactivates a specialization (admin only).
    /// </summary>
    [Authorize(Roles = "Admin")]
    [HttpDelete("{specializationId:int}")]
    public async Task<ActionResult<object>> DeleteSpecialization(int specializationId, CancellationToken token)
    {
        await medicalCategoryService.DeleteSpecializationAsync(specializationId, token);
        return Ok(new { message = "Specialization has been deactivated." });
    }
}
