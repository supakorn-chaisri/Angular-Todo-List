namespace TodoList.Application.Features.Categories.DTOs;

public record CategoryResponse(Guid Id, string Name, string ColorHex, DateTimeOffset CreatedAt);
public record CreateCategoryRequest(string Name, string ColorHex);
public record UpdateCategoryRequest(string Name, string ColorHex);
