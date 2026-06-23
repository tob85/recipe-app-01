namespace RecipeApi.Entities;

public class Recipe
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Url { get; set; }

    public int RecipeTypeId { get; set; }

    public string? Ingredients { get; set; }

    public string? Instructions { get; set; }
}
