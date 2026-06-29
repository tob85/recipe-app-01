namespace RecipeApi.Models;

public class UpdateRecipeRequest
{
    public string Name { get; set; } = string.Empty;

    public string? Url { get; set; }

    public string? Ingredients { get; set; }

    public string? Instructions { get; set; }
}
