# Fracto REST API Design

## Overview

This document describes the currently implemented Fracto API surface based on the live ASP.NET Core controllers and DTOs in the project.

### Base Path

- Local development base URL: `http://localhost:5104/api`
- All endpoints are rooted under `/api`
- Request and response format: `application/json` unless otherwise noted

### Authentication Header

Protected endpoints require:

```text
Authorization: Bearer <jwt-token>
```

### Standard Error Shape

The API uses centralized exception handling and returns errors in this format:

```json
{
  "message": "Human-readable error message."
}
```

## Response Conventions

### Paged Response Shape

Endpoints that return lists commonly use this envelope:

```json
{
  "pageNumber": 1,
  "pageSize": 10,
  "totalRecords": 25,
  "items": []
}
```

### Authorization Rules

| Access Level | Meaning |
| --- | --- |
| Public | endpoint can be called without a token |
| Authenticated | valid JWT required |
| Admin | valid JWT required and user role must be `Admin` |

## Authentication APIs

### POST /api/auth/register

- Access: `Public`
- Purpose: create a new user account and immediately return an authenticated session payload

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
  "token": "<jwt-token>",
  "expiresAtUtc": "2026-03-20T15:30:00Z",
  "user": {
    "userId": 12,
    "fullName": "Harsh Raj",
    "email": "harsh.raj@example.com",
    "role": "User",
    "city": "Bengaluru",
    "profileImagePath": null
  }
}
```

Common failure:

```json
{
  "message": "An account with this email already exists."
}
```

### POST /api/auth/login

- Access: `Public`
- Purpose: authenticate a user or admin and return a session payload

Request body:

```json
{
  "email": "user@fracto.com",
  "password": "User@123"
}
```

Success response:

```json
{
  "message": "Login successful.",
  "token": "<jwt-token>",
  "expiresAtUtc": "2026-03-20T15:30:00Z",
  "user": {
    "userId": 2,
    "fullName": "Harsh Raj",
    "email": "user@fracto.com",
    "role": "User",
    "city": "Bengaluru",
    "profileImagePath": null
  }
}
```

Failure response:

```json
{
  "message": "Invalid email or password."
}
```

### GET /api/auth/me

- Access: `Authenticated`
- Purpose: return the currently authenticated user summary

Success response:

```json
{
  "userId": 2,
  "fullName": "Harsh Raj",
  "email": "user@fracto.com",
  "role": "User",
  "city": "Bengaluru",
  "profileImagePath": null
}
```

### POST /api/auth/profile-image

- Access: `Authenticated`
- Content type: `multipart/form-data`
- Purpose: upload a profile image for the current user

Form fields:

| Field | Type | Required |
| --- | --- | --- |
| `file` | file | yes |

Success response:

```json
{
  "message": "Profile image uploaded successfully.",
  "path": "uploads/profiles/8dd2d4e2-4ef6-49a8-a86b-4c33f1d8f10e.png"
}
```

## Specialization APIs

### GET /api/specializations

- Access: `Public`
- Purpose: return active doctor specializations for search and admin forms

Success response:

```json
[
  {
    "specializationId": 1,
    "specializationName": "Cardiologist",
    "description": "Heart and blood vessel specialist"
  },
  {
    "specializationId": 2,
    "specializationName": "Dermatologist",
    "description": "Skin specialist"
  }
]
```

## Doctor APIs

### GET /api/doctors

- Access: `Public`
- Purpose: return a paginated list of active doctors

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
      "specializationId": 1,
      "specializationName": "Cardiologist",
      "city": "Bengaluru",
      "experienceYears": 12,
      "consultationFee": 800.0,
      "averageRating": 4.7,
      "totalReviews": 16,
      "consultationStartTime": "09:00",
      "consultationEndTime": "13:00",
      "slotDurationMinutes": 30,
      "profileImagePath": null,
      "availableSlots": []
    }
  ]
}
```

### GET /api/doctors/search

- Access: `Public`
- Purpose: search doctors by city, specialization, rating, and optional appointment date

Query parameters:

| Name | Type | Required | Notes |
| --- | --- | --- | --- |
| `city` | string | no | case-insensitive exact city match |
| `specializationId` | int | no | specialization filter |
| `minRating` | decimal | no | minimum average rating |
| `appointmentDate` | `yyyy-MM-dd` | no | includes generated available slots |
| `pageNumber` | int | no | default `1` |
| `pageSize` | int | no | default `10`, clamped by backend |

