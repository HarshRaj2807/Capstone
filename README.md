# Fracto

![Angular](https://img.shields.io/badge/Frontend-Angular-DD0031?logo=angular&logoColor=white)
![ASP.NET Core](https://img.shields.io/badge/Backend-ASP.NET%20Core%20Web%20API-512BD4?logo=dotnet&logoColor=white)
![Entity Framework Core](https://img.shields.io/badge/ORM-Entity%20Framework%20Core-6DB33F?logo=dotnet&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)
![Swagger](https://img.shields.io/badge/API%20Docs-Swagger-85EA2D?logo=swagger&logoColor=black)
![SQL Server](https://img.shields.io/badge/Database-SQL%20Server-CC2927?logo=microsoftsqlserver&logoColor=white)

Fracto is a full-stack doctor appointment booking system built with Angular and ASP.NET Core Web API. It is designed to make the booking experience easier for patients and more manageable for administrators, with a clear flow from doctor search to payment and booking confirmation.

Instead of relying on calls, manual follow-up, or scattered scheduling, users can search for doctors, choose a slot, complete the fee step, and manage appointments in one place. Admin users can manage doctors, users, and appointments through the same system.

## What Fracto Does

Fracto brings the main parts of appointment booking into a single workflow:

- search doctors by city, specialization, and rating
- check available time slots
- continue to a payment step before confirming the booking
- view and cancel appointments later
- rate doctors after consultation
- manage doctors, users, and appointments from the admin side

## Core Features

- secure login and registration
- JWT-based authentication and authorization
- doctor discovery and filtering
- slot-based appointment booking
- consultation fee payment page
- booking confirmation popup
- appointment cancellation
- doctor ratings and reviews
- admin dashboard functionality
- Swagger support for API testing

## Technology Stack

| Layer | Technology |
| --- | --- |
| Frontend | Angular 20 |
| Backend | ASP.NET Core Web API (.NET 10) |
| ORM | Entity Framework Core |
| Authentication | JWT |
| API Documentation | Swagger |
| Database | SQL Server |

## Running the Project Locally

### Prerequisites

Make sure you have these installed before starting:

- .NET 10 SDK
- Node.js and npm
- SQL Server Express or another SQL Server instance

The backend is configured by default for:

- Server: `.\SQLEXPRESS`
- Database: `FractoDb`

If your SQL Server setup is different, update the connection settings in `backend/Fracto.Api/appsettings.json`.

### Start the backend

```bash
cd backend/Fracto.Api
dotnet restore
dotnet run
```

Backend URLs:

- API: `http://localhost:5104`
- Swagger: `http://localhost:5104/swagger`

### Start the frontend

Open a second terminal and run:

```bash
cd frontend/fracto-ui
npm install
npm start
```

Frontend URL:

- `http://localhost:4200`

If Angular opens on `http://127.0.0.1:4200`, that is also supported by the backend CORS configuration.

## Demo Accounts

You can use these seeded accounts to explore the main flows quickly:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@fracto.com` | `Admin@123` |
| User | `user@fracto.com` | `User@123` |

## Repository Structure

```text
backend/
  Fracto.Api/                 ASP.NET Core Web API
  Appointment_Booking_Logic.md
  Project_Structure.md

frontend/
  fracto-ui/                  Angular application
  Project_Structure.md

database/
  Database_Design.md
  Fracto_Database.sql

tests/
  Fracto.Api.Tests/           xUnit backend tests

documentation/
  ER_Diagram.md
  Fracto_Project_Report.md
  JWT_Authentication_Flow.md
  REST_API_Design.md

README.md
.gitignore
```

## Documentation

The repository also includes supporting technical documents:

- Full Project Report — `documentation/Fracto_Project_Report.md`
- `documentation/REST_API_Design.md`
- `documentation/JWT_Authentication_Flow.md`
- `documentation/ER_Diagram.md`
- `database/Database_Design.md`
- `database/Fracto_Database.sql`

## Author

**Harsh Raj**  
**Date:** 20/03/2026
