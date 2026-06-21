"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getRecipeById } from "@/lib/recipe-service";
import { RecipeDetail } from "@/lib/types/recipe";

export default function RecipeDetailPage() {
  const params = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRecipe() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getRecipeById(params.id);
        if (!data) {
          setError("Receptet hittades inte.");
          return;
        }

        if (data.url) {
          window.location.href = data.url;
          return;
        }

        setRecipe(data);
      } catch {
        setError("Kunde inte ladda receptet.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadRecipe();
  }, [params.id]);

  if (isLoading) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-neutral-600">Laddar recept...</p>
      </main>
    );
  }

  if (error || !recipe) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-red-600" role="alert">
          {error ?? "Receptet hittades inte."}
        </p>
        <Link
          href="/recept"
          className="mt-4 inline-block text-neutral-900 underline-offset-2 hover:underline"
        >
          Tillbaka till receptlistan
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link
        href="/recept"
        className="mb-6 inline-block text-sm text-neutral-600 underline-offset-2 hover:underline"
      >
        ← Tillbaka till receptlistan
      </Link>

      <article
        data-testid="recipe-detail"
        className="rounded-lg border border-neutral-200 bg-white p-6"
      >
        <h1 className="mb-6 text-2xl font-semibold text-neutral-900">
          {recipe.name}
        </h1>

        {recipe.ingredients && (
          <section className="mb-6">
            <h2 className="mb-2 text-lg font-medium text-neutral-900">
              Ingredienser
            </h2>
            <p className="whitespace-pre-line text-neutral-700">
              {recipe.ingredients}
            </p>
          </section>
        )}

        {recipe.instructions && (
          <section>
            <h2 className="mb-2 text-lg font-medium text-neutral-900">
              Instruktioner
            </h2>
            <p className="whitespace-pre-line text-neutral-700">
              {recipe.instructions}
            </p>
          </section>
        )}
      </article>
    </main>
  );
}
