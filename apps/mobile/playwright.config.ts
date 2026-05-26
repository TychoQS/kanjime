import { defineConfig, devices } from "@playwright/test";

/**
 * Base Playwright infrastructure kept ready for future E2E coverage.
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
    baseURL: "http://127.0.0.1:4173",
    trace: "on",
    screenshot: "on",
    video: "on",
  },
  reporter: [["html", { outputFolder: "playwright-report" }]],
  outputDir: "test-results",
  webServer: {
    command: "npm run preview -- --host 127.0.0.1 --port 4173",
    reuseExistingServer: !process.env.CI,
    url: "http://127.0.0.1:4173"
  },
  projects: [
    {
      name: "android",
      use: {
        ...devices["Pixel 5"]
      }
    },
    {
      name: "ios",
      use: {
        ...devices["iPhone 12"]
      }
    },
    {
      name: "android-tablet",
      use: {
        ...devices["Galaxy Tab S4"]
      }
    },
    {
      name: "ipad",
      use: {
        ...devices["iPad Pro 11"]
      }
    }
  ]
});