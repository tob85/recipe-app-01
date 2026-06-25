export const RECIPE_NAME_REQUIRED_MESSAGE = "Receptnamn måste anges";

export const RECIPE_CONTENT_REQUIRED_MESSAGE =
  "Ange en URL eller fyll i både ingredienser och instruktioner";

export function hasValidRecipeContent(
  url?: string | null,
  ingredients?: string | null,
  instructions?: string | null,
): boolean {
  if (url?.trim()) {
    return true;
  }

  return Boolean(ingredients?.trim() && instructions?.trim());
}

export function validateRecipeInput(
  name: string,
  url?: string,
  ingredients?: string,
  instructions?: string,
): string | null {
  if (!name.trim()) {
    return RECIPE_NAME_REQUIRED_MESSAGE;
  }

  if (!hasValidRecipeContent(url, ingredients, instructions)) {
    return RECIPE_CONTENT_REQUIRED_MESSAGE;
  }

  return null;
}
