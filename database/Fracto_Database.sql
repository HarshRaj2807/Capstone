-- Create the database only if it does not already exist.
IF DB_ID(N'FractoDb') IS NULL
BEGIN
    CREATE DATABASE FractoDb;
END
GO

USE FractoDb;
GO

-- Drop child tables first so foreign key dependencies do not block recreation.
IF OBJECT_ID(N'dbo.Ratings', N'U') IS NOT NULL
    DROP TABLE dbo.Ratings;
GO

IF OBJECT_ID(N'dbo.Appointments', N'U') IS NOT NULL
    DROP TABLE dbo.Appointments;
GO

IF OBJECT_ID(N'dbo.RefreshTokens', N'U') IS NOT NULL
    DROP TABLE dbo.RefreshTokens;
GO

IF OBJECT_ID(N'dbo.Doctors', N'U') IS NOT NULL
    DROP TABLE dbo.Doctors;
GO

IF OBJECT_ID(N'dbo.Specializations', N'U') IS NOT NULL
    DROP TABLE dbo.Specializations;
GO

IF OBJECT_ID(N'dbo.Users', N'U') IS NOT NULL
    DROP TABLE dbo.Users;
GO

-- Store both end users and administrators in a single account table.
CREATE TABLE dbo.Users
(
    UserId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(255) NOT NULL,
    PasswordHash NVARCHAR(500) NOT NULL,
    PhoneNumber NVARCHAR(20) NULL,
    [Role] NVARCHAR(20) NOT NULL,
    City NVARCHAR(100) NULL,
    ProfileImagePath NVARCHAR(500) NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_Users_IsActive DEFAULT (1),
    CreatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_Users_CreatedAtUtc DEFAULT (SYSUTCDATETIME()),
    UpdatedAtUtc DATETIME2 NULL,
    CONSTRAINT UQ_Users_Email UNIQUE (Email),
    CONSTRAINT CK_Users_Role CHECK ([Role] IN (N'User', N'Admin'))
);
GO

-- Refresh tokens allow secure session renewal without re-entering credentials.
CREATE TABLE dbo.RefreshTokens
(
    RefreshTokenId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    UserId INT NOT NULL,
    TokenHash CHAR(64) NOT NULL,
    ExpiresAtUtc DATETIME2 NOT NULL,
    CreatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_RefreshTokens_CreatedAtUtc DEFAULT (SYSUTCDATETIME()),
    RevokedAtUtc DATETIME2 NULL,
    ReplacedByTokenHash CHAR(64) NULL,
    CONSTRAINT FK_RefreshTokens_Users FOREIGN KEY (UserId)
        REFERENCES dbo.Users (UserId)
);
GO

-- Keep medical specializations in a dedicated reference table.
CREATE TABLE dbo.Specializations
(
    SpecializationId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    SpecializationName NVARCHAR(150) NOT NULL,
    [Description] NVARCHAR(500) NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_Specializations_IsActive DEFAULT (1),
    CONSTRAINT UQ_Specializations_SpecializationName UNIQUE (SpecializationName)
);
GO

-- Doctor records include schedule configuration so slots can be generated dynamically.
CREATE TABLE dbo.Doctors
(
    DoctorId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    FullName NVARCHAR(200) NOT NULL,
    SpecializationId INT NOT NULL,
    City NVARCHAR(100) NOT NULL,
    ExperienceYears INT NOT NULL CONSTRAINT DF_Doctors_ExperienceYears DEFAULT (0),
    ConsultationFee DECIMAL(10,2) NOT NULL CONSTRAINT DF_Doctors_ConsultationFee DEFAULT (0),
    AverageRating DECIMAL(3,2) NOT NULL CONSTRAINT DF_Doctors_AverageRating DEFAULT (0),
    TotalReviews INT NOT NULL CONSTRAINT DF_Doctors_TotalReviews DEFAULT (0),
    ConsultationStartTime TIME(0) NOT NULL,
    ConsultationEndTime TIME(0) NOT NULL,
    SlotDurationMinutes INT NOT NULL CONSTRAINT DF_Doctors_SlotDurationMinutes DEFAULT (30),
    ProfileImagePath NVARCHAR(500) NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_Doctors_IsActive DEFAULT (1),
    CreatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_Doctors_CreatedAtUtc DEFAULT (SYSUTCDATETIME()),
    UpdatedAtUtc DATETIME2 NULL,
    CONSTRAINT FK_Doctors_Specializations FOREIGN KEY (SpecializationId)
        REFERENCES dbo.Specializations (SpecializationId),
    CONSTRAINT CK_Doctors_AverageRating CHECK (AverageRating >= 0 AND AverageRating <= 5),
    CONSTRAINT CK_Doctors_TimeWindow CHECK (ConsultationEndTime > ConsultationStartTime),
    CONSTRAINT CK_Doctors_SlotDuration CHECK (SlotDurationMinutes > 0)
);
GO

-- Appointments capture booking activity and keep cancellation history instead of hard deleting rows.
CREATE TABLE dbo.Appointments
(
    AppointmentId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    UserId INT NOT NULL,
    DoctorId INT NOT NULL,
    AppointmentDate DATE NOT NULL,
    TimeSlot TIME(0) NOT NULL,
    [Status] NVARCHAR(20) NOT NULL,
    ReasonForVisit NVARCHAR(500) NULL,
    CancellationReason NVARCHAR(500) NULL,
    BookedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_Appointments_BookedAtUtc DEFAULT (SYSUTCDATETIME()),
    CancelledAtUtc DATETIME2 NULL,
    CONSTRAINT FK_Appointments_Users FOREIGN KEY (UserId)
        REFERENCES dbo.Users (UserId),
    CONSTRAINT FK_Appointments_Doctors FOREIGN KEY (DoctorId)
        REFERENCES dbo.Doctors (DoctorId),
    CONSTRAINT CK_Appointments_Status CHECK ([Status] IN (N'Booked', N'Confirmed', N'Cancelled', N'Completed'))
);
GO

