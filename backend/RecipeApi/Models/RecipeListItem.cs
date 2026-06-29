namespace RecipeApi.Models;

public class RecipeListItem
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Url { get; set; }

    public RecipeType RecipeType { get; set; } = new();

    public List<RecipeCategory> Categories { get; set; } = [];

    public string? Notes { get; set; }
}
