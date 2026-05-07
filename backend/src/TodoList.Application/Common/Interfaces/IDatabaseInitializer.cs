namespace TodoList.Application.Common.Interfaces;

public interface IDatabaseInitializer
{
    Task MigrateAsync(CancellationToken ct = default);
}
