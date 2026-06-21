"use client";

import { useCallback, useEffect, useState } from "react";
import { AddRecipeDialog } from "@/components/AddRecipeDialog";
import { RecipeList } from "@/components/RecipeList";
import { getRecipes } from "@/lib/recipe-service";
import {
  RecipeDetail,
  RecipeListItem,
  toListItem,
} from "@/lib/types/recipe";

export function RecipesPageClient() {
  const [recipes, setRecipes] = useState<RecipeListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const loadRecipes = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const data = await getRecipes();
      setRecipes(data);
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
      {!isLoading && !loadError && <RecipeList recipes={recipes} />}

      <AddRecipeDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSaved={handleRecipeSaved}
      />
    </main>
  );
}
