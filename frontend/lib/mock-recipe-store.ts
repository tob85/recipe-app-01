import {
  CreateRecipeInput,
  RECIPE_TYPES,
  RecipeCategory,
  RecipeDetail,
  RecipeListItem,
} from "@/lib/types/recipe";
import { validateRecipeInput } from "@/lib/recipe-validation";

const STORAGE_KEY = "recipe-app-mock-recipes";

const initialRecipes: RecipeDetail[] = [
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

function readStore(): RecipeDetail[] {
  if (typeof window === "undefined") {
    return initialRecipes;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialRecipes));
    return initialRecipes;
  }

  return JSON.parse(stored) as RecipeDetail[];
}

function writeStore(recipes: RecipeDetail[]): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
  }
}

function createId(): string {
  return crypto.randomUUID();
}

function normalizeCategoryName(name: string): string {
  return name.trim();
}

function resolveCategories(
  recipes: RecipeDetail[],
  names: string[] | undefined,
): RecipeCategory[] {
  if (!names || names.length === 0) {
    return [];
  }

  const existingCategories = recipes.flatMap((recipe) => recipe.categories);
  const resolved: RecipeCategory[] = [];

  for (const rawName of names) {
    const name = normalizeCategoryName(rawName);
    if (!name) {
      continue;
    }

    const existing = existingCategories.find(
      (category) =>
        category.name.localeCompare(name, "sv", { sensitivity: "accent" }) === 0,
    );

    if (existing) {
      if (!resolved.some((category) => category.id === existing.id)) {
        resolved.push(existing);
      }
      continue;
    }

    const created = { id: createId(), name };
    resolved.push(created);
    existingCategories.push(created);
  }

  return resolved.sort((left, right) => left.name.localeCompare(right.name, "sv"));
}

function mergeCategories(
  current: RecipeCategory[],
  additions: RecipeCategory[],
): RecipeCategory[] {
  const merged = [...current];

  for (const category of additions) {
    const exists = merged.some(
      (existing) =>
        existing.name.localeCompare(category.name, "sv", { sensitivity: "accent" }) === 0,
    );

    if (!exists) {
      merged.push(category);
    }
  }

  return merged.sort((left, right) => left.name.localeCompare(right.name, "sv"));
}

export const mockRecipeStore = {
  getAll(): RecipeListItem[] {
    return readStore().map(({ ingredients, instructions, ...listItem }) => listItem);
  },

  getById(id: string): RecipeDetail | undefined {
    return readStore().find((recipe) => recipe.id === id);
  },

  getAllCategories(): RecipeCategory[] {
    const categories = new Map<string, RecipeCategory>();

    for (const recipe of readStore()) {
      for (const category of recipe.categories) {
        const key = category.name.toLocaleLowerCase("sv");
        if (!categories.has(key)) {
          categories.set(key, category);
        }
      }
    }

    return [...categories.values()].sort((left, right) =>
      left.name.localeCompare(right.name, "sv"),
    );
  },

  create(input: CreateRecipeInput): RecipeDetail {
    const validationError = validateRecipeInput(
      input.name,
      input.url,
      input.ingredients,
      input.instructions,
    );

    if (validationError) {
      throw new Error(validationError);
    }

    const trimmedName = input.name.trim();
    const trimmedUrl = input.url?.trim();
    const trimmedIngredients = input.ingredients?.trim();
    const trimmedInstructions = input.instructions?.trim();
    const isExternal = Boolean(trimmedUrl);

    const recipes = readStore();
    const categories = resolveCategories(recipes, input.categories);

    const recipe: RecipeDetail = {
      id: createId(),
      name: trimmedName,
      url: isExternal ? trimmedUrl : null,
      recipeType: isExternal ? RECIPE_TYPES.external : RECIPE_TYPES.own,
      categories,
      ingredients: trimmedIngredients || null,
      instructions: trimmedInstructions || null,
    };

    recipes.unshift(recipe);
    writeStore(recipes);

    return recipe;
  },

  addCategories(recipeId: string, names: string[]): RecipeDetail {
    const recipes = readStore();
    const recipe = recipes.find((item) => item.id === recipeId);

    if (!recipe) {
      throw new Error("Receptet hittades inte");
    }

    const additions = resolveCategories(recipes, names);
    recipe.categories = mergeCategories(recipe.categories, additions);
    writeStore(recipes);

    return recipe;
  },

  updateNotes(recipeId: string, notes: string | null): RecipeDetail {
    const recipes = readStore();
    const recipe = recipes.find((item) => item.id === recipeId);

    if (!recipe) {
      throw new Error("Receptet hittades inte");
    }

    recipe.notes = notes?.trim() || null;
    writeStore(recipes);

    return recipe;
  },
};
