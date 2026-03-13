using System.Net;

namespace Fracto.Api.Helpers;

public class ApiException(string message, HttpStatusCode statusCode) : Exception(message)
{
    public HttpStatusCode StatusCode { get; } = statusCode;
}

public sealed class NotFoundException(string message) : ApiException(message, HttpStatusCode.NotFound);

public sealed class ValidationException(string message) : ApiException(message, HttpStatusCode.BadRequest);

public sealed class ConflictException(string message) : ApiException(message, HttpStatusCode.Conflict);

public sealed class ForbiddenException(string message) : ApiException(message, HttpStatusCode.Forbidden);
