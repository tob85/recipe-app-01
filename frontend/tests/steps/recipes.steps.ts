import { expect, Page } from "@playwright/test";
import { createBdd, DataTable } from "playwright-bdd";

const MOCK_RECIPE_STORAGE_KEY = "recipe-app-mock-recipes";

const RECIPE_TYPES = {
  external: { id: 1, name: "Externt" },
  own: { id: 2, name: "Eget" },
} as const;

interface RecipeTableRow {
  namn: string;
  url: string;
  typ: string;
}

interface TestRecipe {
  id: string;
  name: string;
  url: string | null;
  recipeType: { id: number; name: string };
  categories: [];
  ingredients: string | null;
  instructions: string | null;
}

async function gotoRecipesPage(page: Page): Promise<void> {
  await page.goto("/recept");
}

async function seedRecipes(page: Page, rows: RecipeTableRow[]): Promise<void> {
  const recipes: TestRecipe[] = rows.map((row, index) => {
    const isExternal = row.typ.toLowerCase() === "externt";
    const url = row.url.trim() || null;

    return {
      id: `test-recipe-${index + 1}`,
      name: row.namn,
      url: isExternal ? url : null,
      recipeType: isExternal ? RECIPE_TYPES.external : RECIPE_TYPES.own,
      categories: [],
      ingredients: isExternal ? null : "Test ingredienser",
      instructions: isExternal ? null : "Test instruktioner",
    };
  });

  await page.evaluate(
    ({ key, data }) => {
      localStorage.setItem(key, JSON.stringify(data));
    },
    { key: MOCK_RECIPE_STORAGE_KEY, data: recipes },
  );
}

async function clearStoredRecipes(page: Page): Promise<void> {
  await page.evaluate((key) => {
    localStorage.setItem(key, JSON.stringify([]));
  }, MOCK_RECIPE_STORAGE_KEY);
}

async function waitForRecipesPage(page: Page): Promise<void> {
  await page.getByRole("heading", { name: "Mina recept" }).waitFor();
  await page.getByText("Laddar recept...").waitFor({ state: "hidden" });
}

async function reloadRecipesPage(page: Page): Promise<void> {
  await page.reload();
  await waitForRecipesPage(page);
}

async function openAddRecipeDialog(page: Page): Promise<void> {
  await page.getByTestId("add-recipe-button").click();
  await page.getByTestId("add-recipe-dialog").waitFor();
}

const { Given, When, Then } = createBdd();

Given("att användaren är på receptsidan", async ({ page }) => {
  await gotoRecipesPage(page);
  await clearStoredRecipes(page);
  await reloadRecipesPage(page);
});

Given(
  "att följande recept finns sparade:",
  async ({ page }, dataTable: DataTable) => {
    const rows = dataTable.hashes() as RecipeTableRow[];
    await seedRecipes(page, rows);
  },
);

Given(
  "att användaren har öppnat dialogen för att lägga till recept",
  async ({ page }) => {
    await gotoRecipesPage(page);
    await clearStoredRecipes(page);
    await reloadRecipesPage(page);
    await openAddRecipeDialog(page);
  },
);

When("sidan laddas", async ({ page }) => {
  await reloadRecipesPage(page);
});

When("sidan visas", async ({ page }) => {
  await waitForRecipesPage(page);
});

When(
  'användaren klickar på {string}',
  async ({ page }, buttonLabel: string) => {
    await page.getByRole("button", { name: buttonLabel }).click();
  },
);

When(
  "användaren anger ett receptnamn {string}",
  async ({ page }, recipeName: string) => {
    await page.locator("#recipe-name").fill(recipeName);
  },
);

When(
  "användaren anger en URL {string}",
  async ({ page }, url: string) => {
    await page.locator("#recipe-url").fill(url);
  },
);

When(
  "användaren anger ingredienser {string}",
  async ({ page }, ingredients: string) => {
    await page.locator("#recipe-ingredients").fill(ingredients);
  },
);

When(
  "användaren anger instruktioner {string}",
  async ({ page }, instructions: string) => {
    await page.locator("#recipe-instructions").fill(instructions);
  },
);

