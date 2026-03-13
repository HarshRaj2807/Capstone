using System.Security.Claims;
using Fracto.Api.Entities;

namespace Fracto.Api.Helpers;

public static class ClaimsPrincipalExtensions
{
    public static int GetUserId(this ClaimsPrincipal principal)
    {
        var value = principal.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(value, out var userId)
            ? userId
            : throw new ValidationException("Unable to resolve the current user.");
    }

    public static UserRole GetUserRole(this ClaimsPrincipal principal)
    {
        var value = principal.FindFirstValue(ClaimTypes.Role);
        return Enum.TryParse<UserRole>(value, true, out var role)
            ? role
            : throw new ValidationException("Unable to resolve the current user role.");
    }
}
