using Microsoft.EntityFrameworkCore;
using RecipeApi.Data;
using RecipeApi.Entities;
using RecipeApi.Models;

namespace RecipeApi.Services;

public class RecipeService(RecipeDbContext context, ICategoryService categoryService) : IRecipeService
{
    public async Task<IReadOnlyList<RecipeListItem>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var recipes = await QueryWithCategories()
            .OrderBy(recipe => recipe.Name)
            .ToListAsync(cancellationToken);

        return recipes.Select(recipe => recipe.ToListItem()).ToList();
    }

    public async Task<RecipeDetail?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var recipe = await QueryWithCategories()
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
            Ingredients = NullIfWhiteSpace(request.Ingredients),
            Instructions = NullIfWhiteSpace(request.Instructions),
        };

        context.Recipes.Add(recipe);
        await AssignCategoriesAsync(recipe, request.Categories, cancellationToken);
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
        recipe.Ingredients = NullIfWhiteSpace(request.Ingredients);
        recipe.Instructions = NullIfWhiteSpace(request.Instructions);

        await context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<RecipeDetail?> AddCategoriesAsync(
        Guid id,
        IEnumerable<string> names,
        CancellationToken cancellationToken = default)
    {
        var recipe = await context.Recipes
            .Include(entity => entity.Categories)
            .FirstOrDefaultAsync(entity => entity.Id == id, cancellationToken);

        if (recipe is null)
        {
            return null;
        }

        await AssignCategoriesAsync(recipe, names, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        return recipe.ToDetail();
    }

    public async Task<RecipeDetail?> UpdateNotesAsync(
        Guid id,
        string? notes,
        CancellationToken cancellationToken = default)
    {
        var recipe = await context.Recipes
            .Include(entity => entity.Categories)
            .FirstOrDefaultAsync(entity => entity.Id == id, cancellationToken);

        if (recipe is null)
        {
            return null;
        }

        recipe.Notes = NullIfWhiteSpace(notes);
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

    private IQueryable<Recipe> QueryWithCategories()
    {
        return context.Recipes
            .AsNoTracking()
            .Include(recipe => recipe.Categories);
    }

    private async Task AssignCategoriesAsync(
        Recipe recipe,
        IEnumerable<string>? names,
        CancellationToken cancellationToken)
    {
        if (names is null)
        {
            return;
        }

        var resolvedCategories = await categoryService.ResolveCategoriesAsync(names, cancellationToken);
        var existingIds = recipe.Categories.Select(category => category.Id).ToHashSet();

        foreach (var categoryModel in resolvedCategories)
        {
            if (existingIds.Contains(categoryModel.Id))
            {
                continue;
            }

            var category = context.Categories.Local
                .FirstOrDefault(entity => entity.Id == categoryModel.Id)
                ?? await context.Categories
                    .FirstAsync(entity => entity.Id == categoryModel.Id, cancellationToken);

            recipe.Categories.Add(category);
        }
    }

    private static string? NullIfWhiteSpace(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
}
