using TodoList.Domain.Enums;

namespace TodoList.Application.Features.Todos.DTOs;

public record TodoResponse(
    Guid Id,
    string Title,
    string? Description,
    bool IsCompleted,
    Priority Priority,
    DateTimeOffset? DueDate,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    Guid? CategoryId,
    string? CategoryName,
    string? CategoryColorHex
);

public record CreateTodoRequest(
    string Title,
    string? Description,
    Priority Priority,
    DateTimeOffset? DueDate,
    Guid? CategoryId
);

public record UpdateTodoRequest(
    string Title,
    string? Description,
    Priority Priority,
    DateTimeOffset? DueDate,
    Guid? CategoryId
);

public record TodoFilterParams(
    Guid? CategoryId,
    Priority? Priority,
    bool? IsCompleted,
    string? Search
);
