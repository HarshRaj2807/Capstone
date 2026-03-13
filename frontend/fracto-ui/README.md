# Fracto UI

Fracto UI is the Angular frontend for the Fracto doctor appointment booking system. It handles the main user experience of the product, including authentication, doctor discovery, appointment booking, payment, booking confirmation, and admin-facing pages.

## What this app includes

- login and registration screens
- doctor search and filtering
- slot-based appointment booking
- payment step before booking confirmation
- confirmation popup after successful booking
- appointments page for tracking and cancellation
- doctor rating flow
- admin pages for management tasks

## Run the frontend

```bash
npm install
npm start
```

The app runs at:

- `http://localhost:4200`

If it opens on `http://127.0.0.1:4200`, that is also supported by the backend configuration.

## Build the frontend

```bash
npm run build
```

The production build output is generated in the `dist/` folder.

## Backend connection

This frontend expects the Fracto ASP.NET Core API to be running locally at:

- `http://localhost:5104`

If the backend is not running, login, registration, booking, payment, and admin actions will not work correctly.

## Development notes

The frontend is built using Angular standalone components. API communication is handled through Angular services, route protection is handled with guards, and authenticated requests are managed through HTTP interceptors.
