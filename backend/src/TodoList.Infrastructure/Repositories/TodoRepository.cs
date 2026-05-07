using Microsoft.EntityFrameworkCore;
using TodoList.Domain.Entities;
using TodoList.Domain.Enums;
using TodoList.Domain.Interfaces;
using TodoList.Infrastructure.Persistence;

namespace TodoList.Infrastructure.Repositories;

public class TodoRepository : ITodoRepository
{
    private readonly AppDbContext _db;
    public TodoRepository(AppDbContext db) => _db = db;

    public async Task<IEnumerable<Todo>> GetAllByUserAsync(
        Guid userId, Guid? categoryId, Priority? priority, bool? isCompleted, string? search, CancellationToken ct = default)
    {
        var query = _db.Todos
            .Include(t => t.Category)
            .Where(t => t.UserId == userId)
            .AsQueryable();

        if (categoryId.HasValue) query = query.Where(t => t.CategoryId == categoryId.Value);
        if (priority.HasValue) query = query.Where(t => t.Priority == priority.Value);
        if (isCompleted.HasValue) query = query.Where(t => t.IsCompleted == isCompleted.Value);
        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(t => t.Title.ToLower().Contains(search.ToLower()) ||
                                     (t.Description != null && t.Description.ToLower().Contains(search.ToLower())));

        return await query.OrderByDescending(t => t.CreatedAt).ToListAsync(ct);
    }

    public Task<Todo?> GetByIdAsync(Guid id, Guid userId, CancellationToken ct = default) =>
        _db.Todos.Include(t => t.Category)
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId, ct);

    public async Task<Todo> CreateAsync(Todo todo, CancellationToken ct = default)
    {
        _db.Todos.Add(todo);
        await _db.SaveChangesAsync(ct);
        return todo;
    }

    public async Task<Todo> UpdateAsync(Todo todo, CancellationToken ct = default)
    {
        await _db.SaveChangesAsync(ct);
        return todo;
    }

    public async Task DeleteAsync(Todo todo, CancellationToken ct = default)
    {
        _db.Todos.Remove(todo);
        await _db.SaveChangesAsync(ct);
    }
}
