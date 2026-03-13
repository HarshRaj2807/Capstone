# Fracto Textual ER Diagram

## ER Diagram

```text
Users (1) --------------------< (M) Appointments (M) >-------------------- (1) Doctors
  |                                                                       |
  |                                                                       |
  |                                                                       v
  |                                                              Specializations
  |                                                                     (1)
  |
  v
Ratings (M) ------------------------------------------------------------> Doctors (1)
  ^
  |
Appointments (1)
```

## Relationship Explanation

### Users -> Appointments

- Cardinality: `1 : many`
- One user can book many appointments.
- Every appointment belongs to exactly one user.

### Doctors -> Appointments

- Cardinality: `1 : many`
- One doctor can have many appointments over time.
- Every appointment is booked with exactly one doctor.

### Specializations -> Doctors

- Cardinality: `1 : many`
- One specialization can be assigned to many doctors.
- Every doctor belongs to exactly one specialization.

### Users -> Ratings -> Doctors

- Cardinality: `User 1 : many Ratings`
- Cardinality: `Doctor 1 : many Ratings`
- A user can rate multiple doctors across different appointments.
- A doctor can receive ratings from multiple users.
- Each rating belongs to one appointment, one user, and one doctor.

### Appointments -> Ratings

- Cardinality: `1 : 0..1`
- An appointment may have one rating after the consultation is completed.
- A rating cannot exist without a valid appointment.

## Business Meaning

The ER model supports the main business requirements:

- User account management
- Doctor discovery by specialization and city
- Appointment booking and cancellation
- Post-consultation doctor feedback
- Administrative monitoring of platform activity
