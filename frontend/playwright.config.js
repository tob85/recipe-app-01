const { defineConfig, devices } = require("@playwright/test");
const { defineBddConfig } = require("playwright-bdd");

const testDir = defineBddConfig({
  features: "tests/features/**/*.feature",
  steps: "tests/steps/**/*.ts",
});

module.exports = defineConfig({
  testDir,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    env: {
      NEXT_PUBLIC_USE_MOCK_DATA: "true",
    },
  },
});
