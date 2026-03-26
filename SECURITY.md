# Security Configuration Guide

This document outlines how to properly configure secrets and sensitive data for different environments.

## Overview

Fracto uses environment-based configuration to manage sensitive data securely:

- **Development**: Uses local secrets and development configuration
- **Production**: Requires environment variables and secure configuration

## Development Setup

### Option 1: Using User Secrets (Recommended)

User secrets store sensitive values locally without committing them to version control.

#### Initialize User Secrets for the Backend

```bash
cd backend/Fracto.Api
dotnet user-secrets init
```

#### Set Development Secrets

```bash
# JWT Configuration
dotnet user-secrets set "Jwt:Key" "YourSecureKeyThatIsAtLeast32CharactersLongForHS256Algorithm"
dotnet user-secrets set "Jwt:Issuer" "FractoApi"
dotnet user-secrets set "Jwt:Audience" "FractoClient"

# Database Connection (if using SQL Server)
dotnet user-secrets set "ConnectionStrings:SqlServerConnection" "Server=.\\SQLEXPRESS;Database=FractoDb;Trusted_Connection=True;MultipleActiveResultSets=True;TrustServerCertificate=True;Encrypt=False"
```

#### Verify Secrets

```bash
dotnet user-secrets list
```

### Option 2: Using appsettings.Development.json

This file is already gitignored and exists locally. You can edit it directly for development:

```json
{
  "DatabaseProvider": "Sqlite",
  "Jwt": {
    "Key": "YourSecureKeyHere",
    "Issuer": "FractoApi",
    "Audience": "FractoClient"
  }
}
```

## Production Setup

### Required Environment Variables

For production deployment, set these environment variables on your hosting platform:

```bash
# Database Configuration
DB_SERVER=your-sql-server.database.windows.net
DB_NAME=FractoDb
DB_USER=your-db-user
DB_PASSWORD=your-secure-db-password

# JWT Configuration
JWT_SECRET_KEY=your-production-jwt-secret-key-minimum-32-chars

# CORS Configuration
ASPNETCORE_ENVIRONMENT=Production
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# API Configuration
ASPNETCORE_URLS=https://+:443
```

### Deployment Checklist

- [ ] Set all required environment variables on your hosting platform
- [ ] Ensure `ASPNETCORE_ENVIRONMENT=Production`
- [ ] Use HTTPS only (`TrustServerCertificate=False`, `Encrypt=True`)
- [ ] Update `AllowedOrigins` in appsettings.Production.json to your domain
- [ ] Update `AllowedHosts` to your domain
- [ ] Use a strong JWT secret (minimum 32 characters)
- [ ] Enable logging for errors only in production
- [ ] Test database connection before deployment

## JWT Secret Generation

### Generate a Secure JWT Secret

Using PowerShell:
```powershell
# Generate a 32-character base64 string
[System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString() + (New-Guid).ToString())) | Select-Object -First 1
```

Using Bash:
```bash
# Generate a 32-character base64 string
openssl rand -base64 32
```

Or use any secure random string generator with at least 32 characters.

## Configuration Files

### appsettings.json
- Contains default/demo settings
- Tracked in git for reference
- **Never commit real secrets here**

### appsettings.Development.json
- Gitignored - use for local development
- Contains your local development configuration
- Each developer maintains their own copy

### appsettings.Production.json
- Template for production environment variables
- Uses `${ENV_VAR}` syntax for environment variable interpolation
- Deployed to production with environment variables

### appsettings.example.json
- Template reference for configuration structure
- Shows how to configure both SQLite and SQL Server
- Safe to commit to version control

## Best Practices

1. **Never commit secrets** - Ensure sensitive values are in .gitignore
2. **Use environment variables in production** - Don't hardcode secrets
3. **Rotate secrets regularly** - Change JWT secrets periodically
4. **Use strong keys** - JWT secrets should be at least 32 characters
5. **Enable HTTPS in production** - Always use encrypted connections
6. **Audit configuration** - Review appsettings files before deployment
7. **Use managed secrets services** - Consider Azure Key Vault, AWS Secrets Manager, etc.

## Testing with Different Configurations

### Test with SQLite
```bash
export ASPNETCORE_ENVIRONMENT=Development
dotnet run
```

### Test with SQL Server
Update `appsettings.Development.json`:
```json
{
  "DatabaseProvider": "SqlServer"
}
```

Then run:
```bash
dotnet run
```

## Troubleshooting

### JWT Key Error
**Error**: "JWT settings are missing from configuration"
**Solution**: Ensure `Jwt:Key` is set in either appsettings or user secrets

### Database Connection Error
**Error**: "The connection string is missing"
**Solution**: Check your database provider setting and connection string configuration

### CORS Issues in Production
**Solution**: Update `Cors:AllowedOrigins` in appsettings to include your production domain

## References

- [ASP.NET Core Configuration](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration)
- [Safe storage of app secrets in development](https://docs.microsoft.com/en-us/aspnet/core/security/app-secrets)
- [Azure Key Vault Configuration Provider](https://docs.microsoft.com/en-us/aspnet/core/security/key-vault-configuration)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8949)
