export interface RecipeTypeDto {
  id: number;
  name: string;
}

export interface RecipeCategoryDto {
  id: string;
  name: string;
}

export interface RecipeListItemDto {
  id: string;
  name: string;
  url?: string | null;
  recipeType: RecipeTypeDto;
  categories: RecipeCategoryDto[];
}

export interface RecipeDetailDto extends RecipeListItemDto {
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

export function isExternalRecipe(recipe: RecipeListItemDto): boolean {
  return recipe.recipeType.id === RECIPE_TYPES.external.id;
}

export function toListItem({
  ingredients: _ingredients,
  instructions: _instructions,
  ...listItem
}: RecipeDetailDto): RecipeListItemDto {
  return listItem;
}
