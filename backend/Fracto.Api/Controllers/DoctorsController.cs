using Fracto.Api.DTOs.Common;
using Fracto.Api.DTOs.Doctors;
using Fracto.Api.DTOs.Ratings;
using Fracto.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Fracto.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class DoctorsController(IDoctorService doctorService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResponse<DoctorResponseDto>>> GetDoctors(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var response = await doctorService.GetDoctorsAsync(null, null, null, null, pageNumber, pageSize, cancellationToken);
        return Ok(response);
    }

    [HttpGet("search")]
    public async Task<ActionResult<PagedResponse<DoctorResponseDto>>> SearchDoctors(
        [FromQuery] string? city,
        [FromQuery] int? specializationId,
        [FromQuery] decimal? minRating,
        [FromQuery] DateOnly? appointmentDate,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var response = await doctorService.GetDoctorsAsync(
            city,
            specializationId,
            minRating,
            appointmentDate,
            pageNumber,
            pageSize,
            cancellationToken);

        return Ok(response);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<DoctorResponseDto>> GetDoctorById(int id, CancellationToken cancellationToken)
    {
        var doctor = await doctorService.GetDoctorByIdAsync(id, cancellationToken);
        return Ok(doctor);
    }

    [HttpGet("{id:int}/available-slots")]
    public async Task<ActionResult<IReadOnlyCollection<string>>> GetAvailableSlots(
        int id,
        [FromQuery] DateOnly date,
        CancellationToken cancellationToken)
    {
        var slots = await doctorService.GetAvailableSlotsAsync(id, date, cancellationToken);
        return Ok(slots);
    }

    [HttpGet("{id:int}/ratings")]
    public async Task<ActionResult<DoctorRatingsDto>> GetDoctorRatings(int id, CancellationToken cancellationToken)
    {
        var ratings = await doctorService.GetRatingsAsync(id, cancellationToken);
        return Ok(ratings);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<DoctorResponseDto>> CreateDoctor(
        [FromBody] DoctorUpsertDto request,
        CancellationToken cancellationToken)
    {
        var doctor = await doctorService.CreateDoctorAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetDoctorById), new { id = doctor.DoctorId }, doctor);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<DoctorResponseDto>> UpdateDoctor(
        int id,
        [FromBody] DoctorUpsertDto request,
        CancellationToken cancellationToken)
    {
        var doctor = await doctorService.UpdateDoctorAsync(id, request, cancellationToken);
        return Ok(doctor);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<ActionResult<object>> DeleteDoctor(int id, CancellationToken cancellationToken)
    {
        await doctorService.DeleteDoctorAsync(id, cancellationToken);
        return Ok(new { message = "Doctor deleted successfully." });
    }
}
