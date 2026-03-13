# GitHub Project Structure

## Recommended Repository Layout

```text
fracto/
  frontend/
    fracto-ui/
  backend/
    Fracto.Api/
  database/
    Fracto_Database.sql
  documentation/
    Fracto_Capstone_Report.md
    ER_Diagram.md
    REST_API_Design.md
    JWT_Authentication_Flow.md
  README.md
  .gitignore
```

## Purpose of Each Top-Level Folder

- `frontend/`: contains the Angular application for users and administrators.
- `backend/`: contains the ASP.NET Core Web API project and business logic.
- `database/`: contains the SQL Server schema script and database documentation.
- `documentation/`: contains the capstone report and all supplementary technical documents.

## GitHub Best Practices

- Create the repository with a meaningful name such as `fracto-online-appointment-system`.
- Commit the database script early so the data model is version-controlled from the start.
- Use feature branches for isolated development areas such as authentication, doctor search, booking, and admin.
- Add a `.gitignore` before the first large push to avoid committing generated files.
- Never push real secrets or environment-specific configuration values.
- Include screenshots, setup instructions, and Swagger usage steps in `README.md`.
- Use pull requests and descriptive commit messages such as `Add JWT auth flow documentation` or `Create booking schema and indexes`.
- Tag the final submission with a release label such as `capstone-submission-v1`.

## Recommended Commit Order

1. Initial repository structure and README
2. Database design and SQL script
3. Backend API project scaffolding
4. Frontend Angular project scaffolding
5. Authentication and authorization features
6. Doctor search and appointment booking features
7. Ratings module and admin features
8. Documentation, screenshots, and final cleanup
