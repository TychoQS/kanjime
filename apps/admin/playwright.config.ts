import { defineConfig, devices } from "@playwright/test";

/**
 * Base Playwright infrastructure kept ready for future admin E2E coverage.
 */
export default defineConfig({
  testDir: "./tests/E2E",
  timeout: 180_000,
  expect: {
    timeout: 5_000
  },
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  preserveOutput: "always",
  use: {
    baseURL: "http://127.0.0.1:4174",
    trace: "on",
    screenshot: "on",
    video: "on"
  },
  reporter: [["html", { outputFolder: "playwright-report" }]],
  outputDir: "test-results",
  projects: [
    {
      name: "admin-desktop",
      use: {
        ...devices["Desktop Chrome"]
      }
    }
  ]
});
