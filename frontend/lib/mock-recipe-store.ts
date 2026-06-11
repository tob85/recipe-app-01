import {
  CreateRecipeInput,
  RECIPE_TYPES,
  RecipeDetailDto,
  RecipeListItemDto,
} from "@/lib/types/recipe";

const STORAGE_KEY = "recipe-app-mock-recipes";

const initialRecipes: RecipeDetailDto[] = [
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    name: "Köttbullar med potatismos",
    url: "https://example.com/kottbullar",
    recipeType: RECIPE_TYPES.external,
    categories: [],
  },
  {
    id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    name: "Mormors äppelpaj",
    url: null,
    recipeType: RECIPE_TYPES.own,
    categories: [],
    ingredients: "3 äpplen\n2 dl socker\n1 dl mjöl\n100 g smör",
    instructions:
      "Skala och skiva äpplena.\nBlanda torra ingredienser.\nGrädda i 200°C i 40 minuter.",
  },
];

function readStore(): RecipeDetailDto[] {
  if (typeof window === "undefined") {
    return initialRecipes;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialRecipes));
    return initialRecipes;
  }

  return JSON.parse(stored) as RecipeDetailDto[];
}

function writeStore(recipes: RecipeDetailDto[]): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
  }
}

function createId(): string {
  return crypto.randomUUID();
}

export const mockRecipeStore = {
  getAll(): RecipeListItemDto[] {
    return readStore().map(({ ingredients, instructions, ...listItem }) => listItem);
  },

  getById(id: string): RecipeDetailDto | undefined {
    return readStore().find((recipe) => recipe.id === id);
  },

  create(input: CreateRecipeInput): RecipeDetailDto {
    const trimmedName = input.name.trim();
    const trimmedUrl = input.url?.trim();
    const trimmedIngredients = input.ingredients?.trim();
    const trimmedInstructions = input.instructions?.trim();
    const isExternal = Boolean(trimmedUrl);

    const recipe: RecipeDetailDto = {
      id: createId(),
      name: trimmedName,
      url: isExternal ? trimmedUrl : null,
      recipeType: isExternal ? RECIPE_TYPES.external : RECIPE_TYPES.own,
      categories: [],
      ingredients: isExternal ? null : trimmedIngredients || null,
      instructions: isExternal ? null : trimmedInstructions || null,
    };

    const recipes = readStore();
    recipes.unshift(recipe);
    writeStore(recipes);

    return recipe;
  },
};
