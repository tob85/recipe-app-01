"use client";

import { useState } from "react";
import { deleteRecipe } from "@/lib/recipe-service";

interface RecipeDeleteButtonProps {
  recipeId: string;
  recipeName: string;
  onDeleted: (recipeId: string) => void;
}

export function RecipeDeleteButton({
  recipeId,
  recipeName,
  onDeleted,
}: RecipeDeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);

    try {
      await deleteRecipe(recipeId);
      onDeleted(recipeId);
    } catch (deleteError) {
      const message =
        deleteError instanceof Error && deleteError.message
          ? deleteError.message
          : "Kunde inte radera receptet.";
      setError(message);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="shrink-0">
      <button
        type="button"
        onClick={() => void handleDelete()}
        disabled={isDeleting}
        data-testid={`recipe-delete-${recipeId}`}
        aria-label={`Radera receptet ${recipeName}`}
        className="rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
      >
        Radera
      </button>
      {error && (
        <p className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
