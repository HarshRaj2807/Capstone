# Fracto

![Angular](https://img.shields.io/badge/Frontend-Angular-DD0031?logo=angular&logoColor=white)
![ASP.NET Core](https://img.shields.io/badge/Backend-ASP.NET%20Core%20Web%20API-512BD4?logo=dotnet&logoColor=white)
![Entity Framework Core](https://img.shields.io/badge/ORM-Entity%20Framework%20Core-6DB33F?logo=dotnet&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)
![Swagger](https://img.shields.io/badge/API%20Docs-Swagger-85EA2D?logo=swagger&logoColor=black)
![SQL Server](https://img.shields.io/badge/Database-SQL%20Server-CC2927?logo=microsoftsqlserver&logoColor=white)

Fracto is a full-stack doctor appointment booking system built with Angular and ASP.NET Core Web API. It is designed to make the appointment process simple for patients and manageable for administrators, with a clear flow from doctor search to payment and booking confirmation.

The project helps users discover doctors, check availability, book appointments, complete the consultation fee step, and manage bookings in one place. On the administrative side, it provides a clean way to manage doctors, users, and appointments without relying on manual coordination.

## Table of Contents

- [Overview](#overview)
- [Highlights](#highlights)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [How the System Works](#how-the-system-works)
- [Screenshots](#screenshots)
- [Project Structure](#project-structure)
- [Running the Project](#running-the-project)
- [Demo Accounts](#demo-accounts)
- [Typical Flow](#typical-flow)
- [API Coverage](#api-coverage)
- [Database Note](#database-note)
- [Documentation](#documentation)
- [Current Status](#current-status)
- [Author](#author)

## Overview

Booking a doctor appointment is still more difficult than it should be in many places. Patients often depend on phone calls, unclear schedules, or manual follow-up just to confirm a slot. On the clinic side, handling bookings and cancellations without a proper system can lead to confusion, wasted time, and double-booking risks.

Fracto solves that with a structured digital workflow:

- patients can search doctors by city, specialization, and ratings
- appointments are booked against available time slots
- payment happens before final confirmation
- users can cancel appointments and submit ratings later
- admins can manage the platform through a dedicated interface

## Highlights

- End-to-end booking flow from doctor search to payment and booking confirmation
- Separate patient and admin experiences with role-based access
- Angular frontend with a clean multi-page workflow
- ASP.NET Core Web API with JWT authentication and Swagger support
- SQL Server configured as the active backend database
- Project documentation packaged in the same repository

## Features

- Secure registration and login
- JWT-based authentication and authorization
- Doctor search and filtering
- Slot-based appointment booking
- Consultation fee payment page
- Confirmation popup after successful booking
- Appointment cancellation
- Doctor rating flow
- Admin dashboard capabilities
- Swagger API documentation
- SQL Server database design and executable script

## Technology Stack

| Layer | Technology |
| --- | --- |
| Frontend | Angular 20 |
| Backend | ASP.NET Core Web API (.NET 10) |
| ORM | Entity Framework Core |
| Authentication | JWT |
| API Testing | Swagger |
| Database | SQL Server |

## How the System Works

The patient journey is designed to feel simple and familiar. A user signs in, searches for a doctor, filters by city or specialization, chooses a date and slot, continues to the payment page, and receives a confirmation popup once the appointment is booked successfully. After the consultation, the same user can come back and rate the doctor.

The admin journey is focused on visibility and control. Admin users can review doctor data, monitor users, and keep track of appointments from one place.

## Screenshots

You can replace these placeholders with actual screenshots later for a stronger GitHub presentation.

| Screen | Suggested Image |
| --- | --- |
| Login and Register | `docs/screenshots/auth-page.png` |
| Doctor Search | `docs/screenshots/doctors-page.png` |
| Payment Page | `docs/screenshots/payment-page.png` |
| Booking Confirmation | `docs/screenshots/confirmation-popup.png` |
| Appointments Page | `docs/screenshots/appointments-page.png` |
| Admin Dashboard | `docs/screenshots/admin-page.png` |

## Project Structure

```text
backend/
  Fracto.Api/                 Runnable ASP.NET Core Web API
  Appointment_Booking_Logic.md
  Project_Structure.md

frontend/
  fracto-ui/                  Runnable Angular application
  Project_Structure.md

database/
  Database_Design.md
  Fracto_Database.sql

documentation/
  ER_Diagram.md
  Fracto_Project_Report.md
  GitHub_Project_Structure.md
  JWT_Authentication_Flow.md
  REST_API_Design.md
```

## Running the Project

Fracto is configured to run on SQL Server by default using the local `SQLEXPRESS` instance.

### Start the backend

```bash
cd backend/Fracto.Api
dotnet restore
dotnet run
```

Backend endpoints:

- API: `http://localhost:5104`
- Swagger: `http://localhost:5104/swagger`

SQL Server connection used by default:

- Server: `.\SQLEXPRESS`
- Database: `FractoDb`

### Start the frontend

Open a second terminal and run:

```bash
cd frontend/fracto-ui
npm install
npm start
```

Frontend URL:

- `http://localhost:4200`

If the Angular app opens on `http://127.0.0.1:4200`, that is also supported.

## Demo Accounts

The repository includes seeded accounts so the project can be explored immediately.

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@fracto.com` | `Admin@123` |
| User | `user@fracto.com` | `User@123` |

## Typical Flow

### Patient

1. Register or log in
2. Search doctors using filters
3. Choose a doctor and available slot
4. Continue to the payment page
5. Complete the fee step
6. See the booking confirmation popup
7. Review or cancel the appointment later
8. Rate the doctor after consultation

### Admin

1. Log in with the admin account
2. Review doctor and user records
3. Monitor appointments
4. Manage overall system data

## API Coverage

The backend currently supports:

- authentication
- doctor listing and search
- appointment booking
- appointment cancellation
- ratings
- users
- specializations

Swagger is enabled to make API testing easier during development and demo sessions.

## Database Note

The project is designed around SQL Server, and the full database material is included here:

- [Database_Design.md](/c:/Users/rajha/Wipro/Capstone/database/Database_Design.md)
- [Fracto_Database.sql](/c:/Users/rajha/Wipro/Capstone/database/Fracto_Database.sql)

The running backend is configured for SQL Server through [appsettings.json](/c:/Users/rajha/Wipro/Capstone/backend/Fracto.Api/appsettings.json). The default connection points to `.\SQLEXPRESS` and uses the `FractoDb` database. SQLite support is still available in the codebase if you ever want a lighter fallback, but SQL Server is now the active default.

## Documentation

Alongside the runnable project, the repository also includes supporting technical documentation:

- [Full Project Report](/c:/Users/rajha/Wipro/Capstone/documentation/Fracto_Project_Report.md)
- [REST_API_Design.md](/c:/Users/rajha/Wipro/Capstone/documentation/REST_API_Design.md)
- [JWT_Authentication_Flow.md](/c:/Users/rajha/Wipro/Capstone/documentation/JWT_Authentication_Flow.md)
- [ER_Diagram.md](/c:/Users/rajha/Wipro/Capstone/documentation/ER_Diagram.md)
- [GitHub_Project_Structure.md](/c:/Users/rajha/Wipro/Capstone/documentation/GitHub_Project_Structure.md)

## Current Status

Fracto is in a good runnable state for demo and review:

- frontend and backend are implemented
- authentication is working
- booking, payment, and confirmation flows are in place
- Swagger is available
- demo accounts are seeded
- database scripts and technical documentation are included

## Author

**Harsh Raj**  
**Project:** Fracto - Online Doctor Appointment Booking System  
**Date:** 20/03/2026
