# Configuration Guide

This document provides a quick reference for configuration management across environments.

## Configuration Files

### appsettings.json

Production-ready defaults for demo/development purposes. Tracked in Git.

```json
{
  "DatabaseProvider": "Sqlite",
  "ConnectionStrings": { ... },
  "Jwt": { ... },
  "Cors": { ... }
}
```

**Status**: ✅ Safe to commit - Uses demo JWT key and localhost CORS

### appsettings.Development.json

Local development configuration. **Gitignored** - Each developer maintains their own.

**Setup**:

```bash
# Copy template
cp appsettings.example.json appsettings.Development.json

# Edit with your local settings
# Or use user-secrets for sensitive values
```

### appsettings.Production.json

Production template. **Gitignored** - Uses environment variable placeholders.

**Deployment**:

- Copy to production server
- Replace `${ENV_VAR}` placeholders with actual environment variables
- Or use ASP.NET Core configuration binding with environment variables

### appsettings.example.json

Reference template showing all available configuration options.

**Status**: ✅ Safe to commit - Shows structure only

## Environment Variables

### Development Setup

```bash
cd backend/Fracto.Api

# Initialize user secrets (one-time)
dotnet user-secrets init

# Set secrets (safer than appsettings.Development.json)
dotnet user-secrets set "Jwt:Key" "your-development-secret-key-here"
dotnet user-secrets set "Jwt:Issuer" "FractoApi"
dotnet user-secrets set "Jwt:Audience" "FractoClient"
```

### Production Setup

Set these environment variables on your hosting platform:

```bash
DATABASE_PROVIDER=SqlServer
CONNECTION_STRINGS__SQLSERVERCONNECTION=Server=...;Database=...;User Id=...;Password=...
JWT__KEY=your-production-secret-key-minimum-32-chars
JWT__ISSUER=FractoApi
JWT__AUDIENCE=FractoClient
JWT__EXPIRYMINUTES=180
JWT__REFRESHTOKENEXPIRYDAYS=7
CORS__ALLOWEDORIGINS=https://yourdomain.com;https://www.yourdomain.com
ASPNETCORE_ENVIRONMENT=Production
```

## Configuration Override Order

ASP.NET Core loads configuration in this order (later values override earlier):

1. `appsettings.json`
2. `appsettings.{Environment}.json`
3. Environment variables
4. User secrets (development only)
5. Command-line arguments

**Example**:

- `appsettings.json` has `Jwt:Key = "demo-key"`
- Environment variable `JWT__KEY` set to `"prod-key"`
- Result: JWT key will be `"prod-key"`

## Quick Reference

| Scenario                    | File                           | Method                       |
| --------------------------- | ------------------------------ | ---------------------------- |
| Local development           | `appsettings.Development.json` | Direct edit OR user-secrets  |
| Demo/reference              | `appsettings.json`             | Committed to Git             |
| Production template         | `appsettings.Production.json`  | Environment variables        |
| Configuration reference     | `appsettings.example.json`     | Reference only               |

## Validation

Configuration is validated at startup:

```csharp
SecureConfiguration.ValidateJwtSettings(builder.Configuration);
SecureConfiguration.ValidateDatabaseConfiguration(builder.Configuration);
SecureConfiguration.ValidateCorsConfiguration(builder.Configuration, environment);
```

**Startup Errors:**

- Missing JWT key → InvalidOperationException
- Short JWT key in production → InvalidOperationException
- Missing database provider → InvalidOperationException
- Invalid CORS in production → InvalidOperationException

## Troubleshooting

**JWT Key not found?**

- Check `appsettings.Development.json` OR
- Verify user-secrets: `dotnet user-secrets list`
- Check environment variable: `$env:JWT__KEY` (PowerShell)

**Database connection fails?**

- Verify connection string in `appsettings.Development.json`
- Check SQL Server is running: `sqlcmd -S .\SQLEXPRESS`
- Try SQLite instead: `"DatabaseProvider": "Sqlite"`

**CORS blocked in production?**

- Verify domain is in `Cors:AllowedOrigins`
- Check https/http prefix matches
- Restart API after config changes

## See Also

- [SECURITY.md](../SECURITY.md) - Detailed security setup guide
- [README.md](../README.md#security) - Project security section
- [ASP.NET Core Configuration](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration)
