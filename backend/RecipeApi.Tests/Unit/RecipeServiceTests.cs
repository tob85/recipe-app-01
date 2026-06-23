using RecipeApi.Models;
using RecipeApi.Services;
using RecipeApi.Tests.Support;

namespace RecipeApi.Tests.Unit;

public class RecipeServiceTests : IAsyncLifetime
{
    private TestDbContextFactory _db = null!;
    private RecipeService _service = null!;

    public async Task InitializeAsync()
    {
        _db = await TestDbContextFactory.CreateAsync();
        _service = new RecipeService(_db.Context);
    }

    public async Task DisposeAsync()
    {
        await _db.DisposeAsync();
    }

    [Fact]
    public async Task GetAllAsync_ReturnsEmptyList_WhenNoRecipesExist()
    {
        var recipes = await _service.GetAllAsync();

        Assert.Empty(recipes);
    }

    [Fact]
    public async Task GetAllAsync_ReturnsRecipesOrderedByName()
    {
        await _service.CreateAsync(new CreateRecipeRequest { Name = "Zucchini" });
        await _service.CreateAsync(new CreateRecipeRequest { Name = "Apple pie" });
        await _service.CreateAsync(new CreateRecipeRequest { Name = "Morotsoppa" });

        var recipes = await _service.GetAllAsync();
        var names = recipes.Select(recipe => recipe.Name).ToList();

        Assert.Equal(["Apple pie", "Morotsoppa", "Zucchini"], names);
    }

    [Fact]
    public async Task CreateAsync_CreatesExternalRecipe_WhenUrlIsProvided()
    {
        var recipe = await _service.CreateAsync(new CreateRecipeRequest
        {
            Name = "Pannkakor",
            Url = "https://example.com/pannkakor",
            Ingredients = "Ska ignoreras",
            Instructions = "Ska ignoreras",
        });

        Assert.Equal("Pannkakor", recipe.Name);
        Assert.Equal("https://example.com/pannkakor", recipe.Url);
        Assert.Equal(1, recipe.RecipeType.Id);
        Assert.Equal("Externt", recipe.RecipeType.Name);
        Assert.Null(recipe.Ingredients);
        Assert.Null(recipe.Instructions);
    }

    [Fact]
    public async Task CreateAsync_CreatesOwnRecipe_WhenUrlIsMissing()
    {
        var recipe = await _service.CreateAsync(new CreateRecipeRequest
        {
            Name = "Chokladkaka",
            Ingredients = "Mjöl, socker",
            Instructions = "Blanda och grädda",
        });

        Assert.Null(recipe.Url);
        Assert.Equal(2, recipe.RecipeType.Id);
        Assert.Equal("Eget", recipe.RecipeType.Name);
        Assert.Equal("Mjöl, socker", recipe.Ingredients);
        Assert.Equal("Blanda och grädda", recipe.Instructions);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsNull_WhenRecipeDoesNotExist()
    {
        var recipe = await _service.GetByIdAsync(Guid.NewGuid());

        Assert.Null(recipe);
    }

    [Fact]
    public async Task UpdateAsync_ReturnsNull_WhenRecipeDoesNotExist()
    {
        var updated = await _service.UpdateAsync(Guid.NewGuid(), new UpdateRecipeRequest
        {
            Name = "Finns inte",
        });

        Assert.Null(updated);
    }

    [Fact]
    public async Task UpdateAsync_UpdatesRecipe_WhenRecipeExists()
    {
        var created = await _service.CreateAsync(new CreateRecipeRequest { Name = "Soppa" });

        var updated = await _service.UpdateAsync(created.Id, new UpdateRecipeRequest
        {
            Name = "Morotssoppa",
            Ingredients = "Morötter",
            Instructions = "Koka",
        });

        Assert.NotNull(updated);
        Assert.Equal("Morotssoppa", updated.Name);
        Assert.Equal("Morötter", updated.Ingredients);
        Assert.Equal("Koka", updated.Instructions);
    }

    [Fact]
    public async Task DeleteAsync_ReturnsFalse_WhenRecipeDoesNotExist()
    {
        var deleted = await _service.DeleteAsync(Guid.NewGuid());

        Assert.False(deleted);
    }

    [Fact]
    public async Task DeleteAsync_ReturnsTrue_AndRemovesRecipe_WhenRecipeExists()
    {
        var created = await _service.CreateAsync(new CreateRecipeRequest { Name = "Sallad" });

        var deleted = await _service.DeleteAsync(created.Id);
        var recipe = await _service.GetByIdAsync(created.Id);

        Assert.True(deleted);
        Assert.Null(recipe);
    }
}
