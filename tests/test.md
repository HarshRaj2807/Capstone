# Fracto Testing Documentation

This directory contains the automated test suites for the Fracto application. Adding this file prevents GitHub from collapsing the `tests/` directory.

## Backend Tests (`Fracto.Api.Tests`)

The backend tests are written using **xUnit** and leverage **SQLite in-memory databases** to ensure fast and isolated test runs.

### Tested Services:
1.  **DoctorService**:
    *   Verifies doctor discovery, search, and filtering logic.
    *   Ensures accurate retrieval of doctor profiles and availability.
2.  **SpecializationService**:
    *   Tests the retrieval and management of medical specializations.

### Infrastructure:
*   **SqliteTestDbContextFactory**: A utility used to spin up a clean database for every test, ensuring that data from one test doesn't leak into another.

## Running Tests
To run the automated tests locally, navigate to the `Capstone` root and run:
```powershell
dotnet test
```

## Test Artifacts
- `test_output.json`: A generated file used to store test results (ignored by Git).
