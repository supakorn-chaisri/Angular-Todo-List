using TodoList.Domain.Entities;
using TodoList.Domain.Enums;

namespace TodoList.Domain.Interfaces;

public interface ITodoRepository
{
    Task<IEnumerable<Todo>> GetAllByUserAsync(Guid userId, Guid? categoryId, Priority? priority, bool? isCompleted, string? search, CancellationToken ct = default);
    Task<Todo?> GetByIdAsync(Guid id, Guid userId, CancellationToken ct = default);
    Task<Todo> CreateAsync(Todo todo, CancellationToken ct = default);
    Task<Todo> UpdateAsync(Todo todo, CancellationToken ct = default);
    Task DeleteAsync(Todo todo, CancellationToken ct = default);
}
