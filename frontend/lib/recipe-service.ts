import { mockRecipeStore } from "@/lib/mock-recipe-store";
import {
  CreateRecipeInput,
  RecipeDetail,
  RecipeListItem,
} from "@/lib/types/recipe";

function useMockData(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
}

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
}

export async function getRecipes(): Promise<RecipeListItem[]> {
  if (useMockData()) {
    return mockRecipeStore.getAll();
  }

  const response = await fetch(`${getApiBaseUrl()}/recipes`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Kunde inte hämta recept");
  }

  return response.json();
}

export async function getRecipeById(id: string): Promise<RecipeDetail | null> {
  if (useMockData()) {
    return mockRecipeStore.getById(id) ?? null;
  }

  const response = await fetch(`${getApiBaseUrl()}/recipes/${id}`, {
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Kunde inte hämta recept");
  }

  return response.json();
}

export async function createRecipe(
  input: CreateRecipeInput,
): Promise<RecipeDetail> {
  if (useMockData()) {
    return mockRecipeStore.create(input);
  }

  const response = await fetch(`${getApiBaseUrl()}/recipes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Kunde inte spara recept");
  }

  return response.json();
}