Example request:

```text
GET /api/doctors/search?city=Bengaluru&specializationId=1&minRating=4.5&appointmentDate=2026-03-24&pageNumber=1&pageSize=12
```

Success response:

```json
{
  "pageNumber": 1,
  "pageSize": 12,
  "totalRecords": 1,
  "items": [
    {
      "doctorId": 1,
      "fullName": "Dr. Ananya Mehta",
      "specializationId": 1,
      "specializationName": "Cardiologist",
      "city": "Bengaluru",
      "experienceYears": 12,
      "consultationFee": 800.0,
      "averageRating": 4.7,
      "totalReviews": 16,
      "consultationStartTime": "09:00",
      "consultationEndTime": "13:00",
      "slotDurationMinutes": 30,
      "profileImagePath": null,
      "availableSlots": [
        "09:00",
        "09:30",
        "10:00"
      ]
    }
  ]
}
```

### GET /api/doctors/{id}

- Access: `Public`
- Purpose: return one active doctor by id

Success response:

```json
{
  "doctorId": 1,
  "fullName": "Dr. Ananya Mehta",
  "specializationId": 1,
  "specializationName": "Cardiologist",
  "city": "Bengaluru",
  "experienceYears": 12,
  "consultationFee": 800.0,
  "averageRating": 4.7,
  "totalReviews": 16,
  "consultationStartTime": "09:00",
  "consultationEndTime": "13:00",
  "slotDurationMinutes": 30,
  "profileImagePath": null,
  "availableSlots": []
}
```

### GET /api/doctors/{id}/available-slots

- Access: `Public`
- Purpose: return open time slots for a doctor on a given date

Example request:

```text
GET /api/doctors/1/available-slots?date=2026-03-24
```

Success response:

```json
[
  "09:00",
  "09:30",
  "10:00"
]
```

### GET /api/doctors/{id}/ratings

- Access: `Public`
- Purpose: return the doctor rating summary and review list

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

### POST /api/doctors

- Access: `Admin`
- Purpose: create a new doctor profile

Request body:

```json
{
  "fullName": "Dr. Priya Nair",
  "specializationId": 3,
  "city": "Chennai",
  "experienceYears": 8,
  "consultationFee": 600.0,
  "consultationStartTime": "09:00:00",
  "consultationEndTime": "13:00:00",
  "slotDurationMinutes": 30,
  "profileImagePath": "/uploads/doctors/priya-nair.png",
  "isActive": true
}
```

Success response:

```json
{
  "doctorId": 7,
  "fullName": "Dr. Priya Nair",
  "specializationId": 3,
  "specializationName": "Dentist",
  "city": "Chennai",
  "experienceYears": 8,
  "consultationFee": 600.0,
  "averageRating": 0,
  "totalReviews": 0,
  "consultationStartTime": "09:00",
  "consultationEndTime": "13:00",
  "slotDurationMinutes": 30,
  "profileImagePath": "/uploads/doctors/priya-nair.png",
  "availableSlots": []
}
```

### PUT /api/doctors/{id}

- Access: `Admin`
- Purpose: update an existing doctor profile

Request body:

```json
{
  "fullName": "Dr. Priya Nair",
  "specializationId": 3,
  "city": "Chennai",
  "experienceYears": 9,
  "consultationFee": 650.0,
  "consultationStartTime": "10:00:00",
  "consultationEndTime": "14:00:00",
  "slotDurationMinutes": 30,
  "profileImagePath": "/uploads/doctors/priya-nair.png",
  "isActive": true
}
```

Success response:

```json
{
  "doctorId": 7,
  "fullName": "Dr. Priya Nair",
  "specializationId": 3,
  "specializationName": "Dentist",
  "city": "Chennai",
  "experienceYears": 9,
  "consultationFee": 650.0,
  "averageRating": 0,
  "totalReviews": 0,
  "consultationStartTime": "10:00",
  "consultationEndTime": "14:00",
  "slotDurationMinutes": 30,
  "profileImagePath": "/uploads/doctors/priya-nair.png",
  "availableSlots": []
}
```

### DELETE /api/doctors/{id}

- Access: `Admin`
- Purpose: deactivate a doctor profile from the active directory

Success response:

```json
{
  "message": "Doctor deleted successfully."
}
```

## Appointment APIs

### GET /api/appointments

