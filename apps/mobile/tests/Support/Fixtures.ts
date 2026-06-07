import { test as base, expect } from "@playwright/test";

/**
 * Extended Playwright fixtures for mobile E2E tests.
 *
 * Intercepts Firestore network requests before every test so that
 * the version check always fails silently, preventing the update
 * notification toast from blocking UI interactions.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route("**/firestore.googleapis.com/**", route =>
      route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ error: { code: 404, status: "NOT_FOUND" } })
      })
    );
    await use(page);
  }
});

export { expect };
