"use client";

import { FormEvent, useState } from "react";
import { addRecipeCategories } from "@/lib/recipe-service";
import { RecipeCategory, RecipeListItem } from "@/lib/types/recipe";

interface RecipeCategoryEditorProps {
  recipe: RecipeListItem;
  suggestions: RecipeCategory[];
  onUpdated: (recipe: RecipeListItem) => void;
}

export function RecipeCategoryEditor({
  recipe,
  suggestions,
  onUpdated,
}: RecipeCategoryEditorProps) {
  const [draft, setDraft] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listId = `recipe-category-suggestions-${recipe.id}`;

  const availableSuggestions = suggestions.filter(
    (suggestion) =>
      !recipe.categories.some(
        (category) =>
          category.name.localeCompare(suggestion.name, "sv", { sensitivity: "accent" }) === 0,
      ),
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = draft.trim();
    if (!name) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const updated = await addRecipeCategories(recipe.id, [name]);
      onUpdated({
        ...recipe,
        categories: updated.categories,
      });
      setDraft("");
    } catch (submitError) {
      const message =
        submitError instanceof Error && submitError.message
          ? submitError.message
          : "Kunde inte lägga till kategorin.";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mt-2" data-testid="recipe-category-editor">
      {recipe.categories.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-2" data-testid="recipe-category-list">
          {recipe.categories.map((category) => (
            <li key={category.id}>
              <span
                data-testid="recipe-category-badge"
                className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
              >
                {category.name}
              </span>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          list={availableSuggestions.length > 0 ? listId : undefined}
          placeholder="Lägg till kategori"
          data-testid={`recipe-category-input-${recipe.id}`}
          className="min-w-0 flex-1 rounded-md border border-neutral-300 px-2 py-1 text-sm text-neutral-900"
        />
        {availableSuggestions.length > 0 && (
          <datalist id={listId}>
            {availableSuggestions.map((suggestion) => (
              <option key={suggestion.id} value={suggestion.name} />
            ))}
          </datalist>
        )}
        <button
          type="submit"
          disabled={isSaving}
          data-testid={`recipe-category-add-${recipe.id}`}
          className="rounded-md border border-neutral-300 px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
        >
          Spara
        </button>
      </form>

      {error && (
        <p className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
