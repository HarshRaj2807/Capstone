# Fracto

![Angular](https://img.shields.io/badge/Frontend-Angular-DD0031?logo=angular&logoColor=white)
![ASP.NET Core](https://img.shields.io/badge/Backend-ASP.NET%20Core%20Web%20API-512BD4?logo=dotnet&logoColor=white)
![Entity Framework Core](https://img.shields.io/badge/ORM-Entity%20Framework%20Core-6DB33F?logo=dotnet&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)
![Swagger](https://img.shields.io/badge/API%20Docs-Swagger-85EA2D?logo=swagger&logoColor=black)
![SQL Server](https://img.shields.io/badge/Database-SQL%20Server-CC2927?logo=microsoftsqlserver&logoColor=white)

Fracto is a full-stack doctor appointment booking system built with Angular and ASP.NET Core Web API. The project is centered around a simple idea: patients should be able to find the right doctor, choose a time slot, complete the booking, and manage appointments without dealing with slow manual processes.

On the other side, administrators get a clean way to manage doctors, users, and appointment activity from one place. The result is a practical product-style workflow that feels complete from login to booking confirmation.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [How It Works](#how-it-works)
- [Getting Started](#getting-started)
- [Demo Accounts](#demo-accounts)
- [Repository Structure](#repository-structure)
- [Documentation](#documentation)

## Overview

Booking a doctor appointment is still harder than it should be in many places. Patients often depend on phone calls, unclear schedules, or manual follow-up just to confirm a consultation. That creates delays, confusion, and a poor user experience.

Fracto solves that by bringing the process into one structured flow:

- search doctors by city, specialization, and rating
- view available time slots
- complete the consultation fee step before final confirmation
- manage upcoming appointments
- cancel appointments when needed
- rate doctors after the consultation
- give admins visibility into the full system

## Key Features

- User registration and login
- JWT-based authentication and authorization
- Doctor search and filtering
- Slot-based appointment booking
- Consultation fee payment page
- Booking confirmation popup
- Appointment cancellation
- Doctor ratings and reviews
- Admin dashboard capabilities
- Swagger API testing support

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Angular 20 |
| Backend | ASP.NET Core Web API (.NET 10) |
| ORM | Entity Framework Core |
| Authentication | JWT |
| API Docs | Swagger |
| Database | SQL Server |

## How It Works

For patients, the experience is straightforward. A user signs in, searches for a doctor, filters by location or specialization, chooses a date and available slot, continues to the payment page, and receives a confirmation popup once the appointment is successfully booked.

For administrators, Fracto acts as a lightweight management system. Admin users can review doctor data, monitor users, and keep track of appointment activity through the same platform.

## Getting Started

### Prerequisites

Before running the project, make sure you have:

- .NET 10 SDK
- Node.js and npm
- SQL Server Express or another SQL Server instance

By default, the backend is configured to use:

- Server: `.\SQLEXPRESS`
- Database: `FractoDb`

You can change that in [appsettings.json](/c:/Users/rajha/Wipro/Capstone/backend/Fracto.Api/appsettings.json) if your local SQL Server setup is different.

### Run the backend

```bash
cd backend/Fracto.Api
dotnet restore
dotnet run
```

Backend URLs:

- API: `http://localhost:5104`
- Swagger: `http://localhost:5104/swagger`

### Run the frontend

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

The project includes seeded users so you can explore the main flows right away.

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

documentation/
  ER_Diagram.md
  Fracto_Project_Report.md
  GitHub_Project_Structure.md
  JWT_Authentication_Flow.md
  REST_API_Design.md
```

## Documentation

This repository also includes supporting technical documents:

- [Full Project Report](/c:/Users/rajha/Wipro/Capstone/documentation/Fracto_Project_Report.md)
- [REST_API_Design.md](/c:/Users/rajha/Wipro/Capstone/documentation/REST_API_Design.md)
- [JWT_Authentication_Flow.md](/c:/Users/rajha/Wipro/Capstone/documentation/JWT_Authentication_Flow.md)
- [ER_Diagram.md](/c:/Users/rajha/Wipro/Capstone/documentation/ER_Diagram.md)
- [GitHub_Project_Structure.md](/c:/Users/rajha/Wipro/Capstone/documentation/GitHub_Project_Structure.md)
- [Database_Design.md](/c:/Users/rajha/Wipro/Capstone/database/Database_Design.md)
- [Fracto_Database.sql](/c:/Users/rajha/Wipro/Capstone/database/Fracto_Database.sql)

## Author

**Harsh Raj**  
**Date:** 20/03/2026
