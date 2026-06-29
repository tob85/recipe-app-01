"use client";

import { useCallback, useEffect, useState } from "react";
import { AddRecipeDialog } from "@/components/AddRecipeDialog";
import { RecipeList } from "@/components/RecipeList";
import { getCategories, getRecipes } from "@/lib/recipe-service";
import {
  RecipeCategory,
  RecipeDetail,
  RecipeListItem,
  toListItem,
} from "@/lib/types/recipe";

export function RecipesPageClient() {
  const [recipes, setRecipes] = useState<RecipeListItem[]>([]);
  const [categorySuggestions, setCategorySuggestions] = useState<RecipeCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const loadRecipes = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const [recipeData, categoryData] = await Promise.all([
        getRecipes(),
        getCategories(),
      ]);
      setRecipes(recipeData);
      setCategorySuggestions(categoryData);
    } catch {
      setLoadError("Kunde inte ladda receptlistan.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRecipes();
  }, [loadRecipes]);

  function handleRecipeSaved(recipe: RecipeDetail) {
    setRecipes((current) => [toListItem(recipe), ...current]);
    setCategorySuggestions((current) => {
      const merged = new Map(current.map((category) => [category.id, category]));
      for (const category of recipe.categories) {
        merged.set(category.id, category);
      }
      return [...merged.values()].sort((left, right) =>
        left.name.localeCompare(right.name, "sv"),
      );
    });
  }

  function handleRecipeUpdated(updatedRecipe: RecipeListItem) {
    setRecipes((current) =>
      current.map((recipe) =>
        recipe.id === updatedRecipe.id ? updatedRecipe : recipe,
      ),
    );
    setCategorySuggestions((current) => {
      const merged = new Map(current.map((category) => [category.id, category]));
      for (const category of updatedRecipe.categories) {
        merged.set(category.id, category);
      }
      return [...merged.values()].sort((left, right) =>
        left.name.localeCompare(right.name, "sv"),
      );
    });
  }

  function handleRecipeDeleted(recipeId: string) {
    setRecipes((current) => current.filter((recipe) => recipe.id !== recipeId));
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-neutral-900">Mina recept</h1>
        <button
          type="button"
          data-testid="add-recipe-button"
          onClick={() => setIsDialogOpen(true)}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Lägg till recept
        </button>
      </div>

      {isLoading && <p className="text-neutral-600">Laddar recept...</p>}
      {loadError && (
        <p className="text-red-600" role="alert">
          {loadError}
        </p>
      )}
      {!isLoading && !loadError && (
        <RecipeList
          recipes={recipes}
          categorySuggestions={categorySuggestions}
          onRecipeUpdated={handleRecipeUpdated}
          onRecipeDeleted={handleRecipeDeleted}
        />
      )}

      <AddRecipeDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSaved={handleRecipeSaved}
      />
    </main>
  );
}
