"use client";

import Link from "next/link";
import {
  isExternalRecipe,
  RecipeListItemDto,
} from "@/lib/types/recipe";

interface RecipeListProps {
  recipes: RecipeListItemDto[];
}

export function RecipeList({ recipes }: RecipeListProps) {
  if (recipes.length === 0) {
    return (
      <p className="text-neutral-600">Du har inga sparade recept ännu.</p>
    );
  }

  return (
    <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white">
      {recipes.map((recipe) => (
        <li key={recipe.id} className="px-4 py-3">
          <div className="flex items-center gap-3">
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
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                Externt recept
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
