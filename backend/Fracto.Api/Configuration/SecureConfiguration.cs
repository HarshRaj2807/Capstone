using Microsoft.Extensions.Configuration;

namespace Fracto.Api.Configuration;

/// <summary>
/// Helper class to validate and provide secure access to configuration values.
/// Ensures critical settings are properly configured for the current environment.
/// </summary>
public static class SecureConfiguration
{
    /// <summary>
    /// Validates that all required JWT settings are available.
    /// Throws an exception if any required settings are missing.
    /// </summary>
    public static void ValidateJwtSettings(IConfiguration configuration)
    {
        var jwtSection = configuration.GetSection(JwtSettings.SectionName);
        var key = jwtSection["Key"];
        var issuer = jwtSection["Issuer"];
        var audience = jwtSection["Audience"];

        if (string.IsNullOrWhiteSpace(key))
        {
            throw new InvalidOperationException(
                "JWT Key is missing. Set 'Jwt:Key' in configuration or the JWT_SECRET_KEY environment variable.");
        }

        if (string.IsNullOrWhiteSpace(issuer))
        {
            throw new InvalidOperationException(
                "JWT Issuer is missing. Set 'Jwt:Issuer' in configuration.");
        }

        if (string.IsNullOrWhiteSpace(audience))
        {
            throw new InvalidOperationException(
                "JWT Audience is missing. Set 'Jwt:Audience' in configuration.");
        }

        if (key.Length < 32)
        {
            var isDevelopment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";
            if (!isDevelopment)
            {
                throw new InvalidOperationException(
                    "JWT Key must be at least 32 characters long for security. Provide a stronger key in production.");
            }
        }
    }

    /// <summary>
    /// Validates that the database connection is properly configured.
    /// </summary>
    public static void ValidateDatabaseConfiguration(IConfiguration configuration)
    {
        var databaseProvider = configuration["DatabaseProvider"] ?? "SqlServer";

        if (string.Equals(databaseProvider, "SqlServer", StringComparison.OrdinalIgnoreCase))
        {
            var connectionString = configuration.GetConnectionString("SqlServerConnection");
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                throw new InvalidOperationException(
                    "SQL Server connection string is missing. Set 'ConnectionStrings:SqlServerConnection' in configuration.");
            }
        }
    }

    /// <summary>
    /// Validates CORS configuration for the current environment.
    /// </summary>
    public static void ValidateCorsConfiguration(IConfiguration configuration, string environment)
    {
        var allowedOrigins = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>();

        if (allowedOrigins == null || allowedOrigins.Length == 0)
        {
            throw new InvalidOperationException(
                "CORS AllowedOrigins is not configured. Set 'Cors:AllowedOrigins' in configuration.");
        }

        // Warn if using localhost in production
        if (environment == "Production")
        {
            var hasLocalhost = allowedOrigins.Any(o => o.Contains("localhost", StringComparison.OrdinalIgnoreCase)
                || o.Contains("127.0.0.1", StringComparison.OrdinalIgnoreCase));

            if (hasLocalhost)
            {
                throw new InvalidOperationException(
                    "CORS configuration includes localhost in production. Update 'Cors:AllowedOrigins' to production domains only.");
            }
        }
    }
}
