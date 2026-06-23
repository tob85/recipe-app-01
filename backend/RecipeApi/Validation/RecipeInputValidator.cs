namespace RecipeApi.Validation;

public static class RecipeInputValidator
{
    public const string NameRequiredMessage = "Receptnamn måste anges";

    public const string ContentRequiredMessage =
        "Ange en URL eller fyll i både ingredienser och instruktioner";

    public static bool HasValidContent(string? url, string? ingredients, string? instructions)
    {
        if (!string.IsNullOrWhiteSpace(url))
        {
            return true;
        }

        return !string.IsNullOrWhiteSpace(ingredients) && !string.IsNullOrWhiteSpace(instructions);
    }

    public static string? Validate(string name, string? url, string? ingredients, string? instructions)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return NameRequiredMessage;
        }

        if (!HasValidContent(url, ingredients, instructions))
        {
            return ContentRequiredMessage;
        }

        return null;
    }
}
