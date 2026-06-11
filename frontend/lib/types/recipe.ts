export interface RecipeType {
  id: number;
  name: string;
}

export interface RecipeCategory {
  id: string;
  name: string;
}

export interface RecipeListItem {
  id: string;
  name: string;
  url?: string | null;
  recipeType: RecipeType;
  categories: RecipeCategory[];
}

export interface RecipeDetail extends RecipeListItem {
  ingredients?: string | null;
  instructions?: string | null;
}

export interface CreateRecipeInput {
  name: string;
  url?: string;
  ingredients?: string;
  instructions?: string;
}

export const RECIPE_TYPES = {
  external: { id: 1, name: "Externt" },
  own: { id: 2, name: "Eget" },
} as const;

export function isExternalRecipe(recipe: RecipeListItem): boolean {
  return recipe.recipeType.id === RECIPE_TYPES.external.id;
}

export function toListItem({
  ingredients: _ingredients,
  instructions: _instructions,
  ...listItem
}: RecipeDetail): RecipeListItem {
  return listItem;
}
