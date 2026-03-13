using Fracto.Api.DTOs.Appointments;
using Fracto.Api.DTOs.Common;
using Fracto.Api.Helpers;
using Fracto.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Fracto.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public sealed class AppointmentsController(IAppointmentService appointmentService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResponse<AppointmentResponseDto>>> GetAppointments(
        [FromQuery] string? status,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var response = await appointmentService.GetAppointmentsAsync(
            User.GetUserId(),
            User.GetUserRole(),
            status,
            pageNumber,
            pageSize,
            cancellationToken);

        return Ok(response);
    }

    [HttpPost("book")]
    public async Task<ActionResult<object>> BookAppointment(
        [FromBody] BookAppointmentRequestDto request,
        CancellationToken cancellationToken)
    {
        var appointment = await appointmentService.BookAppointmentAsync(User.GetUserId(), request, cancellationToken);
        return Ok(new
        {
            message = "Appointment booked successfully.",
            appointment
        });
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult<object>> CancelAppointment(
        int id,
        [FromQuery] string? reason,
        CancellationToken cancellationToken)
    {
        await appointmentService.CancelAppointmentAsync(
            id,
            User.GetUserId(),
            User.GetUserRole(),
            reason,
            cancellationToken);

        return Ok(new { message = "Appointment cancelled successfully." });
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}/status")]
    public async Task<ActionResult<AppointmentResponseDto>> UpdateAppointmentStatus(
        int id,
        [FromBody] UpdateAppointmentStatusDto request,
        CancellationToken cancellationToken)
    {
        var appointment = await appointmentService.UpdateAppointmentStatusAsync(
            id,
            request,
            User.GetUserRole(),
            cancellationToken);

        return Ok(appointment);
    }
}
