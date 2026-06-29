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
            Categories = ToCategories(recipe.Categories),
            Notes = recipe.Notes,
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
            Categories = ToCategories(recipe.Categories),
            Notes = recipe.Notes,
            Ingredients = recipe.Ingredients,
            Instructions = recipe.Instructions,
        };
    }

    private static List<RecipeCategory> ToCategories(IEnumerable<Category> categories)
    {
        return categories
            .OrderBy(category => category.Name)
            .Select(category => new RecipeCategory
            {
                Id = category.Id,
                Name = category.Name,
            })
            .ToList();
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