When("användaren inte anger något receptnamn", async ({ page }) => {
  await page.locator("#recipe-name").fill("");
});

When(
  'användaren klickar på receptets namn {string}',
  async ({ page }, recipeName: string) => {
    await page.getByRole("link", { name: recipeName }).click();
  },
);

Then("ska en lista med alla sparade recept visas", async ({ page }) => {
  await expect(page.getByTestId("recipe-list")).toBeVisible();
  await expect(page.getByTestId("recipe-list-item")).toHaveCount(2);
});

Then("endast receptens namn ska visas", async ({ page }) => {
  await expect(
    page.getByRole("link", { name: "Köttbullar med potatismos" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Mormors äppelpaj" })).toBeVisible();
});

Then("hela receptets innehåll ska inte visas", async ({ page }) => {
  await expect(page.getByText("Test ingredienser")).toHaveCount(0);
  await expect(page.getByText("Test instruktioner")).toHaveCount(0);
  await expect(page.getByTestId("recipe-detail")).toHaveCount(0);
});

Then(
  "ska det finnas en knapp för att lägga till ett nytt recept",
  async ({ page }) => {
    await expect(page.getByTestId("add-recipe-button")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Lägg till recept" }),
    ).toBeVisible();
  },
);

Then("ska en dialog öppnas", async ({ page }) => {
  await expect(page.getByTestId("add-recipe-dialog")).toBeVisible();
});

Then("dialogen ska innehålla ett fält för receptnamn", async ({ page }) => {
  await expect(page.locator("#recipe-name")).toBeVisible();
  await expect(page.getByLabel("Receptnamn")).toBeVisible();
});

Then("dialogen ska innehålla ett avsnitt för URL", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "URL" })).toBeVisible();
  await expect(page.locator("#recipe-url")).toBeVisible();
});

Then(
  "dialogen ska innehålla ett avsnitt för ingredienser och instruktioner",
  async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Ingredienser och instruktioner" }),
    ).toBeVisible();
    await expect(page.locator("#recipe-ingredients")).toBeVisible();
    await expect(page.locator("#recipe-instructions")).toBeVisible();
  },
);

Then(
  "dialogen ska innehålla en knapp för att spara receptet",
  async ({ page }) => {
    await expect(page.getByRole("button", { name: "Spara" })).toBeVisible();
  },
);

Then("ska receptet sparas", async ({ page }) => {
  await expect(page.getByTestId("add-recipe-dialog")).toBeHidden();
});

Then("receptet ska visas i receptlistan", async ({ page }) => {
  await expect(page.getByTestId("recipe-list")).toBeVisible();
  await expect(page.getByTestId("recipe-list-item")).toHaveCount(1);
});

Then(
  "receptet ska vara markerat som ett externt recept",
  async ({ page }) => {
    await expect(page.getByRole("link", { name: "Pannkakor" })).toBeVisible();
    await expect(page.getByTestId("external-recipe-badge")).toBeVisible();
    await expect(page.getByText("Externt recept")).toBeVisible();
  },
);

Then("ska receptet inte sparas", async ({ page }) => {
  await expect(page.getByTestId("add-recipe-dialog")).toBeVisible();
  await expect(page.getByTestId("recipe-list-item")).toHaveCount(0);
});

Then(
  "användaren ska få ett felmeddelande om att receptnamn måste anges",
  async ({ page }) => {
    await expect(page.getByText("Receptnamn måste anges")).toBeVisible();
  },
);

Then("ska receptets URL öppnas i en ny flik", async ({ page, context }) => {
  await expect
    .poll(() => context.pages().length, { timeout: 5000 })
    .toBeGreaterThan(1);

  const popup = context.pages().find((openPage) => openPage !== page);
  expect(popup).toBeDefined();
  await expect(popup!).toHaveURL("https://example.com/pannkakor");
});

Then(
  "ska användaren skickas till en sida där det egna receptet visas",
  async ({ page }) => {
    await expect(page).toHaveURL(/\/recept\/test-recipe-1$/);
    await expect(page.getByTestId("recipe-detail")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Chokladkaka", level: 1 }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Ingredienser" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Instruktioner" })).toBeVisible();
  },
);
