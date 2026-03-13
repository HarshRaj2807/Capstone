# Fracto - Online Doctor Appointment Booking System

![Angular](https://img.shields.io/badge/Frontend-Angular-DD0031?logo=angular&logoColor=white)
![ASP.NET Core](https://img.shields.io/badge/Backend-ASP.NET%20Core%20Web%20API-512BD4?logo=dotnet&logoColor=white)
![Entity Framework Core](https://img.shields.io/badge/ORM-Entity%20Framework%20Core-6DB33F?logo=dotnet&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)
![Swagger](https://img.shields.io/badge/API%20Docs-Swagger-85EA2D?logo=swagger&logoColor=black)
![SQL Server Design](https://img.shields.io/badge/Database%20Design-SQL%20Server-CC2927?logo=microsoftsqlserver&logoColor=white)

## About the Project

Fracto is a full-stack web application for booking doctor appointments online. The idea behind the project is simple: patients should be able to find the right doctor quickly, see available slots, book a consultation without phone calls, and manage their appointments from one place.

The application supports two roles:

- **User**: can register, log in, search doctors, book appointments, cancel appointments, and rate doctors after consultation
- **Admin**: can manage doctors, users, and appointment statuses

This project was built as a professional capstone-style solution using Angular for the frontend and ASP.NET Core Web API for the backend.

## What Fracto Solves

In many clinics, appointment booking is still handled manually or through disconnected systems. That usually creates a few common problems:

- users do not know which doctors are available
- comparing doctors by specialization or ratings is difficult
- double-booking becomes more likely
- cancellations and status updates are harder to track
- admins do not have a clean overview of the full system

Fracto solves that by offering a structured digital workflow for doctor discovery, slot-based booking, appointment tracking, and admin management.

## Main Features

- Secure user registration and login
- JWT-based authentication and authorization
- Doctor search by city, specialization, and rating
- Dynamic time slot availability
- Consultation fee payment page before final booking
- Appointment booking and cancellation
- Confirmation popup after successful booking
- Doctor rating after completed appointments
- Admin dashboard for doctors, users, and appointments
- Swagger integration for API testing
- SQL Server database design with a runnable local development setup

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Angular 20 |
| Backend | ASP.NET Core Web API (.NET 10) |
| ORM | Entity Framework Core |
| Authentication | JWT Authentication |
| API Documentation | Swagger |
| Main Database Design | SQL Server |
| Local Development Database | SQLite |

## Project Structure

```text
backend/
  Fracto.Api/                 runnable ASP.NET Core Web API
  Appointment_Booking_Logic.md
  Project_Structure.md

frontend/
  fracto-ui/                  runnable Angular application
  Project_Structure.md

database/
  Database_Design.md
  Fracto_Database.sql

documentation/
  ER_Diagram.md
  Fracto_Capstone_Report.md
  GitHub_Project_Structure.md
  JWT_Authentication_Flow.md
  REST_API_Design.md
```

## Running the Project Locally

The easiest way to run the project is with the current default setup, which uses **SQLite for local development**. This keeps the application easy to start without requiring extra SQL Server configuration on every machine.

### 1. Run the Backend

Open a terminal in the project root and run:

```bash
cd backend/Fracto.Api
dotnet restore
dotnet run
```

The API will be available at:

- `http://localhost:5104`
- Swagger: `http://localhost:5104/swagger`

### 2. Run the Frontend

Open a second terminal and run:

```bash
cd frontend/fracto-ui
npm install
npm start
```

The frontend will be available at:

- `http://localhost:4200`

If your browser or local setup uses `127.0.0.1` instead, that works as well.

## Demo Accounts

You can use the seeded accounts below to test the application immediately.

### Admin Account

- Email: `admin@fracto.com`
- Password: `Admin@123`

### User Account

- Email: `user@fracto.com`
- Password: `User@123`

## Typical User Flow

### User

1. Log in or register
2. Search for a doctor
3. Select a city, specialization, and preferred date
4. Choose an available time slot
5. Continue to the fee payment page
6. Confirm the payment and complete the booking
7. View or cancel the appointment later
8. Rate the doctor after the consultation is completed

### Admin

1. Log in using the admin account
2. Add or update doctor records
3. Review all appointments
4. Change appointment status
5. View and manage users

## API Coverage

The backend includes working endpoints for:

- authentication
- specializations
- doctors
- appointments
- ratings
- users

Swagger is enabled, so the API can be explored and tested directly from the browser.

## SQL Server Note

The original capstone requirement is based on **SQL Server**, and the full database design is still included in this repository.

Relevant files:

- [Database_Design.md](/c:/Users/rajha/Wipro/Capstone/database/Database_Design.md)
- [Fracto_Database.sql](/c:/Users/rajha/Wipro/Capstone/database/Fracto_Database.sql)

For day-to-day local running, the backend currently defaults to SQLite because it is the most reliable zero-setup option here. If you want to switch back to SQL Server, update the configuration in [appsettings.json](/c:/Users/rajha/Wipro/Capstone/backend/Fracto.Api/appsettings.json).

## Documentation Included

This repository also contains the full capstone documentation package:

- [Fracto_Capstone_Report.md](/c:/Users/rajha/Wipro/Capstone/documentation/Fracto_Capstone_Report.md)
- [REST_API_Design.md](/c:/Users/rajha/Wipro/Capstone/documentation/REST_API_Design.md)
- [JWT_Authentication_Flow.md](/c:/Users/rajha/Wipro/Capstone/documentation/JWT_Authentication_Flow.md)
- [ER_Diagram.md](/c:/Users/rajha/Wipro/Capstone/documentation/ER_Diagram.md)
- [GitHub_Project_Structure.md](/c:/Users/rajha/Wipro/Capstone/documentation/GitHub_Project_Structure.md)

## Current Status

The project is now in a good runnable state for local development and demo use:

- backend is implemented and builds successfully
- frontend is implemented and builds successfully
- seeded demo users are available
- Swagger is enabled
- the system can be run locally and tested end to end

## Author

**Harsh Raj**  
**Project Title:** Fracto - Online Doctor Appointment Booking System  
**Date:** 20/03/2026
