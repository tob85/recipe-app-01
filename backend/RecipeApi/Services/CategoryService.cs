using Microsoft.EntityFrameworkCore;
using RecipeApi.Data;
using RecipeApi.Entities;
using RecipeApi.Models;

namespace RecipeApi.Services;

public class CategoryService(RecipeDbContext context) : ICategoryService
{
    public async Task<IReadOnlyList<RecipeCategory>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var categories = await context.Categories
            .AsNoTracking()
            .OrderBy(category => category.Name)
            .ToListAsync(cancellationToken);

        return categories.Select(ToRecipeCategory).ToList();
    }

    public async Task<IReadOnlyList<RecipeCategory>> ResolveCategoriesAsync(
        IEnumerable<string> names,
        CancellationToken cancellationToken = default)
    {
        var normalizedNames = names
            .Select(NormalizeName)
            .Where(name => name is not null)
            .Select(name => name!)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        if (normalizedNames.Count == 0)
        {
            return [];
        }

        var allCategories = await context.Categories.ToListAsync(cancellationToken);
        var existingByName = allCategories.ToDictionary(
            category => category.Name,
            StringComparer.OrdinalIgnoreCase);

        var resolved = new List<Category>();

        foreach (var name in normalizedNames)
        {
            if (existingByName.TryGetValue(name, out var existing))
            {
                resolved.Add(existing);
                continue;
            }

            var category = new Category
            {
                Id = Guid.NewGuid(),
                Name = name,
            };

            context.Categories.Add(category);
            existingByName[name] = category;
            resolved.Add(category);
        }

        return resolved
            .OrderBy(category => category.Name)
            .Select(ToRecipeCategory)
            .ToList();
    }

    private static RecipeCategory ToRecipeCategory(Category category)
    {
        return new RecipeCategory
        {
            Id = category.Id,
            Name = category.Name,
        };
    }

    private static string? NormalizeName(string? name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return null;
        }

        return name.Trim();
    }
}
