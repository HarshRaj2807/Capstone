# Appointment Booking Logic

## Booking Rules

The backend booking flow should enforce the following rules:

- Only authenticated users can book appointments.
- The selected doctor must exist and be active.
- The appointment date must be today or a future date according to business policy.
- The selected time slot must fall within the doctor's consultation window.
- The time slot must align with the doctor's slot duration.
- The slot must not already be occupied by another active appointment.
- A cancelled slot may be booked again.

## Pseudocode

```text
function bookAppointment(userId, doctorId, appointmentDate, timeSlot, reasonForVisit):
    doctor = getDoctorById(doctorId)
    if doctor is null or doctor.isActive is false:
        return failure("Doctor not found")

    if appointmentDate is in the past:
        return failure("Appointment date cannot be in the past")

    if timeSlot is outside doctor working window:
        return failure("Invalid time slot")

    if timeSlot does not match doctor slot duration:
        return failure("Time slot is not aligned with doctor schedule")

    existingAppointment = findActiveAppointment(doctorId, appointmentDate, timeSlot)
    if existingAppointment exists:
        return failure("Selected time slot is already booked")

    appointment = new Appointment
    appointment.userId = userId
    appointment.doctorId = doctorId
    appointment.appointmentDate = appointmentDate
    appointment.timeSlot = timeSlot
    appointment.reasonForVisit = reasonForVisit
    appointment.status = "Booked"

    save appointment
    return success(appointment)
```

## Example ASP.NET Core Service Code

```csharp
public async Task<AppointmentResponseDto> BookAppointmentAsync(
    int userId,
    BookAppointmentRequestDto request,
    CancellationToken cancellationToken = default)
{
    // Load the doctor profile and ensure the record is still active.
    var doctor = await _doctorRepository.GetActiveByIdAsync(request.DoctorId, cancellationToken);
    if (doctor is null)
    {
        throw new NotFoundException("Doctor not found.");
    }

    // Reject past dates so users cannot book historical appointments.
    if (request.AppointmentDate < DateOnly.FromDateTime(DateTime.UtcNow))
    {
        throw new ValidationException("Appointment date cannot be in the past.");
    }

    // Convert the requested slot into a strongly typed value for schedule checks.
    var slot = TimeOnly.Parse(request.TimeSlot);

    // Ensure the selected slot falls within the doctor's working hours.
    if (slot < doctor.ConsultationStartTime || slot >= doctor.ConsultationEndTime)
    {
        throw new ValidationException("Selected slot is outside the doctor's consultation hours.");
    }

    // Ensure the slot aligns with the doctor's configured interval, such as every 30 minutes.
    var minutesFromStart = (slot.ToTimeSpan() - doctor.ConsultationStartTime.ToTimeSpan()).TotalMinutes;
    if (minutesFromStart % doctor.SlotDurationMinutes != 0)
    {
        throw new ValidationException("Selected slot is not aligned with the doctor's schedule.");
    }

    // Check whether another active appointment already occupies the same slot.
    var isTaken = await _appointmentRepository.ExistsActiveSlotAsync(
        request.DoctorId,
        request.AppointmentDate,
        slot,
        cancellationToken);

    if (isTaken)
    {
        throw new ConflictException("Selected time slot is no longer available.");
    }

    // Create the appointment entity only after all business validations have passed.
    var appointment = new Appointment
    {
        UserId = userId,
        DoctorId = request.DoctorId,
        AppointmentDate = request.AppointmentDate,
        TimeSlot = slot,
        ReasonForVisit = request.ReasonForVisit,
        Status = AppointmentStatus.Booked,
        BookedAtUtc = DateTime.UtcNow
    };

    // Persist the booking and commit the unit of work.
    await _appointmentRepository.AddAsync(appointment, cancellationToken);
    await _unitOfWork.SaveChangesAsync(cancellationToken);

    // Return a focused response DTO instead of exposing the full entity.
    return new AppointmentResponseDto
    {
        AppointmentId = appointment.AppointmentId,
        DoctorId = appointment.DoctorId,
        AppointmentDate = appointment.AppointmentDate.ToString("yyyy-MM-dd"),
        TimeSlot = appointment.TimeSlot.ToString("HH:mm"),
        Status = appointment.Status.ToString()
    };
}
```

## Slot Availability Strategy

Available slots can be derived dynamically:

1. Build the doctor's daily slot list from `ConsultationStartTime`, `ConsultationEndTime`, and `SlotDurationMinutes`.
2. Load already-booked active appointments for the selected date.
3. Remove occupied slots.
4. Return the remaining list to the Angular frontend.

## Cancellation Logic

The cancellation API should:

- Confirm the appointment exists
- Confirm the caller owns the appointment or has admin role
- Mark the status as `Cancelled`
- Store `CancellationReason` and `CancelledAtUtc`
- Avoid physical deletion so the booking history remains auditable
