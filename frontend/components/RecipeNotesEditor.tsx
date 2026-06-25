"use client";

import { useEffect, useState } from "react";
import { updateRecipeNotes } from "@/lib/recipe-service";
import { RecipeListItem } from "@/lib/types/recipe";

interface RecipeNotesEditorProps {
  recipe: RecipeListItem;
  onUpdated: (recipe: RecipeListItem) => void;
}

const PLACEHOLDER = "Anteckning";

export function RecipeNotesEditor({ recipe, onUpdated }: RecipeNotesEditorProps) {
  const [draft, setDraft] = useState(recipe.notes ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(recipe.notes ?? "");
  }, [recipe.id, recipe.notes]);

  async function handleSave() {
    const normalized = draft.trim();
    const current = recipe.notes?.trim() ?? "";

    if (normalized === current) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const updated = await updateRecipeNotes(recipe.id, normalized || null);
      onUpdated({
        ...recipe,
        notes: updated.notes ?? null,
      });
      setDraft(updated.notes ?? "");
    } catch (saveError) {
      const message =
        saveError instanceof Error && saveError.message
          ? saveError.message
          : "Kunde inte spara anteckningen.";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mt-2" data-testid="recipe-notes-editor">
      <label
        htmlFor={`recipe-notes-${recipe.id}`}
        className="mb-1 block text-xs font-medium text-neutral-600"
      >
        Anteckning
      </label>

      <div className="flex gap-2">
        <input
          id={`recipe-notes-${recipe.id}`}
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={PLACEHOLDER}
          data-testid={`recipe-notes-input-${recipe.id}`}
          className="min-w-0 flex-1 rounded-md border border-neutral-300 px-2 py-1 text-sm text-neutral-900"
        />
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isSaving}
          data-testid={`recipe-notes-save-${recipe.id}`}
          className="rounded-md border border-neutral-300 px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
        >
          Spara
        </button>
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
