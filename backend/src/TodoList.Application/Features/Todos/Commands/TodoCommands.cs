using MediatR;
using TodoList.Application.Common;
using TodoList.Application.Common.Exceptions;
using TodoList.Application.Features.Todos.DTOs;
using TodoList.Domain.Entities;
using TodoList.Domain.Enums;
using TodoList.Domain.Interfaces;

namespace TodoList.Application.Features.Todos.Commands;

// Helper
file static class Mapper
{
    public static TodoResponse ToResponse(Todo t) => new(
        t.Id, t.Title, t.Description, t.IsCompleted, t.Priority,
        t.DueDate, t.CreatedAt, t.UpdatedAt,
        t.CategoryId, t.Category?.Name, t.Category?.ColorHex
    );
}

// --- Get All ---
public record GetTodosQuery(Guid UserId, Guid? CategoryId, Priority? Priority, bool? IsCompleted, string? Search)
    : IRequest<ApiResponse<IEnumerable<TodoResponse>>>;

public class GetTodosHandler : IRequestHandler<GetTodosQuery, ApiResponse<IEnumerable<TodoResponse>>>
{
    private readonly ITodoRepository _repo;
    public GetTodosHandler(ITodoRepository repo) => _repo = repo;

    public async Task<ApiResponse<IEnumerable<TodoResponse>>> Handle(GetTodosQuery req, CancellationToken ct)
    {
        var todos = await _repo.GetAllByUserAsync(req.UserId, req.CategoryId, req.Priority, req.IsCompleted, req.Search, ct);
        return ApiResponse<IEnumerable<TodoResponse>>.Ok(todos.Select(Mapper.ToResponse));
    }
}

// --- Get By Id ---
public record GetTodoByIdQuery(Guid Id, Guid UserId) : IRequest<ApiResponse<TodoResponse>>;

public class GetTodoByIdHandler : IRequestHandler<GetTodoByIdQuery, ApiResponse<TodoResponse>>
{
    private readonly ITodoRepository _repo;
    public GetTodoByIdHandler(ITodoRepository repo) => _repo = repo;

    public async Task<ApiResponse<TodoResponse>> Handle(GetTodoByIdQuery req, CancellationToken ct)
    {
        var todo = await _repo.GetByIdAsync(req.Id, req.UserId, ct)
            ?? throw new NotFoundException(nameof(Todo), req.Id);
        return ApiResponse<TodoResponse>.Ok(Mapper.ToResponse(todo));
    }
}

// --- Create ---
public record CreateTodoCommand(Guid UserId, string Title, string? Description, Priority Priority, DateTimeOffset? DueDate, Guid? CategoryId)
    : IRequest<ApiResponse<TodoResponse>>;

public class CreateTodoHandler : IRequestHandler<CreateTodoCommand, ApiResponse<TodoResponse>>
{
    private readonly ITodoRepository _repo;
    public CreateTodoHandler(ITodoRepository repo) => _repo = repo;

    public async Task<ApiResponse<TodoResponse>> Handle(CreateTodoCommand req, CancellationToken ct)
    {
        var todo = new Todo
        {
            UserId = req.UserId, Title = req.Title, Description = req.Description,
            Priority = req.Priority, DueDate = req.DueDate, CategoryId = req.CategoryId
        };
        await _repo.CreateAsync(todo, ct);
        return ApiResponse<TodoResponse>.Ok(Mapper.ToResponse(todo), "Todo created.");
    }
}

// --- Update ---
public record UpdateTodoCommand(Guid Id, Guid UserId, string Title, string? Description, Priority Priority, DateTimeOffset? DueDate, Guid? CategoryId)
    : IRequest<ApiResponse<TodoResponse>>;

public class UpdateTodoHandler : IRequestHandler<UpdateTodoCommand, ApiResponse<TodoResponse>>
{
    private readonly ITodoRepository _repo;
    public UpdateTodoHandler(ITodoRepository repo) => _repo = repo;

    public async Task<ApiResponse<TodoResponse>> Handle(UpdateTodoCommand req, CancellationToken ct)
    {
        var todo = await _repo.GetByIdAsync(req.Id, req.UserId, ct)
            ?? throw new NotFoundException(nameof(Todo), req.Id);
        todo.Title = req.Title; todo.Description = req.Description;
        todo.Priority = req.Priority; todo.DueDate = req.DueDate;
        todo.CategoryId = req.CategoryId; todo.UpdatedAt = DateTimeOffset.UtcNow;
        await _repo.UpdateAsync(todo, ct);
        return ApiResponse<TodoResponse>.Ok(Mapper.ToResponse(todo), "Todo updated.");
    }
}

// --- Toggle ---
public record ToggleTodoCommand(Guid Id, Guid UserId) : IRequest<ApiResponse<TodoResponse>>;

public class ToggleTodoHandler : IRequestHandler<ToggleTodoCommand, ApiResponse<TodoResponse>>
{
    private readonly ITodoRepository _repo;
    public ToggleTodoHandler(ITodoRepository repo) => _repo = repo;

    public async Task<ApiResponse<TodoResponse>> Handle(ToggleTodoCommand req, CancellationToken ct)
    {
        var todo = await _repo.GetByIdAsync(req.Id, req.UserId, ct)
            ?? throw new NotFoundException(nameof(Todo), req.Id);
        todo.IsCompleted = !todo.IsCompleted;
        todo.UpdatedAt = DateTimeOffset.UtcNow;
        await _repo.UpdateAsync(todo, ct);
        return ApiResponse<TodoResponse>.Ok(Mapper.ToResponse(todo), "Todo toggled.");
    }
}

// --- Delete ---
public record DeleteTodoCommand(Guid Id, Guid UserId) : IRequest<ApiResponse<bool>>;

public class DeleteTodoHandler : IRequestHandler<DeleteTodoCommand, ApiResponse<bool>>
{
    private readonly ITodoRepository _repo;
    public DeleteTodoHandler(ITodoRepository repo) => _repo = repo;

    public async Task<ApiResponse<bool>> Handle(DeleteTodoCommand req, CancellationToken ct)
    {
        var todo = await _repo.GetByIdAsync(req.Id, req.UserId, ct)
            ?? throw new NotFoundException(nameof(Todo), req.Id);
        await _repo.DeleteAsync(todo, ct);
        return ApiResponse<bool>.Ok(true, "Todo deleted.");
    }
}
