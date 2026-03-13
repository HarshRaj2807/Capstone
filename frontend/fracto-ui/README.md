# Fracto UI

Fracto UI is the Angular frontend for the Fracto doctor appointment booking system. It provides the user-facing experience for registration, login, doctor discovery, appointment booking, payment, confirmation, appointment management, and admin workflows.

## What this frontend covers

- authentication screens for login and registration
- doctor search and filtering
- appointment booking flow
- payment page before final confirmation
- confirmation popup after successful booking
- appointment history and cancellation
- rating flow
- admin pages for management tasks

## Run the frontend locally

```bash
npm install
npm start
```

The app runs at:

- `http://localhost:4200`

If your machine opens the app on `http://127.0.0.1:4200`, that is also supported by the backend CORS configuration.

## Build the frontend

```bash
npm run build
```

The production-ready output is generated in the `dist/` directory.

## Backend dependency

This frontend is expected to run with the Fracto ASP.NET Core API available locally. The backend is configured by default at:

- `http://localhost:5104`

If the API is not running, login, registration, booking, and management actions will not work correctly.

## Development notes

The frontend is built with Angular standalone components and communicates with the backend through Angular services and HTTP interceptors. Authentication state is stored on the client side and protected routes are handled with guards.
