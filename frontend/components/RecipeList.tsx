"use client";

import Link from "next/link";
import { RecipeCategoryEditor } from "@/components/RecipeCategoryEditor";
import { RecipeDeleteButton } from "@/components/RecipeDeleteButton";
import { RecipeNotesEditor } from "@/components/RecipeNotesEditor";
import {
  isExternalRecipe,
  RecipeCategory,
  RecipeListItem,
} from "@/lib/types/recipe";

interface RecipeListProps {
  recipes: RecipeListItem[];
  categorySuggestions: RecipeCategory[];
  onRecipeUpdated: (recipe: RecipeListItem) => void;
  onRecipeDeleted: (recipeId: string) => void;
}

export function RecipeList({
  recipes,
  categorySuggestions,
  onRecipeUpdated,
  onRecipeDeleted,
}: RecipeListProps) {
  if (recipes.length === 0) {
    return (
      <p className="text-neutral-600">Du har inga sparade recept ännu.</p>
    );
  }

  return (
    <ul
      data-testid="recipe-list"
      className="divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white"
    >
      {recipes.map((recipe) => (
        <li key={recipe.id} data-testid="recipe-list-item" className="px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              {recipe.url ? (
                <a
                  href={recipe.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-neutral-900 underline-offset-2 hover:underline"
                >
                  {recipe.name}
                </a>
              ) : (
                <Link
                  href={`/recept/${recipe.id}`}
                  className="font-medium text-neutral-900 underline-offset-2 hover:underline"
                >
                  {recipe.name}
                </Link>
              )}

              {isExternalRecipe(recipe) && (
                <span
                  data-testid="external-recipe-badge"
                  className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800"
                >
                  Externt recept
                </span>
              )}
            </div>

            <RecipeDeleteButton
              recipeId={recipe.id}
              recipeName={recipe.name}
              onDeleted={onRecipeDeleted}
            />
          </div>

          <RecipeCategoryEditor
            recipe={recipe}
            suggestions={categorySuggestions}
            onUpdated={onRecipeUpdated}
          />

          <RecipeNotesEditor recipe={recipe} onUpdated={onRecipeUpdated} />
        </li>
      ))}
    </ul>
  );
}
