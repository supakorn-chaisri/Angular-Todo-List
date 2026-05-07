using System.Net;
using System.Text.Json;
using TodoList.Application.Common;
using TodoList.Application.Common.Exceptions;

namespace TodoList.WebAPI.Middleware;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next; _logger = logger;
    }

    public async Task InvokeAsync(HttpContext ctx)
    {
        try { await _next(ctx); }
        catch (Exception ex) { await HandleException(ctx, ex); }
    }

    private async Task HandleException(HttpContext ctx, Exception ex)
    {
        _logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);

        var (status, message, errors) = ex switch
        {
            ValidationException ve => (HttpStatusCode.BadRequest, "Validation failed",
                ve.Errors.SelectMany(e => e.Value).ToList()),
            NotFoundException nfe => (HttpStatusCode.NotFound, nfe.Message, (List<string>?)null),
            UnauthorizedException ue => (HttpStatusCode.Unauthorized, ue.Message, (List<string>?)null),
            _ => (HttpStatusCode.InternalServerError, "An unexpected error occurred.", (List<string>?)null)
        };

        ctx.Response.StatusCode = (int)status;
        ctx.Response.ContentType = "application/json";

        var response = ApiResponse<object>.Fail(message, errors);
        await ctx.Response.WriteAsync(JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        }));
    }
}
