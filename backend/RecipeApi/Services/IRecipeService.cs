using RecipeApi.Models;

namespace RecipeApi.Services;

public interface IRecipeService
{
    Task<IReadOnlyList<RecipeListItem>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<RecipeDetail?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<RecipeDetail> CreateAsync(CreateRecipeRequest request, CancellationToken cancellationToken = default);

    Task<RecipeDetail?> UpdateAsync(Guid id, UpdateRecipeRequest request, CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
