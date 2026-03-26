using Fracto.Api.DTOs.Common;
using Fracto.Api.DTOs.Doctors;
using Fracto.Api.DTOs.Ratings;
using Fracto.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Fracto.Api.Controllers;

/// <summary>
/// Handles doctor-related data retrieval and management.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public sealed class DoctorsController(IDoctorService medicalProfessionalService) : ControllerBase
{
    /// <summary>
    /// Retrieves a paginated list of all active doctors.
    /// </summary>
    /// <param name="pIndex">The current page index.</param>
    /// <param name="pSize">Number of records per page.</param>
    /// <param name="token">Cancellation token.</param>
    /// <returns>A paginated list of doctors.</returns>
    [HttpGet]
    public async Task<ActionResult<PagedResponse<DoctorResponseDto>>> GetAllDoctors(
        [FromQuery] int pIndex = 1,
        [FromQuery] int pSize = 10,
        [FromQuery] bool includeInactive = false,
        CancellationToken token = default)
    {
        var allowInactive = includeInactive && User.IsInRole("Admin");
        var resultList = await medicalProfessionalService.GetDoctorsAsync(
            null,
            null,
            null,
            null,
            pIndex,
            pSize,
            allowInactive,
            token);
        return Ok(resultList);
    }

    /// <summary>
    /// Searches for doctors using specific filters like city, specialization, and rating.
    /// </summary>
    /// <param name="location">City name to filter by.</param>
    /// <param name="specId">Specialization identifier.</param>
    /// <param name="ratingFloor">Minimum average rating threshold.</param>
    /// <param name="preferredDate">Filter for availability on a specific date.</param>
    /// <param name="pIndex">Page number for results.</param>
    /// <param name="pSize">Page size for results.</param>
    /// <param name="token">Cancellation token.</param>
    /// <returns>A filtered and paginated list of doctors.</returns>
    [HttpGet("search")]
    public async Task<ActionResult<PagedResponse<DoctorResponseDto>>> SearchForDoctors(
        [FromQuery] string? location,
        [FromQuery] int? specId,
        [FromQuery] decimal? ratingFloor,
        [FromQuery] DateOnly? preferredDate,
        [FromQuery] int pIndex = 1,
        [FromQuery] int pSize = 10,
        CancellationToken token = default)
    {
        var filteredResult = await medicalProfessionalService.GetDoctorsAsync(
            location,
            specId,
            ratingFloor,
            preferredDate,
            pIndex,
            pSize,
            false,
            token);

        return Ok(filteredResult);
    }

    /// <summary>
    /// Gets detailed information for a specific doctor.
    /// </summary>
    /// <param name="docId">The unique ID of the doctor.</param>
    /// <param name="token">Cancellation token.</param>
    /// <returns>Doctor details.</returns>
    [HttpGet("{docId:int}")]
    public async Task<ActionResult<DoctorResponseDto>> GetDoctorByUniqueId(int docId, CancellationToken token)
    {
        var singleDoctor = await medicalProfessionalService.GetDoctorByIdAsync(docId, token);
        return Ok(singleDoctor);
    }

    /// <summary>
    /// Lists available consultation slots for a specific doctor on a given date.
    /// </summary>
    /// <param name="docId">The doctor identifier.</param>
    /// <param name="date">The target date for slots.</param>
    /// <param name="token">Cancellation token.</param>
    /// <returns>A collection of available slots.</returns>
    [HttpGet("{docId:int}/available-slots")]
    public async Task<ActionResult<IReadOnlyCollection<SlotDto>>> GetAvailableConsultationSlots(
        int docId,
        [FromQuery] DateOnly date,
        CancellationToken token)
    {
        var slotsList = await medicalProfessionalService.GetAvailableSlotsAsync(docId, date, token);
        return Ok(slotsList);
    }

    /// <summary>
    /// Retrieves feedback and ratings associated with a specific doctor.
    /// </summary>
    /// <param name="docId">Doctor ID.</param>
    /// <param name="token">Cancellation token.</param>
    /// <returns>Rating summary and individual reviews.</returns>
    [HttpGet("{docId:int}/ratings")]
    public async Task<ActionResult<DoctorRatingsDto>> GetDoctorFeedbackAndRatings(int docId, CancellationToken token)
    {
        var feedbackData = await medicalProfessionalService.GetRatingsAsync(docId, token);
        return Ok(feedbackData);
    }

    /// <summary>
    /// Adds a new doctor profile to the system.
    /// </summary>
    /// <param name="upsertData">Doctor creation details.</param>
    /// <param name="token">Cancellation token.</param>
    /// <returns>The created doctor record.</returns>
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<DoctorResponseDto>> CreateNewDoctorEntry(
        [FromBody] DoctorUpsertDto upsertData,
        CancellationToken token)
    {
        var newDoctor = await medicalProfessionalService.CreateDoctorAsync(upsertData, token);
        return CreatedAtAction(nameof(GetDoctorByUniqueId), new { docId = newDoctor.DoctorId }, newDoctor);
    }

    /// <summary>
    /// Updates an existing doctor's profile.
    /// </summary>
    /// <param name="docId">Identifier of the doctor to update.</param>
    /// <param name="upsertData">Revised doctor data.</param>
    /// <param name="token">Cancellation token.</param>
    /// <returns>The updated doctor record.</returns>
    [Authorize(Roles = "Admin")]
    [HttpPut("{docId:int}")]
    public async Task<ActionResult<DoctorResponseDto>> ModifyExistingDoctor(
        int docId,
        [FromBody] DoctorUpsertDto upsertData,
        CancellationToken token)
    {
        var updatedDoctor = await medicalProfessionalService.UpdateDoctorAsync(docId, upsertData, token);
        return Ok(updatedDoctor);
    }

    /// <summary>
    /// Permanently removes a doctor's profile from the system.
    /// </summary>
    /// <param name="docId">Doctor ID to be deleted.</param>
    /// <param name="token">Cancellation token.</param>
    /// <returns>A success indication.</returns>
    [Authorize(Roles = "Admin")]
    [HttpDelete("{docId:int}")]
    public async Task<ActionResult<object>> RemoveDoctorFromSystem(int docId, CancellationToken token)
    {
        await medicalProfessionalService.DeleteDoctorAsync(docId, token);
        return Ok(new { message = "The doctor's record has been successfully removed." });
    }
}
