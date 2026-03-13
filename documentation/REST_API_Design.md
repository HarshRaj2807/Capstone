# Fracto REST API Design

## API Standards

- Base URL: `https://api.fracto.com`
- Content type: `application/json`
- Authentication header: `Authorization: Bearer <token>`
- Protected endpoints require a valid JWT unless explicitly marked as public.

## Authentication APIs

### POST /api/auth/register

Purpose: register a new user account.

Request body:

```json
{
  "firstName": "Harsh",
  "lastName": "Raj",
  "email": "harsh.raj@example.com",
  "password": "StrongPassword@123",
  "phoneNumber": "9876543210",
  "city": "Bengaluru"
}
```

Success response:

```json
{
  "message": "Registration successful.",
  "user": {
    "userId": 12,
    "fullName": "Harsh Raj",
    "email": "harsh.raj@example.com",
    "role": "User"
  }
}
```

### POST /api/auth/login

Purpose: authenticate user or admin and issue a JWT token.

Request body:

```json
{
  "email": "harsh.raj@example.com",
  "password": "StrongPassword@123"
}
```

Success response:

```json
{
  "token": "<jwt-token>",
  "expiresAtUtc": "2026-03-20T15:30:00Z",
  "user": {
    "userId": 12,
    "fullName": "Harsh Raj",
    "email": "harsh.raj@example.com",
    "role": "User"
  }
}
```

Failure response:

```json
{
  "message": "Invalid email or password."
}
```

## Doctor APIs

### GET /api/doctors

Purpose: return a paginated list of active doctors.

Example request:

```text
GET /api/doctors?pageNumber=1&pageSize=10
```

Success response:

```json
{
  "pageNumber": 1,
  "pageSize": 10,
  "totalRecords": 3,
  "items": [
    {
      "doctorId": 1,
      "fullName": "Dr. Ananya Mehta",
      "specializationName": "Cardiologist",
      "city": "Bengaluru",
      "averageRating": 4.7,
      "consultationFee": 800.0
    }
  ]
}
```

### GET /api/doctors/search

Purpose: search doctors using city, specialization, rating, and date filters.

Example request:

```text
GET /api/doctors/search?city=Bengaluru&specializationId=1&minRating=4.5&appointmentDate=2026-03-24
```

Success response:

```json
{
  "filters": {
    "city": "Bengaluru",
    "specializationId": 1,
    "minRating": 4.5,
    "appointmentDate": "2026-03-24"
  },
  "items": [
    {
      "doctorId": 1,
      "fullName": "Dr. Ananya Mehta",
      "specializationName": "Cardiologist",
      "city": "Bengaluru",
      "averageRating": 4.7,
      "experienceYears": 12,
      "availableSlots": [
        "09:00",
        "09:30",
        "10:00"
      ]
    }
  ]
}
```

### POST /api/doctors

Purpose: create a new doctor profile.  
Authorization: `Admin`

Request body:

```json
{
  "fullName": "Dr. Priya Nair",
  "specializationId": 3,
  "city": "Chennai",
  "experienceYears": 8,
  "consultationFee": 600.0,
  "consultationStartTime": "09:00",
  "consultationEndTime": "13:00",
  "slotDurationMinutes": 30,
  "profileImagePath": "uploads/doctors/priya-nair.jpg"
}
```

Success response:

```json
{
  "message": "Doctor created successfully.",
  "doctorId": 7
}
```

### PUT /api/doctors/{id}

Purpose: update doctor details.  
Authorization: `Admin`

Request body:

```json
{
  "fullName": "Dr. Priya Nair",
  "specializationId": 3,
  "city": "Chennai",
  "experienceYears": 9,
  "consultationFee": 650.0,
  "consultationStartTime": "10:00",
  "consultationEndTime": "14:00",
  "slotDurationMinutes": 30,
  "isActive": true
}
```

Success response:

```json
{
  "message": "Doctor updated successfully."
}
```

### DELETE /api/doctors/{id}

Purpose: deactivate or remove a doctor profile.  
Authorization: `Admin`

Success response:

```json
{
  "message": "Doctor deleted successfully."
}
```

## Appointment APIs

### GET /api/appointments

Purpose: list appointments for the logged-in user. Admin users may optionally receive all appointments.

Example request:

```text
GET /api/appointments?status=Booked&pageNumber=1&pageSize=10
```

Success response:

```json
{
  "items": [
    {
      "appointmentId": 101,
      "doctorId": 1,
      "doctorName": "Dr. Ananya Mehta",
      "appointmentDate": "2026-03-24",
      "timeSlot": "09:30",
      "status": "Booked"
    }
  ],
  "pageNumber": 1,
  "pageSize": 10,
  "totalRecords": 1
}
```

### POST /api/appointments/book

Purpose: book an appointment for the logged-in user.

Request body:

```json
{
  "doctorId": 1,
  "appointmentDate": "2026-03-24",
  "timeSlot": "09:30",
  "reasonForVisit": "Routine heart check-up"
}
```

Success response:

```json
{
  "message": "Appointment booked successfully.",
  "appointment": {
    "appointmentId": 101,
    "doctorId": 1,
    "doctorName": "Dr. Ananya Mehta",
    "appointmentDate": "2026-03-24",
    "timeSlot": "09:30",
    "status": "Booked"
  }
}
```

Conflict response:

```json
{
  "message": "Selected time slot is no longer available."
}
```

### DELETE /api/appointments/{id}

Purpose: cancel an appointment.  
Authorization: owner user or admin

Success response:

```json
{
  "message": "Appointment cancelled successfully."
}
```

## Rating APIs

### POST /api/ratings

Purpose: submit a rating after a completed appointment.

Request body:

```json
{
  "appointmentId": 101,
  "doctorId": 1,
  "ratingValue": 5,
  "reviewComment": "Very professional and explained the treatment clearly."
}
```

Success response:

```json
{
  "message": "Rating submitted successfully."
}
```

Validation failure response:

```json
{
  "message": "Rating can only be submitted for completed appointments."
}
```

### GET /api/doctors/{id}/ratings

Purpose: retrieve ratings and reviews for a doctor.

Success response:

```json
{
  "doctorId": 1,
  "averageRating": 4.7,
  "totalReviews": 16,
  "items": [
    {
      "ratingId": 21,
      "userName": "Harsh Raj",
      "ratingValue": 5,
      "reviewComment": "Very professional and explained the treatment clearly.",
      "createdAtUtc": "2026-03-25T09:45:00Z"
    }
  ]
}
```

## Recommended Additional Endpoints

The following endpoints are highly useful in the actual implementation:

- `GET /api/specializations`
- `GET /api/doctors/{id}`
- `GET /api/doctors/{id}/available-slots?date=2026-03-24`
- `GET /api/users`
- `PUT /api/appointments/{id}/status`

## Common Response Codes

- `200 OK`: successful read or update
- `201 Created`: successful resource creation
- `400 Bad Request`: invalid request data
- `401 Unauthorized`: missing or invalid token
- `403 Forbidden`: authenticated but not allowed
- `404 Not Found`: resource not available
- `409 Conflict`: duplicate email or slot booking conflict
- `500 Internal Server Error`: unexpected failure
