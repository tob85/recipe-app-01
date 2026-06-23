using System.Net;
using System.Net.Http.Json;
using Microsoft.Extensions.DependencyInjection;
using RecipeApi.Data;
using RecipeApi.Models;

namespace RecipeApi.Tests.Integration;

public class RecipesApiTests(RecipeApiFactory factory) : IClassFixture<RecipeApiFactory>
{
    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task GetAll_ReturnsEmptyList_WhenNoRecipesExist()
    {
        await ResetDatabaseAsync();

        var response = await _client.GetAsync("/recipes");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var recipes = await response.Content.ReadFromJsonAsync<List<RecipeListItem>>();
        Assert.NotNull(recipes);
        Assert.Empty(recipes);
    }

    [Fact]
    public async Task Create_ReturnsCreatedRecipe_WithExternalType_WhenUrlIsProvided()
    {
        await ResetDatabaseAsync();

        var response = await _client.PostAsJsonAsync("/recipes", new CreateRecipeRequest
        {
            Name = "Pannkakor",
            Url = "https://example.com/pannkakor",
        });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var recipe = await response.Content.ReadFromJsonAsync<RecipeDetail>();
        Assert.NotNull(recipe);
        Assert.Equal("Pannkakor", recipe.Name);
        Assert.Equal(1, recipe.RecipeType.Id);
        Assert.Equal("Externt", recipe.RecipeType.Name);
    }

