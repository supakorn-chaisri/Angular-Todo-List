using Microsoft.EntityFrameworkCore;
using TodoList.Application.Common.Interfaces;
using TodoList.Infrastructure.Persistence;

namespace TodoList.Infrastructure.Services;

public class DatabaseInitializer : IDatabaseInitializer
{
    private readonly AppDbContext _db;

    public DatabaseInitializer(AppDbContext db)
    {
        _db = db;
    }

    public async Task MigrateAsync(CancellationToken ct = default)
    {
        await _db.Database.MigrateAsync(ct);
    }
}
