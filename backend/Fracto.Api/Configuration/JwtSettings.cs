namespace Fracto.Api.Configuration;

public sealed class JwtSettings
{
    public const string SectionName = "Jwt";

    public string Issuer { get; set; } = "FractoApi";

    public string Audience { get; set; } = "FractoClient";

    public string Key { get; set; } = "ChangeThisDevelopmentKey1234567890!";

    public int ExpiryMinutes { get; set; } = 180;

    public int RefreshTokenExpiryDays { get; set; } = 7;
}
