# Fracto - Online Doctor Appointment Booking System

## Title Page

**Project Title:** Fracto - Online Doctor Appointment Booking System  
**Name:** Harsh Raj  
**Date:** 20/03/2026

---

## Table of Contents

1. [Problem Definition](#problem-definition)
2. [Project Objectives](#project-objectives)
3. [System Overview](#system-overview)
4. [Technology Stack Explanation](#technology-stack-explanation)
5. [System Architecture](#system-architecture)
6. [Frontend Architecture](#frontend-architecture)
7. [Backend Architecture](#backend-architecture)
8. [Database Design](#database-design)
9. [API Design](#api-design)
10. [Appointment Booking Workflow](#appointment-booking-workflow)
11. [Image Upload Handling](#image-upload-handling)
12. [Performance Optimization](#performance-optimization)
13. [Security Implementation](#security-implementation)
14. [Testing Strategy](#testing-strategy)
15. [Future Enhancements](#future-enhancements)
16. [Conclusion](#conclusion)

---

## Problem Definition

Traditional appointment booking in many clinics and hospitals still relies on phone calls, manual registers, or fragmented web portals. These methods create several operational and user experience problems:

- Patients spend excessive time calling clinics to confirm doctor availability.
- Double-booking can occur when staff manually maintain schedules.
- Patients often lack visibility into doctor specialization, city, and quality indicators such as ratings.
- Cancellation workflows are inconsistent and difficult to track.
- Administrators do not always have a centralized view of users, doctors, and appointment activity.

Fracto addresses these challenges by providing a centralized digital platform where patients can search for doctors by city, specialization, and rating; check available time slots; book appointments online; cancel appointments when required; and submit ratings after consultation. The system also gives administrators a secure interface to manage doctor records, monitor appointments, and maintain operational control.

## Project Objectives

The primary objectives of Fracto are:

- To digitize and streamline the doctor appointment booking lifecycle.
- To reduce manual scheduling conflicts through controlled slot allocation.
- To help users discover suitable doctors using meaningful filters such as city, specialization, and ratings.
- To provide secure authentication and role-based access for users and administrators.
- To allow appointment booking, cancellation, and post-consultation feedback through REST APIs.
- To maintain a normalized and scalable database structure using SQL Server and Entity Framework Core.
- To expose well-documented APIs through Swagger for faster development and testing.
- To support future scalability for notifications, payments, and mobile integration.

## System Overview

Fracto follows a role-based web application model with two main actors: **User** and **Admin**.

### User Journey

1. A new user registers using the application.
2. The user logs in and receives a JWT access token.
3. The Angular frontend stores the token and includes it in protected API requests.
4. The user searches for doctors by city, specialization, and minimum rating.
5. The user reviews doctor profiles and checks available slots for a selected date.
6. The user books an appointment for a valid slot.
7. The backend validates availability, stores the appointment, and returns a confirmation response.
8. The user can later cancel the appointment if permitted by the business rules.
9. After consultation, the user can submit a doctor rating linked to the appointment.

### Admin Journey

1. The administrator logs in through the same authentication system.
2. The admin manages doctor profiles, users, and appointment records.
3. The admin can add, update, or deactivate doctors.
4. The admin can monitor bookings and cancel or confirm appointments when necessary.

## Technology Stack Explanation

### Angular

Angular is used for the frontend because it provides a structured component-based architecture, strong routing support, dependency injection, form validation, and a mature HTTP client. These features are well suited for building a role-based single-page application with modules such as authentication, doctor search, appointment booking, and administration.

### ASP.NET Core Web API

ASP.NET Core Web API is selected for the backend because it offers high performance, strong middleware support, built-in dependency injection, JWT authentication integration, and a clean environment for building RESTful services. It is also well aligned with enterprise-grade architectural practices such as layered services, repositories, DTOs, and Swagger documentation.

### SQL Server

SQL Server is chosen as the database because it is reliable for transactional systems, provides indexing and constraint support, integrates smoothly with the Microsoft development ecosystem, and is appropriate for structured healthcare-style data such as appointments, users, and doctor records.

### Entity Framework Core

Entity Framework Core simplifies data access by mapping C# entity classes to database tables. It improves development speed, supports migrations, LINQ-based querying, eager loading, and validation through Fluent API or data annotations. It also helps keep the data access layer maintainable.

### JWT Authentication

JWT is used to implement stateless, secure authentication between the Angular client and the backend API. The client includes the token in the `Authorization` header, and the server validates claims such as user identity and role.

### Swagger

Swagger is included for API discoverability, testing, and documentation. It improves developer productivity and makes it easier to validate endpoint contracts during implementation and review.

## System Architecture

Fracto uses a layered architecture that separates concerns across presentation, API, business logic, persistence, and security.

### Architecture Layers

- **Frontend Layer:** Angular SPA for user and admin interfaces.
- **Backend API Layer:** ASP.NET Core controllers exposing REST endpoints.
- **Business Logic Layer:** Services implementing booking rules, validation, and rating logic.
- **Database Layer:** SQL Server accessed through Entity Framework Core.
- **Authentication Layer:** JWT token generation, validation, and role-based authorization.

### Textual Architecture Diagram

```text
[ User / Admin Browser ]
          |
          v
[ Angular Frontend ]
  - Components
  - Routing
  - Services
  - Guards
  - Interceptors
          |
   HTTPS + JSON + JWT
          |
          v
[ ASP.NET Core Web API ]
  - Controllers
  - Middleware
  - Swagger
          |
          v
[ Business Services ]
  - Auth Service
  - Doctor Service
  - Appointment Service
  - Rating Service
          |
          v
[ Repository / EF Core Layer ]
  - DbContext
  - Entity Configurations
          |
          v
[ SQL Server Database ]
  - Users
  - Doctors
  - Specializations
  - Appointments
  - Ratings

Cross-Cutting:
- JWT Authentication
- Exception Handling
- Validation
- Logging
- File Upload Storage
```

## Frontend Architecture

The Angular application is designed as a modular single-page application with reusable components and service-driven data access.

### Routing

Angular Router manages navigation between:

- `/login`
- `/register`
- `/doctors/search`
- `/doctors/:id`
- `/appointments`
- `/admin/doctors`
- `/admin/appointments`
- `/admin/users`

Route guards protect authenticated and admin-only routes.

### Components

Suggested components include:

- `LoginComponent`
- `RegisterComponent`
- `DoctorSearchComponent`
- `DoctorCardComponent`
- `DoctorDetailComponent`
- `SlotListComponent`
- `AppointmentBookingComponent`
- `AppointmentListComponent`
- `RatingFormComponent`
- `AdminDashboardComponent`
- `DoctorManagementComponent`

### Services

Angular services encapsulate API calls and shared state:

- `AuthService`
- `DoctorService`
- `AppointmentService`
- `RatingService`
- `AdminService`

These services use Angular `HttpClient` to communicate with the backend.

### State Management

For a capstone-scale project, RxJS `BehaviorSubject` and `Observable` patterns are sufficient for managing:

- Logged-in user state
- JWT token and role information
- Selected filters
- Appointment refresh events

NgRx can be introduced later if the state model becomes more complex.

### UI Structure

The interface can be organized into:

- Public pages: login and registration
- User dashboard: doctor search, booking, appointment history
- Admin dashboard: doctor, user, and appointment management
- Shared UI: navbar, footer, loading spinner, pagination, form validators, and alerts

## Backend Architecture

The backend is implemented as an ASP.NET Core Web API project with a clear separation between transport logic, business rules, and persistence.

### Controllers

Controllers receive HTTP requests, validate the incoming DTOs, call services, and return structured responses.

Examples:

- `AuthController`
- `DoctorsController`
- `AppointmentsController`
- `RatingsController`

### Services

Services implement business rules such as:

- Validating login credentials
- Generating JWT tokens
- Filtering doctors by city, specialization, and rating
- Checking appointment slot availability
- Preventing invalid ratings

### Repositories

Repositories abstract the data access layer and centralize interaction with Entity Framework Core. This improves testability and makes query optimization easier.

### DTOs

DTOs protect the API contract by separating transport objects from entity models.

Examples:

- `RegisterRequestDto`
- `LoginRequestDto`
- `DoctorSearchResponseDto`
- `BookAppointmentRequestDto`
- `RatingCreateDto`

### Entity Models

Entity classes map to database tables:

- `User`
- `Doctor`
- `Specialization`
- `Appointment`
- `Rating`

### JWT Authentication

JWT bearer authentication is configured in the API startup pipeline. Token claims carry the user id, email, and role. `[Authorize]` secures protected endpoints, while `[Authorize(Roles = "Admin")]` protects administrative functionality.

### Swagger Integration

Swagger is configured to:

- Generate OpenAPI documentation
- Support interactive API testing
- Accept bearer tokens in the Swagger UI for secured endpoints

## Database Design

The database is normalized around the core appointment domain.

### Users

Stores application users including standard users and administrators.

Important attributes:

- `UserId`
- `FirstName`
- `LastName`
- `Email`
- `PasswordHash`
- `Role`
- `City`
- `ProfileImagePath`

### Specializations

Stores medical specialization categories such as Cardiologist, Dentist, or Dermatologist.

### Doctors

Stores doctor profiles and links each doctor to exactly one specialization.

Important attributes:

- `DoctorId`
- `FullName`
- `SpecializationId`
- `City`
- `AverageRating`
- `ConsultationStartTime`
- `ConsultationEndTime`
- `SlotDurationMinutes`

### Appointments

Stores booking transactions between users and doctors.

Important attributes:

- `AppointmentId`
- `UserId`
- `DoctorId`
- `AppointmentDate`
- `TimeSlot`
- `Status`

### Ratings

Stores post-consultation ratings for doctors and links the feedback to the originating appointment.

### Textual ER Explanation

- One **User** can create many **Appointments**.
- One **Doctor** can receive many **Appointments**.
- One **Specialization** can contain many **Doctors**.
- One **User** can submit many **Ratings**, but each rating belongs to one completed **Appointment**.
- One **Doctor** can receive many **Ratings**.

## API Design

Fracto follows RESTful conventions with JSON request and response bodies.

### Major API Modules

- Authentication APIs
- Doctor APIs
- Appointment APIs
- Rating APIs

### Authentication APIs

- `POST /api/auth/register`
- `POST /api/auth/login`

### Doctor APIs

- `GET /api/doctors`
- `GET /api/doctors/search`
- `POST /api/doctors`
- `PUT /api/doctors/{id}`
- `DELETE /api/doctors/{id}`

### Appointment APIs

- `GET /api/appointments`
- `POST /api/appointments/book`
- `DELETE /api/appointments/{id}`

### Rating APIs

- `POST /api/ratings`
- `GET /api/doctors/{id}/ratings`

Detailed request and response examples are provided in `documentation/REST_API_Design.md`.

## Appointment Booking Workflow

The appointment booking workflow is the core business flow of the system.

1. The user logs in and receives a JWT token.
2. The user searches for a doctor using filter criteria.
3. The frontend requests available slots for a selected doctor and date.
4. The user selects a slot and submits the booking request.
5. The backend validates user identity, doctor existence, and slot availability.
6. The backend checks if another active appointment already occupies the slot.
7. If validation succeeds, the appointment is stored with status `Booked`.
8. A confirmation response is returned to the frontend.
9. The user's appointment history reflects the new booking immediately.

## Image Upload Handling

Profile image upload is handled in ASP.NET Core using `IFormFile`.

### Process

1. The client submits a `multipart/form-data` request.
2. The controller receives the file through `IFormFile profileImage`.
3. The backend validates file type and size.
4. A unique file name is generated using a GUID.
5. The file is saved in a server folder such as `wwwroot/uploads/profiles`.
6. Only the relative file path is stored in the database.
7. The API can later return the file URL for display in the Angular frontend.

### Benefits

- Keeps binary files out of the database
- Simplifies image serving
- Reduces database size and improves maintainability

## Performance Optimization

Performance is improved through a combination of database, EF Core, and API design practices.

### Database Optimization

- Add indexes on `Users.Email`, `Doctors.City`, `Doctors.SpecializationId`, `Appointments(UserId, AppointmentDate)`, and `Ratings(DoctorId)`.
- Use a filtered unique index on doctor date and slot to prevent duplicate active bookings.
- Store `AverageRating` and `TotalReviews` on the doctor record for fast filtering.

### EF Core Best Practices

- Use `AsNoTracking()` for read-only queries.
- Use projection with DTOs instead of loading entire entity graphs.
- Include related data selectively through `Include()` only where needed.
- Use asynchronous methods such as `ToListAsync()` and `SaveChangesAsync()`.
- Apply pagination on doctor listing and appointment history APIs.

### API Optimization

- Return paged results for large datasets.
- Filter on the server side to reduce payload size.
- Cache static reference data such as specialization lists when appropriate.

## Security Implementation

Security is critical because the system handles authentication and healthcare-related scheduling data.

### Authentication

- Passwords are stored as hashes, not plain text.
- JWT tokens are issued only after successful authentication.
- Expiration time is enforced on every token.

### Authorization

- Standard users can only view and manage their own appointments.
- Admin users can manage doctors, users, and all appointments.
- Role-based policies secure admin endpoints.

### API Protection Strategies

- Use HTTPS in deployment.
- Validate input models to reduce malformed requests.
- Restrict file upload types and size limits.
- Apply centralized exception handling to avoid leaking internal details.
- Use CORS policy configuration to allow only trusted frontend origins.

## Testing Strategy

Fracto should be tested at multiple layers.

### Frontend Testing

- Unit test Angular components such as login, search filters, and booking forms.
- Test services with mocked HTTP responses.
- Verify route guards and interceptor behavior.

### Backend Testing

- Unit test services such as appointment booking and rating submission.
- Integration test controllers with an in-memory or test SQL database.
- Validate JWT-protected endpoints with authorized and unauthorized requests.

### Swagger Testing

Swagger UI can be used for:

- Registering and logging in test users
- Copying the JWT token into the authorize dialog
- Testing secured CRUD endpoints
- Verifying request and response contracts

## Future Enhancements

The system can be extended with advanced capabilities after the base version is completed.

- **SignalR Notifications:** Real-time booking, confirmation, and cancellation alerts.
- **Mobile Application:** Native or cross-platform app for Android and iOS users.
- **Payment Integration:** Online consultation fee payments during appointment booking.
- **AI-Based Doctor Recommendations:** Intelligent doctor suggestions based on history, location, ratings, and specialization match.
- **Calendar Sync:** Sync appointments with Google Calendar or Outlook.
- **Email and SMS Alerts:** Automated reminders before appointment time.

## Conclusion

Fracto is a practical and scalable online doctor appointment booking platform that solves the inefficiencies of manual scheduling by providing a secure, centralized, and user-friendly digital system. By combining Angular, ASP.NET Core Web API, SQL Server, Entity Framework Core, JWT authentication, and Swagger, the solution delivers a modern full-stack architecture suitable for academic submission as well as real-world extension. The design supports accurate appointment scheduling, efficient doctor discovery, secure role-based access, and future enhancements such as notifications, mobile support, and payment integration.
