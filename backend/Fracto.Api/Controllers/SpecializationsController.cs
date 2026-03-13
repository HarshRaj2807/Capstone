using Fracto.Api.DTOs.Specializations;
using Fracto.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Fracto.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class SpecializationsController(ISpecializationService specializationService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyCollection<SpecializationResponseDto>>> GetSpecializations(CancellationToken cancellationToken)
    {
        var response = await specializationService.GetSpecializationsAsync(cancellationToken);
        return Ok(response);
    }
}