    [Fact]
    public async Task GetById_ReturnsRecipe_WhenRecipeExists()
    {
        await ResetDatabaseAsync();

        var createResponse = await _client.PostAsJsonAsync("/recipes", new CreateRecipeRequest
        {
            Name = "Chokladkaka",
            Ingredients = "Mjöl och socker",
            Instructions = "Blanda och grädda",
        });

        var created = await createResponse.Content.ReadFromJsonAsync<RecipeDetail>();
        Assert.NotNull(created);

        var response = await _client.GetAsync($"/recipes/{created.Id}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var recipe = await response.Content.ReadFromJsonAsync<RecipeDetail>();
        Assert.NotNull(recipe);
        Assert.Equal("Chokladkaka", recipe.Name);
        Assert.Equal(2, recipe.RecipeType.Id);
        Assert.Equal("Mjöl och socker", recipe.Ingredients);
    }

    [Fact]
    public async Task Update_ReturnsUpdatedRecipe_WhenRecipeExists()
    {
        await ResetDatabaseAsync();

        var createResponse = await _client.PostAsJsonAsync("/recipes", new CreateRecipeRequest
        {
            Name = "Soppa",
            Ingredients = "Grönsaker",
            Instructions = "Koka",
        });

        var created = await createResponse.Content.ReadFromJsonAsync<RecipeDetail>();
        Assert.NotNull(created);

        var response = await _client.PutAsJsonAsync($"/recipes/{created.Id}", new UpdateRecipeRequest
        {
            Name = "Morotssoppa",
            Ingredients = "Morötter",
            Instructions = "Koka",
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var updated = await response.Content.ReadFromJsonAsync<RecipeDetail>();
        Assert.NotNull(updated);
        Assert.Equal("Morotssoppa", updated.Name);
        Assert.Equal("Morötter", updated.Ingredients);
    }

    [Fact]
    public async Task Delete_ReturnsNoContent_WhenRecipeExists()
    {
        await ResetDatabaseAsync();

        var createResponse = await _client.PostAsJsonAsync("/recipes", new CreateRecipeRequest
        {
            Name = "Sallad",
            Url = "https://example.com/sallad",
        });

        var created = await createResponse.Content.ReadFromJsonAsync<RecipeDetail>();
        Assert.NotNull(created);

        var deleteResponse = await _client.DeleteAsync($"/recipes/{created.Id}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        var getResponse = await _client.GetAsync($"/recipes/{created.Id}");
        Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);
    }

    [Fact]
    public async Task Create_ReturnsBadRequest_WhenNameIsMissing()
    {
        await ResetDatabaseAsync();

        var response = await _client.PostAsJsonAsync("/recipes", new CreateRecipeRequest
        {
            Name = "   ",
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Create_ReturnsBadRequest_WhenContentIsMissing()
    {
        await ResetDatabaseAsync();

        var response = await _client.PostAsJsonAsync("/recipes", new CreateRecipeRequest
        {
            Name = "Tomt recept",
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var message = await response.Content.ReadAsStringAsync();
        Assert.Contains("Ange en URL eller fyll i både ingredienser och instruktioner", message);
    }

    [Fact]
    public async Task Create_ReturnsBadRequest_WhenOnlyIngredientsAreProvided()
    {
        await ResetDatabaseAsync();

        var response = await _client.PostAsJsonAsync("/recipes", new CreateRecipeRequest
        {
            Name = "Halvt recept",
            Ingredients = "Bara ingredienser",
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Create_ReturnsCreatedRecipe_WithUrlAndOwnContent_WhenBothAreProvided()
    {
        await ResetDatabaseAsync();

        var response = await _client.PostAsJsonAsync("/recipes", new CreateRecipeRequest
        {
            Name = "Pannkakor",
            Url = "https://example.com/pannkakor",
            Ingredients = "Mjöl och mjölk",
            Instructions = "Blanda och stek",
        });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var recipe = await response.Content.ReadFromJsonAsync<RecipeDetail>();
        Assert.NotNull(recipe);
        Assert.Equal("https://example.com/pannkakor", recipe.Url);
        Assert.Equal("Mjöl och mjölk", recipe.Ingredients);
        Assert.Equal("Blanda och stek", recipe.Instructions);
    }

    [Fact]
    public async Task Create_ReturnsCreatedRecipe_WithCategories_WhenCategoriesAreProvided()
    {
        await ResetDatabaseAsync();

        var response = await _client.PostAsJsonAsync("/recipes", new CreateRecipeRequest
        {
            Name = "Pannkakor",
            Url = "https://example.com/pannkakor",
            Categories = ["Frukost", "Snabbt"],
        });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var recipe = await response.Content.ReadFromJsonAsync<RecipeDetail>();
        Assert.NotNull(recipe);
        Assert.Equal(2, recipe.Categories.Count);
        Assert.Contains(recipe.Categories, category => category.Name == "Frukost");
    }

    [Fact]
    public async Task AddCategories_ReturnsUpdatedRecipe_WhenRecipeExists()
    {
        await ResetDatabaseAsync();

        var createResponse = await _client.PostAsJsonAsync("/recipes", new CreateRecipeRequest
        {
            Name = "Sallad",
            Url = "https://example.com/sallad",
        });

        var created = await createResponse.Content.ReadFromJsonAsync<RecipeDetail>();
        Assert.NotNull(created);

        var response = await _client.PostAsJsonAsync(
            $"/recipes/{created.Id}/categories",
            new AddCategoriesRequest { Names = ["Lunch"] });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var updated = await response.Content.ReadFromJsonAsync<RecipeDetail>();
        Assert.NotNull(updated);
        Assert.Single(updated.Categories);
        Assert.Equal("Lunch", updated.Categories[0].Name);
    }

    [Fact]
    public async Task GetCategories_ReturnsAllCategories()
    {
        await ResetDatabaseAsync();

        await _client.PostAsJsonAsync("/recipes", new CreateRecipeRequest
        {
            Name = "Pannkakor",
            Url = "https://example.com/pannkakor",
            Categories = ["Frukost"],
        });

        var response = await _client.GetAsync("/categories");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var categories = await response.Content.ReadFromJsonAsync<List<RecipeCategory>>();
        Assert.NotNull(categories);
        Assert.Single(categories);
        Assert.Equal("Frukost", categories[0].Name);
    }

    [Fact]
    public async Task UpdateNotes_ReturnsUpdatedRecipe_WhenRecipeExists()
    {
        await ResetDatabaseAsync();

        var createResponse = await _client.PostAsJsonAsync("/recipes", new CreateRecipeRequest
        {
            Name = "Pannkakor",
            Url = "https://example.com/pannkakor",
        });

        var created = await createResponse.Content.ReadFromJsonAsync<RecipeDetail>();
        Assert.NotNull(created);

        var response = await _client.PatchAsJsonAsync(
            $"/recipes/{created.Id}/notes",
            new UpdateRecipeNotesRequest { Notes = "Ta extra vitlök" });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var updated = await response.Content.ReadFromJsonAsync<RecipeDetail>();
        Assert.NotNull(updated);
        Assert.Equal("Ta extra vitlök", updated.Notes);
    }

    private async Task ResetDatabaseAsync()
    {
        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<RecipeDbContext>();
        db.Recipes.RemoveRange(db.Recipes);
        db.Categories.RemoveRange(db.Categories);
        await db.SaveChangesAsync();
    }
}
