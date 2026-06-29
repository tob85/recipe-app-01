using RecipeApi.Validation;

namespace RecipeApi.Tests.Unit;

public class RecipeInputValidatorTests
{
    [Theory]
    [InlineData("Namn", "https://example.com", null, null)]
    [InlineData("Namn", null, "Ingredienser", "Instruktioner")]
    [InlineData("Namn", "https://example.com", "Ingredienser", "Instruktioner")]
    [InlineData("Namn", "https://example.com", "Ingredienser", null)]
    public void Validate_ReturnsNull_WhenInputIsValid(
        string name,
        string? url,
        string? ingredients,
        string? instructions)
    {
        var result = RecipeInputValidator.Validate(name, url, ingredients, instructions);

        Assert.Null(result);
    }

    [Theory]
    [InlineData("   ", null, "Ingredienser", "Instruktioner")]
    [InlineData("", null, "Ingredienser", "Instruktioner")]
    public void Validate_ReturnsNameError_WhenNameIsMissing(
        string name,
        string? url,
        string? ingredients,
        string? instructions)
    {
        var result = RecipeInputValidator.Validate(name, url, ingredients, instructions);

        Assert.Equal(RecipeInputValidator.NameRequiredMessage, result);
    }

    [Theory]
    [InlineData("Namn", null, null, null)]
    [InlineData("Namn", "   ", null, null)]
    [InlineData("Namn", null, "Ingredienser", null)]
    [InlineData("Namn", null, null, "Instruktioner")]
    public void Validate_ReturnsContentError_WhenContentIsMissing(
        string name,
        string? url,
        string? ingredients,
        string? instructions)
    {
        var result = RecipeInputValidator.Validate(name, url, ingredients, instructions);

        Assert.Equal(RecipeInputValidator.ContentRequiredMessage, result);
    }
}
