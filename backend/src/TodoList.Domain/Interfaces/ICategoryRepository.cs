using TodoList.Domain.Entities;

namespace TodoList.Domain.Interfaces;

public interface ICategoryRepository
{
    Task<IEnumerable<Category>> GetAllByUserAsync(Guid userId, CancellationToken ct = default);
    Task<Category?> GetByIdAsync(Guid id, Guid userId, CancellationToken ct = default);
    Task<Category> CreateAsync(Category category, CancellationToken ct = default);
    Task<Category> UpdateAsync(Category category, CancellationToken ct = default);
    Task DeleteAsync(Category category, CancellationToken ct = default);
}
