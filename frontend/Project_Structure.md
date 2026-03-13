# Angular Frontend Project Structure

## Recommended Folder Structure

```text
frontend/
  fracto-ui/
    src/
      app/
        core/
          guards/
            auth.guard.ts
            admin.guard.ts
          interceptors/
            auth.interceptor.ts
            error.interceptor.ts
          services/
            auth.service.ts
            notification.service.ts
          models/
            auth-user.model.ts
            api-response.model.ts
        features/
          auth/
            components/
              login/
              register/
            auth-routing.module.ts
            auth.module.ts
          doctors/
            components/
              doctor-search/
              doctor-card/
              doctor-detail/
              slot-list/
            services/
              doctor.service.ts
            models/
              doctor.model.ts
              doctor-search.model.ts
            doctors-routing.module.ts
            doctors.module.ts
          appointments/
            components/
              appointment-booking/
              appointment-list/
            services/
              appointment.service.ts
            models/
              appointment.model.ts
            appointments-routing.module.ts
            appointments.module.ts
          ratings/
            components/
              rating-form/
              rating-list/
            services/
              rating.service.ts
            models/
              rating.model.ts
            ratings.module.ts
          admin/
            components/
              admin-dashboard/
              doctor-management/
              user-management/
              appointment-management/
            services/
              admin.service.ts
            admin-routing.module.ts
            admin.module.ts
        shared/
          components/
            navbar/
            footer/
            loading-spinner/
            pagination/
          pipes/
          directives/
          shared.module.ts
        app-routing.module.ts
        app.component.ts
        app.module.ts
```

## Folder Purpose

### `core/`

Contains singleton services and infrastructure concerns shared across the entire application.

- `guards/`: protects authenticated and admin routes
- `interceptors/`: appends JWT tokens and centralizes error handling
- `services/`: application-wide services such as authentication
- `models/`: reusable application-wide interfaces

### `features/`

Contains business modules grouped by domain area:

- `auth`: login and registration
- `doctors`: doctor listing, searching, detail view, and slot display
- `appointments`: booking and appointment history
- `ratings`: feedback submission and display
- `admin`: doctor, user, and appointment management

### `shared/`

Contains reusable UI building blocks and common Angular modules used across features.

## Angular Service Communication with Backend APIs

Angular services use `HttpClient` to send requests to the ASP.NET Core Web API.

### Example Flow

1. A component collects input from the user.
2. The component calls a feature service method.
3. The service sends an HTTP request to the API.
4. The interceptor adds the JWT bearer token if the request is protected.
5. The API responds with JSON.
6. The service returns an `Observable` to the component.
7. The component updates the UI accordingly.

### Common Services

- `AuthService`: register, login, logout, current user state
- `DoctorService`: fetch all doctors, search doctors, get doctor details, get available slots
- `AppointmentService`: book appointments, cancel appointments, fetch appointment history
- `RatingService`: submit ratings and fetch doctor reviews
- `AdminService`: doctor CRUD, user management, appointment monitoring

## State Management Recommendation

For this project, RxJS `BehaviorSubject` is a practical and lightweight state approach for:

- Logged-in user information
- Authentication status
- Shared filter state
- Refreshing appointment lists after booking or cancellation

NgRx is optional if the project later expands into a larger enterprise-scale frontend.
