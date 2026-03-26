using System.Security.Cryptography;
using Microsoft.IdentityModel.Tokens;

namespace Fracto.Api.Helpers;

public static class RefreshTokenHelper
{
    public static string GenerateToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(64);
        return Base64UrlEncoder.Encode(bytes);
    }

    public static string HashToken(string token)
    {
        using var sha = SHA256.Create();
        var hash = sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(token));
        return Convert.ToHexString(hash);
    }
}
