"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { CategoryInput } from "@/components/CategoryInput";
import { createRecipe, getCategories } from "@/lib/recipe-service";
import { validateRecipeInput } from "@/lib/recipe-validation";
import { RecipeCategory, RecipeDetail } from "@/lib/types/recipe";

interface AddRecipeDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved: (recipe: RecipeDetail) => void;
}

const HELP_TEXT =
  "Ange en url till receptet du vill spara eller lägg till ingredienser och instruktioner för att skapa ett eget recept.";

export function AddRecipeDialog({ open, onClose, onSaved }: AddRecipeDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [categorySuggestions, setCategorySuggestions] = useState<RecipeCategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    void getCategories()
      .then(setCategorySuggestions)
      .catch(() => {
        setCategorySuggestions([]);
      });
  }, [open]);

  function resetForm() {
    setName("");
    setUrl("");
    setIngredients("");
    setInstructions("");
    setCategories([]);
    setError(null);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateRecipeInput(name, url, ingredients, instructions);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const recipe = await createRecipe({
        name,
        url,
        ingredients,
        instructions,
        categories,
      });
      resetForm();
      onSaved(recipe);
      onClose();
    } catch (submitError) {
      const message =
        submitError instanceof Error && submitError.message
          ? submitError.message
          : "Kunde inte spara receptet. Försök igen.";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      data-testid="add-recipe-dialog"
      className="w-full max-w-lg rounded-lg border border-neutral-200 bg-white p-0 shadow-xl backdrop:bg-black/40"
      onClose={handleClose}
    >
      <form onSubmit={handleSubmit} className="p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <h2 className="text-xl font-semibold text-neutral-900">
            Lägg till recept
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-neutral-500 hover:text-neutral-800"
            aria-label="Stäng dialog"
          >
            ✕
          </button>
        </div>

        <p className="mb-6 text-sm text-neutral-600">{HELP_TEXT}</p>

        <div className="space-y-6">
          <div>
            <label
              htmlFor="recipe-name"
              className="mb-1 block text-sm font-medium text-neutral-700"
            >
              Receptnamn
            </label>
            <input
              id="recipe-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-neutral-900"
            />
          </div>

          <CategoryInput
            categories={categories}
            onChange={setCategories}
            suggestions={categorySuggestions}
            inputTestId="recipe-category-input"
            addButtonTestId="recipe-category-add"
          />

          <section>
            <h3 className="mb-2 text-sm font-medium text-neutral-700">URL</h3>
            <input
              id="recipe-url"
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://..."
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-neutral-900"
            />
          </section>

          <section>
            <h3 className="mb-2 text-sm font-medium text-neutral-700">
              Ingredienser och instruktioner
            </h3>
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="recipe-ingredients"
                  className="mb-1 block text-sm text-neutral-600"
                >
                  Ingredienser
                </label>
                <textarea
                  id="recipe-ingredients"
                  value={ingredients}
                  onChange={(event) => setIngredients(event.target.value)}
                  rows={4}
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-neutral-900"
                />
              </div>
              <div>
                <label
                  htmlFor="recipe-instructions"
                  className="mb-1 block text-sm text-neutral-600"
                >
                  Instruktioner
                </label>
                <textarea
                  id="recipe-instructions"
                  value={instructions}
                  onChange={(event) => setInstructions(event.target.value)}
                  rows={4}
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-neutral-900"
                />
              </div>
            </div>
          </section>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
          >
            Spara
          </button>
        </div>
      </form>
    </dialog>
  );
}
