using System.Data;
using Fracto.Api.Data;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace Fracto.Api.Tests.Infrastructure;

public sealed class SqliteTestDbContextFactory : IAsyncDisposable
{
    private readonly SqliteConnection _connection = new("DataSource=:memory:");
    private bool _databaseCreated;

    public async Task<FractoDbContext> CreateDbContextAsync()
    {
        if (_connection.State != ConnectionState.Open)
        {
            await _connection.OpenAsync();
        }

        var options = new DbContextOptionsBuilder<FractoDbContext>()
            .UseSqlite(_connection)
            .Options;

        var dbContext = new FractoDbContext(options);

        if (!_databaseCreated)
        {
            await dbContext.Database.EnsureCreatedAsync();
            _databaseCreated = true;
        }

        return dbContext;
    }

    public async ValueTask DisposeAsync()
    {
        await _connection.DisposeAsync();
    }
}
