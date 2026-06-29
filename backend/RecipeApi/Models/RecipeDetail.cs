namespace RecipeApi.Models;

public class RecipeDetail : RecipeListItem
{
    public string? Ingredients { get; set; }

    public string? Instructions { get; set; }
}
