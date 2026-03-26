using Fracto.Api.DTOs.Appointments;
using Fracto.Api.DTOs.Common;
using Fracto.Api.Helpers;
using Fracto.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Fracto.Api.Controllers;

/// <summary>
/// Handles all incoming HTTP requests related to medical appointments.
/// </summary>
[ApiController]
[Authorize]
[Route("api/[controller]")]
public sealed class AppointmentsController(IAppointmentService serviceForAppointments) : ControllerBase
{
    /// <summary>
    /// Retrieves a paginated collection of appointments based on filter criteria.
    /// </summary>
    /// <param name="appointmentStatus">Optional status filter (e.g., Booked, Completed).</param>
    /// <param name="pageNr">The 1-based page index to retrieve.</param>
    /// <param name="pageSizeLimit">The maximum number of records per result page.</param>
    /// <param name="token">Cancellation token for aborting the operation.</param>
    /// <returns>A paged response containing appointment details.</returns>
    [HttpGet]
    public async Task<ActionResult<PagedResponse<AppointmentResponseDto>>> GetAppointments(
        [FromQuery] string? appointmentStatus,
        [FromQuery] int pageNr = 1,
        [FromQuery] int pageSizeLimit = 10,
        CancellationToken token = default)
    {
        var appointmentResults = await serviceForAppointments.GetAppointmentsAsync(
            User.GetUserId(),
            User.GetUserRole(),
            appointmentStatus,
            pageNr,
            pageSizeLimit,
            token);

        return Ok(appointmentResults);
    }

    /// <summary>
    /// Schedules a new medical appointment for the authenticated user.
    /// </summary>
    /// <param name="bookingRequest">Data transfer object containing booking details.</param>
    /// <param name="token">Cancellation token for aborting the operation.</param>
    /// <returns>A success message and the created appointment object.</returns>
    [HttpPost("book")]
    public async Task<ActionResult<object>> BookAppointment(
        [FromBody] BookAppointmentRequestDto bookingRequest,
        CancellationToken token)
    {
        var newlyCreatedAppointment = await serviceForAppointments.BookAppointmentAsync(User.GetUserId(), bookingRequest, token);
        return Ok(new
        {
            message = "Your medical appointment has been successfully scheduled.",
            appointment = newlyCreatedAppointment
        });
    }

    /// <summary>
    /// Cancels an existing appointment provided it belongs to the user or admin is performing the action.
    /// </summary>
    /// <param name="appointmentId">The unique identifier of the appointment to cancel.</param>
    /// <param name="cancellationReason">Optional justification for cancelling.</param>
    /// <param name="token">Cancellation token for aborting the operation.</param>
    /// <returns>A confirmation message of the cancellation.</returns>
    [HttpDelete("{appointmentId:int}")]
    public async Task<ActionResult<object>> CancelAppointment(
        int appointmentId,
        [FromQuery] string? cancellationReason,
        CancellationToken token)
    {
        await serviceForAppointments.CancelAppointmentAsync(
            appointmentId,
            User.GetUserId(),
            User.GetUserRole(),
            cancellationReason,
            token);

        return Ok(new { message = "The selected appointment has been cancelled." });
    }

    /// <summary>
    /// Reschedules an appointment to a new date and time slot.
    /// </summary>
    /// <param name="appointmentId">The appointment identifier.</param>
    /// <param name="request">New scheduling details.</param>
    /// <param name="token">Cancellation token.</param>
    /// <returns>The updated appointment details.</returns>
    [HttpPut("{appointmentId:int}/reschedule")]
    public async Task<ActionResult<AppointmentResponseDto>> RescheduleAppointment(
        int appointmentId,
        [FromBody] RescheduleAppointmentRequestDto request,
        CancellationToken token)
    {
        var updated = await serviceForAppointments.RescheduleAppointmentAsync(
            appointmentId,
            User.GetUserId(),
            User.GetUserRole(),
            request,
            token);

        return Ok(updated);
    }

    /// <summary>
    /// Allows administrative staff to update the lifecycle status of an appointment.
    /// </summary>
    /// <param name="appointmentId">The unique identifier of the appointment.</param>
    /// <param name="statusUpdateRequest">Payload containing the new status value.</param>
    /// <param name="token">Cancellation token for aborting the operation.</param>
    /// <returns>The updated appointment details.</returns>
    [Authorize(Roles = "Admin")]
    [HttpPut("{appointmentId:int}/status")]
    public async Task<ActionResult<AppointmentResponseDto>> UpdateAppointmentStatus(
        int appointmentId,
        [FromBody] UpdateAppointmentStatusDto statusUpdateRequest,
        CancellationToken token)
    {
        var modifiedAppointment = await serviceForAppointments.UpdateAppointmentStatusAsync(
            appointmentId,
            statusUpdateRequest,
            User.GetUserRole(),
            token);

        return Ok(modifiedAppointment);
    }
}
