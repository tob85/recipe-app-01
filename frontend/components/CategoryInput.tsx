"use client";

import { KeyboardEvent, useId, useState } from "react";
import { RecipeCategory } from "@/lib/types/recipe";

interface CategoryInputProps {
  categories: string[];
  onChange: (categories: string[]) => void;
  suggestions?: RecipeCategory[];
  label?: string;
  inputTestId?: string;
  addButtonTestId?: string;
}

function normalizeCategoryName(name: string): string {
  return name.trim();
}

export function CategoryInput({
  categories,
  onChange,
  suggestions = [],
  label = "Kategorier",
  inputTestId,
  addButtonTestId,
}: CategoryInputProps) {
  const listId = useId();
  const [draft, setDraft] = useState("");

  function addCategory(name: string) {
    const normalized = normalizeCategoryName(name);
    if (!normalized) {
      return;
    }

    const exists = categories.some(
      (category) => category.localeCompare(normalized, "sv", { sensitivity: "accent" }) === 0,
    );

    if (exists) {
      setDraft("");
      return;
    }

    onChange([...categories, normalized]);
    setDraft("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      addCategory(draft);
    }
  }

  function removeCategory(name: string) {
    onChange(categories.filter((category) => category !== name));
  }

  const availableSuggestions = suggestions.filter(
    (suggestion) =>
      !categories.some(
        (category) =>
          category.localeCompare(suggestion.name, "sv", { sensitivity: "accent" }) === 0,
      ),
  );

  return (
    <section>
      <h3 className="mb-2 text-sm font-medium text-neutral-700">{label}</h3>

      {categories.length > 0 && (
        <ul className="mb-3 flex flex-wrap gap-2" data-testid="category-list">
          {categories.map((category) => (
            <li key={category}>
              <span
                data-testid="category-badge"
                className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-800"
              >
                {category}
                <button
                  type="button"
                  onClick={() => removeCategory(category)}
                  className="text-neutral-500 hover:text-neutral-800"
                  aria-label={`Ta bort kategorin ${category}`}
                >
                  ×
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <input
          id="recipe-categories"
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          list={availableSuggestions.length > 0 ? listId : undefined}
          placeholder="T.ex. Förrätt"
          data-testid={inputTestId}
          className="min-w-0 flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-900"
        />
        {availableSuggestions.length > 0 && (
          <datalist id={listId}>
            {availableSuggestions.map((suggestion) => (
              <option key={suggestion.id} value={suggestion.name} />
            ))}
          </datalist>
        )}
        <button
          type="button"
          onClick={() => addCategory(draft)}
          data-testid={addButtonTestId}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          Lägg till
        </button>
      </div>
    </section>
  );
}
