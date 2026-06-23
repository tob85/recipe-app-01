import { mockRecipeStore } from "@/lib/mock-recipe-store";
import {
  CreateRecipeInput,
  RecipeCategory,
  RecipeDetail,
  RecipeListItem,
} from "@/lib/types/recipe";

function useMockData(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
}

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5029";
}

async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const text = await response.text();
    return text || fallback;
  } catch {
    return fallback;
  }
}

export async function getRecipes(): Promise<RecipeListItem[]> {
  if (useMockData()) {
    return mockRecipeStore.getAll();
  }

  const response = await fetch(`${getApiBaseUrl()}/recipes`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Kunde inte hämta recept"));
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
    throw new Error(await readErrorMessage(response, "Kunde inte hämta recept"));
  }

  return response.json();
}

export async function getCategories(): Promise<RecipeCategory[]> {
  if (useMockData()) {
    return mockRecipeStore.getAllCategories();
  }

  const response = await fetch(`${getApiBaseUrl()}/categories`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Kunde inte hämta kategorier"));
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
    throw new Error(await readErrorMessage(response, "Kunde inte spara recept"));
  }

  return response.json();
}

export async function addRecipeCategories(
  recipeId: string,
  names: string[],
): Promise<RecipeDetail> {
  if (useMockData()) {
    return mockRecipeStore.addCategories(recipeId, names);
  }

  const response = await fetch(`${getApiBaseUrl()}/recipes/${recipeId}/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ names }),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Kunde inte lägga till kategorier"));
  }

  return response.json();
}

export async function updateRecipeNotes(
  recipeId: string,
  notes: string | null,
): Promise<RecipeDetail> {
  if (useMockData()) {
    return mockRecipeStore.updateNotes(recipeId, notes);
  }

  const response = await fetch(`${getApiBaseUrl()}/recipes/${recipeId}/notes`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notes }),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Kunde inte spara anteckningen"));
  }

  return response.json();
}
