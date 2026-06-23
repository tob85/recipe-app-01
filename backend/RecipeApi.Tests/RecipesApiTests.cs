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

    private async Task ResetDatabaseAsync()
    {
        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<RecipeDbContext>();
        db.Recipes.RemoveRange(db.Recipes);
        await db.SaveChangesAsync();
    }
}
