using System.Net;
using System.Text.Json;
using Fracto.Api.Helpers;

namespace Fracto.Api.Middleware;

public sealed class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (ApiException exception)
        {
            context.Response.StatusCode = (int)exception.StatusCode;
            context.Response.ContentType = "application/json";

            var payload = JsonSerializer.Serialize(new { message = exception.Message });
            await context.Response.WriteAsync(payload);
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "An unhandled exception occurred while processing the request.");

            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            context.Response.ContentType = "application/json";

            var payload = JsonSerializer.Serialize(new { message = "An unexpected server error occurred." });
            await context.Response.WriteAsync(payload);
        }
    }
}