- Access: `Authenticated`
- Purpose: return appointments for the current user, or all appointments when the caller is an admin

Query parameters:

| Name | Type | Required | Notes |
| --- | --- | --- | --- |
| `status` | string | no | `Booked`, `Confirmed`, `Completed`, or `Cancelled` |
| `pageNumber` | int | no | default `1` |
| `pageSize` | int | no | default `10` |

Success response:

```json
{
  "pageNumber": 1,
  "pageSize": 10,
  "totalRecords": 1,
  "items": [
    {
      "appointmentId": 101,
      "userId": 2,
      "userName": "Harsh Raj",
      "doctorId": 1,
      "doctorName": "Dr. Ananya Mehta",
      "appointmentDate": "2026-03-24",
      "timeSlot": "09:30",
      "status": "Booked",
      "reasonForVisit": "Routine heart check-up",
      "cancellationReason": null,
      "canRate": false
    }
  ]
}
```

### POST /api/appointments/book

- Access: `Authenticated`
- Purpose: book an appointment for the current user

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
    "userId": 2,
    "userName": "Harsh Raj",
    "doctorId": 1,
    "doctorName": "Dr. Ananya Mehta",
    "appointmentDate": "2026-03-24",
    "timeSlot": "09:30",
    "status": "Booked",
    "reasonForVisit": "Routine heart check-up",
    "cancellationReason": null,
    "canRate": false
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

- Access: `Authenticated`
- Purpose: cancel an appointment as the owner or as an admin
- Optional query parameter: `reason`

Example request:

```text
DELETE /api/appointments/101?reason=Schedule%20changed
```

Success response:

```json
{
  "message": "Appointment cancelled successfully."
}
```

### PUT /api/appointments/{id}/status

- Access: `Admin`
- Purpose: update an appointment status centrally from the admin workflow

Request body:

```json
{
  "status": "Completed",
  "cancellationReason": null
}
```

Success response:

```json
{
  "appointmentId": 101,
  "userId": 2,
  "userName": "Harsh Raj",
  "doctorId": 1,
  "doctorName": "Dr. Ananya Mehta",
  "appointmentDate": "2026-03-24",
  "timeSlot": "09:30",
  "status": "Completed",
  "reasonForVisit": "Routine heart check-up",
  "cancellationReason": null,
  "canRate": true
}
```

## Rating APIs

### POST /api/ratings

- Access: `Authenticated`
- Purpose: submit a rating for a completed appointment owned by the current user

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
  "message": "Rating submitted successfully.",
  "rating": {
    "ratingId": 21,
    "userName": "Harsh Raj",
    "ratingValue": 5,
    "reviewComment": "Very professional and explained the treatment clearly.",
    "createdAtUtc": "2026-03-25T09:45:00Z"
  }
}
```

Validation failure:

```json
{
  "message": "Rating can only be submitted for completed appointments."
}
```

## User Administration APIs

### GET /api/users

- Access: `Admin`
- Purpose: return a paginated user directory

Example request:

```text
GET /api/users?pageNumber=1&pageSize=10
```

Success response:

```json
{
  "pageNumber": 1,
  "pageSize": 10,
  "totalRecords": 2,
  "items": [
    {
      "userId": 2,
      "fullName": "Harsh Raj",
      "email": "user@fracto.com",
      "role": "User",
      "city": "Bengaluru",
      "isActive": true,
      "createdAtUtc": "2026-03-13T09:20:00Z"
    }
  ]
}
```

### PATCH /api/users/{id}/toggle-status

- Access: `Admin`
- Purpose: toggle a user between active and inactive states

Success response:

```json
{
  "message": "User status updated successfully."
}
```

## Common Status Codes

| Status | Meaning |
| --- | --- |
| `200 OK` | successful read, login, cancellation, toggle, or rating submission |
| `201 Created` | successful doctor creation |
| `400 Bad Request` | validation or request format problem |
| `401 Unauthorized` | missing or invalid JWT |
| `403 Forbidden` | authenticated but not allowed to access the resource |
| `404 Not Found` | requested entity does not exist |
| `409 Conflict` | duplicate email or slot/rating conflict |
| `500 Internal Server Error` | unexpected server-side failure |

## Related Documentation

- [JWT_Authentication_Flow.md](./JWT_Authentication_Flow.md)
- [ER_Diagram.md](./ER_Diagram.md)
- [Fracto_Project_Report.md](./Fracto_Project_Report.md)
