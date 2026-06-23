using Microsoft.EntityFrameworkCore;
using RecipeApi.Data;
using RecipeApi.Entities;
using RecipeApi.Models;

namespace RecipeApi.Services;

public class RecipeService(RecipeDbContext context) : IRecipeService
{
    public async Task<IReadOnlyList<RecipeListItem>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var recipes = await context.Recipes
            .AsNoTracking()
            .OrderBy(recipe => recipe.Name)
            .ToListAsync(cancellationToken);

        return recipes.Select(recipe => recipe.ToListItem()).ToList();
    }

    public async Task<RecipeDetail?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var recipe = await context.Recipes
            .AsNoTracking()
            .FirstOrDefaultAsync(entity => entity.Id == id, cancellationToken);

        return recipe?.ToDetail();
    }

    public async Task<RecipeDetail> CreateAsync(CreateRecipeRequest request, CancellationToken cancellationToken = default)
    {
        var trimmedUrl = string.IsNullOrWhiteSpace(request.Url) ? null : request.Url.Trim();
        var isExternal = trimmedUrl is not null;

        var recipe = new Recipe
        {
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            Url = isExternal ? trimmedUrl : null,
            RecipeTypeId = RecipeMappings.ResolveRecipeTypeId(trimmedUrl),
            Ingredients = isExternal ? null : NullIfWhiteSpace(request.Ingredients),
            Instructions = isExternal ? null : NullIfWhiteSpace(request.Instructions),
        };

        context.Recipes.Add(recipe);
        await context.SaveChangesAsync(cancellationToken);

        return recipe.ToDetail();
    }

    public async Task<RecipeDetail?> UpdateAsync(Guid id, UpdateRecipeRequest request, CancellationToken cancellationToken = default)
    {
        var recipe = await context.Recipes.FirstOrDefaultAsync(entity => entity.Id == id, cancellationToken);
        if (recipe is null)
        {
            return null;
        }

        var trimmedUrl = string.IsNullOrWhiteSpace(request.Url) ? null : request.Url.Trim();
        var isExternal = trimmedUrl is not null;

        recipe.Name = request.Name.Trim();
        recipe.Url = isExternal ? trimmedUrl : null;
        recipe.RecipeTypeId = RecipeMappings.ResolveRecipeTypeId(trimmedUrl);
        recipe.Ingredients = isExternal ? null : NullIfWhiteSpace(request.Ingredients);
        recipe.Instructions = isExternal ? null : NullIfWhiteSpace(request.Instructions);

        await context.SaveChangesAsync(cancellationToken);

        return recipe.ToDetail();
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var recipe = await context.Recipes.FirstOrDefaultAsync(entity => entity.Id == id, cancellationToken);
        if (recipe is null)
        {
            return false;
        }

        context.Recipes.Remove(recipe);
        await context.SaveChangesAsync(cancellationToken);

        return true;
    }

    private static string? NullIfWhiteSpace(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
}
