using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using RecipeApi.Data;

namespace RecipeApi.Tests.Support;

internal sealed class TestDbContextFactory : IAsyncDisposable
{
    private readonly SqliteConnection _connection;

    private TestDbContextFactory(SqliteConnection connection, RecipeDbContext context)
    {
        _connection = connection;
        Context = context;
    }

    public RecipeDbContext Context { get; }

    public static async Task<TestDbContextFactory> CreateAsync()
    {
        var connection = new SqliteConnection("Data Source=:memory:");
        await connection.OpenAsync();

        var context = new RecipeDbContext(
            new DbContextOptionsBuilder<RecipeDbContext>()
                .UseSqlite(connection)
                .Options);

        await context.Database.EnsureCreatedAsync();

        return new TestDbContextFactory(connection, context);
    }

    public async Task ResetAsync()
    {
        Context.Recipes.RemoveRange(Context.Recipes);
        Context.Categories.RemoveRange(Context.Categories);
        await Context.SaveChangesAsync();
    }

    public async ValueTask DisposeAsync()
    {
        await Context.DisposeAsync();
        await _connection.DisposeAsync();
    }
}
