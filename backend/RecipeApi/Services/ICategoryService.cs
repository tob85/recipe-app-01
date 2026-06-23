using RecipeApi.Models;

namespace RecipeApi.Services;

public interface ICategoryService
{
    Task<IReadOnlyList<RecipeCategory>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyList<RecipeCategory>> ResolveCategoriesAsync(
        IEnumerable<string> names,
        CancellationToken cancellationToken = default);
}
