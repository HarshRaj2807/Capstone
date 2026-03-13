# JWT Authentication Flow

## Overview

Fracto uses JSON Web Token authentication to provide stateless and secure access to API endpoints from the Angular frontend.

## End-to-End Flow

### 1. User Login

1. The user enters email and password on the Angular login page.
2. The frontend sends the credentials to `POST /api/auth/login`.
3. The backend validates the user against the `Users` table.
4. If the credentials are valid, the API generates a JWT token.

### 2. Token Generation

The backend creates a token with claims such as:

- `sub`: user id
- `email`: user email
- `role`: `User` or `Admin`
- `jti`: unique token identifier

The token is signed using a secure secret key from configuration and includes an expiration time.

### 3. Token Delivery and Storage

1. The API returns the JWT token to the Angular application.
2. The frontend stores the token in a secure client-side store such as memory or session storage.
3. An Angular HTTP interceptor automatically adds the token to outgoing protected requests.

Example header:

```text
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Token Validation

For every protected request:

1. The ASP.NET Core JWT bearer middleware reads the `Authorization` header.
2. The middleware validates the token signature, issuer, audience, and expiration.
3. If validation succeeds, the `HttpContext.User` principal is populated with claims.
4. Controllers and services can access the current user identity and role from claims.

### 5. Authorization Middleware

After authentication, authorization rules are enforced:

- `[Authorize]` allows only authenticated users.
- `[Authorize(Roles = "Admin")]` allows only admin users.
- Business logic further verifies resource ownership, such as ensuring a user can only cancel their own appointment.

## Textual Flow Diagram

```text
[ Angular Login Form ]
          |
          v
POST /api/auth/login
          |
          v
[ AuthController ]
          |
          v
[ AuthService validates user ]
          |
          v
[ JWT Token Generator ]
          |
          v
Token returned to Angular
          |
          v
[ Angular Interceptor adds Bearer token ]
          |
          v
Protected API request
          |
          v
[ JWT Middleware validates token ]
          |
          v
[ Authorization attributes enforce access ]
```

## Security Practices

- Store only password hashes, never plain-text passwords.
- Use strong signing keys and keep them outside source control.
- Enforce token expiration and optional refresh token flow for longer sessions.
- Use HTTPS so tokens are not transmitted over insecure channels.
- Limit token content to required claims only.

## Recommended ASP.NET Core Configuration Areas

- `JwtSettings` class in `Configuration/`
- `builder.Services.AddAuthentication().AddJwtBearer(...)`
- `builder.Services.AddAuthorization()`
- `UseAuthentication()` before `UseAuthorization()` in the middleware pipeline
