# ASP.NET Core Backend Project Structure

## Recommended Folder Structure

```text
backend/
  Fracto.Api/
    Controllers/
      AuthController.cs
      DoctorsController.cs
      AppointmentsController.cs
      RatingsController.cs
    Services/
      Interfaces/
        IAuthService.cs
        IDoctorService.cs
        IAppointmentService.cs
        IRatingService.cs
      Implementations/
        AuthService.cs
        DoctorService.cs
        AppointmentService.cs
        RatingService.cs
    Repositories/
      Interfaces/
        IUserRepository.cs
        IDoctorRepository.cs
        IAppointmentRepository.cs
        IRatingRepository.cs
      Implementations/
        UserRepository.cs
        DoctorRepository.cs
        AppointmentRepository.cs
        RatingRepository.cs
    DTOs/
      Auth/
        RegisterRequestDto.cs
        LoginRequestDto.cs
        LoginResponseDto.cs
      Doctors/
        DoctorCreateDto.cs
        DoctorUpdateDto.cs
        DoctorSearchResponseDto.cs
      Appointments/
        BookAppointmentRequestDto.cs
        AppointmentResponseDto.cs
      Ratings/
        RatingCreateDto.cs
        RatingResponseDto.cs
    Entities/
      User.cs
      Doctor.cs
      Specialization.cs
      Appointment.cs
      Rating.cs
    Data/
      FractoDbContext.cs
      Configurations/
        UserConfiguration.cs
        DoctorConfiguration.cs
        AppointmentConfiguration.cs
        RatingConfiguration.cs
      Seed/
        DbSeeder.cs
    Middleware/
      ExceptionHandlingMiddleware.cs
      RequestLoggingMiddleware.cs
    Helpers/
      JwtTokenGenerator.cs
      CurrentUserAccessor.cs
      PaginationHelper.cs
      FileStorageHelper.cs
    Configuration/
      JwtSettings.cs
      SwaggerConfiguration.cs
      CorsSettings.cs
    Program.cs
    appsettings.json
    appsettings.Development.json
```

## Folder Purpose

### Controllers

Expose REST endpoints, validate inputs, and translate HTTP requests into service calls.

### Services

Contain business rules such as booking validation, rating submission, token generation, and search filtering.

### Repositories

Encapsulate data access logic and EF Core query composition. This keeps controllers and services focused on business behavior.

### DTOs

Define request and response contracts. DTOs prevent entity overexposure and keep the API stable.

### Entities

Represent the domain model and map directly to SQL Server tables through EF Core.

### Data

Contains the `DbContext`, Fluent API entity configurations, and optional seed data logic.

### Middleware

Houses cross-cutting request pipeline behavior such as exception handling and logging.

### Helpers

Contains reusable support utilities such as JWT generation, pagination, file storage, and current user claim access.

### Configuration

Stores strongly typed configuration models and setup helpers for JWT, Swagger, and CORS.

## Backend Design Notes

- Controllers should remain thin and delegate business rules to services.
- Services should call repositories rather than manipulating `DbContext` directly across the entire application.
- DTO validation should use data annotations or FluentValidation.
- Swagger should be configured with bearer security so protected endpoints can be tested from the UI.