-- Ratings are linked back to appointments so each consultation can be rated only once.
CREATE TABLE dbo.Ratings
(
    RatingId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    AppointmentId INT NOT NULL,
    UserId INT NOT NULL,
    DoctorId INT NOT NULL,
    RatingValue INT NOT NULL,
    ReviewComment NVARCHAR(1000) NULL,
    CreatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_Ratings_CreatedAtUtc DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT FK_Ratings_Appointments FOREIGN KEY (AppointmentId)
        REFERENCES dbo.Appointments (AppointmentId),
    CONSTRAINT FK_Ratings_Users FOREIGN KEY (UserId)
        REFERENCES dbo.Users (UserId),
    CONSTRAINT FK_Ratings_Doctors FOREIGN KEY (DoctorId)
        REFERENCES dbo.Doctors (DoctorId),
    CONSTRAINT CK_Ratings_RatingValue CHECK (RatingValue BETWEEN 1 AND 5)
);
GO

-- Speed up authentication lookups and admin filtering.
CREATE UNIQUE INDEX IX_Users_Email
    ON dbo.Users (Email);
GO

CREATE INDEX IX_Users_Role
    ON dbo.Users ([Role]);
GO

-- Refresh token lookups and revocation checks.
CREATE UNIQUE INDEX IX_RefreshTokens_TokenHash
    ON dbo.RefreshTokens (TokenHash);
GO

CREATE INDEX IX_RefreshTokens_UserId
    ON dbo.RefreshTokens (UserId);
GO

-- Ensure specialization names remain unique and searchable.
CREATE UNIQUE INDEX IX_Specializations_Name
    ON dbo.Specializations (SpecializationName);
GO

-- Support doctor search by city, specialization, and rating.
CREATE INDEX IX_Doctors_City
    ON dbo.Doctors (City);
GO

CREATE INDEX IX_Doctors_SpecializationId
    ON dbo.Doctors (SpecializationId);
GO

CREATE INDEX IX_Doctors_Search
    ON dbo.Doctors (City, SpecializationId, AverageRating DESC);
GO

-- Support user history queries and doctor schedule queries.
CREATE INDEX IX_Appointments_User_Date
    ON dbo.Appointments (UserId, AppointmentDate DESC);
GO

CREATE INDEX IX_Appointments_Doctor_Date
    ON dbo.Appointments (DoctorId, AppointmentDate, TimeSlot);
GO

-- Prevent double-booking of the same active slot while still allowing rebooking after cancellation.
CREATE UNIQUE INDEX IX_Appointments_Doctor_Date_TimeSlot_Active
    ON dbo.Appointments (DoctorId, AppointmentDate, TimeSlot)
    WHERE [Status] IN (N'Booked', N'Confirmed', N'Completed');
GO

-- Keep ratings efficient to query and enforce one rating per appointment.
CREATE UNIQUE INDEX IX_Ratings_AppointmentId
    ON dbo.Ratings (AppointmentId);
GO

CREATE INDEX IX_Ratings_Doctor_CreatedAt
    ON dbo.Ratings (DoctorId, CreatedAtUtc DESC);
GO

CREATE INDEX IX_Ratings_User_Doctor
    ON dbo.Ratings (UserId, DoctorId);
GO

-- Seed a small starter dataset so the database is immediately usable after script execution.
INSERT INTO dbo.Specializations (SpecializationName, [Description])
VALUES
    (N'Cardiologist', N'Heart and blood vessel specialist'),
    (N'Dermatologist', N'Skin specialist'),
    (N'Dentist', N'Oral and dental care specialist'),
    (N'Neurologist', N'Brain and nervous system specialist'),
    (N'Pediatrician', N'Child healthcare specialist');
GO

INSERT INTO dbo.Users
(
    FirstName,
    LastName,
    Email,
    PasswordHash,
    PhoneNumber,
    [Role],
    City,
    ProfileImagePath
)
VALUES
    (N'System', N'Admin', N'admin@fracto.com', N'<HASHED_PASSWORD>', N'9999999999', N'Admin', N'Bengaluru', NULL),
    (N'Harsh', N'Raj', N'harsh.raj@fracto.com', N'<HASHED_PASSWORD>', N'8888888888', N'User', N'Bengaluru', NULL);
GO

INSERT INTO dbo.Doctors
(
    FullName,
    SpecializationId,
    City,
    ExperienceYears,
    ConsultationFee,
    AverageRating,
    TotalReviews,
    ConsultationStartTime,
    ConsultationEndTime,
    SlotDurationMinutes,
    ProfileImagePath
)
VALUES
    (N'Dr. Ananya Mehta', 1, N'Bengaluru', 12, 800.00, 4.70, 15, '09:00', '13:00', 30, N'uploads/doctors/ananya-mehta.jpg'),
    (N'Dr. Rohan Kapoor', 2, N'Mumbai', 9, 650.00, 4.40, 11, '10:00', '14:00', 30, N'uploads/doctors/rohan-kapoor.jpg'),
    (N'Dr. Sneha Verma', 5, N'Delhi', 14, 700.00, 4.90, 25, '08:30', '12:30', 20, N'uploads/doctors/sneha-verma.jpg');
GO
