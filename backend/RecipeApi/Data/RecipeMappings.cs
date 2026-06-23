using RecipeApi.Entities;
using RecipeApi.Models;

namespace RecipeApi.Data;

internal static class RecipeMappings
{
    public static RecipeListItem ToListItem(this Recipe recipe)
    {
        return new RecipeListItem
        {
            Id = recipe.Id,
            Name = recipe.Name,
            Url = recipe.Url,
            RecipeType = ToRecipeType(recipe.RecipeTypeId),
            Categories = [],
        };
    }

    public static RecipeDetail ToDetail(this Recipe recipe)
    {
        return new RecipeDetail
        {
            Id = recipe.Id,
            Name = recipe.Name,
            Url = recipe.Url,
            RecipeType = ToRecipeType(recipe.RecipeTypeId),
            Categories = [],
            Ingredients = recipe.Ingredients,
            Instructions = recipe.Instructions,
        };
    }

    public static int ResolveRecipeTypeId(string? url)
    {
        return string.IsNullOrWhiteSpace(url) ? RecipeTypeIds.Own : RecipeTypeIds.External;
    }

    private static RecipeType ToRecipeType(int recipeTypeId)
    {
        return recipeTypeId switch
        {
            RecipeTypeIds.External => new RecipeType { Id = RecipeTypeIds.External, Name = "Externt" },
            _ => new RecipeType { Id = RecipeTypeIds.Own, Name = "Eget" },
        };
    }
}
