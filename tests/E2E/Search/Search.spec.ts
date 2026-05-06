import { expect, test } from "@playwright/test";

import { E2EApplicationPage } from "../../Support/E2EApplicationPage";

test.beforeEach(async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => window.localStorage.clear());
});

test("SearchInterface updates results while typing a kanji and clears them", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R31 - SearchInterface
  // Requirement: FUNCIONALES R33 - SearchInterface
  // @pre The user enters a valid kanji in the search bar.
  await app.goto("/search");
  await page.getByTestId("kanji-searchbar").locator("input").fill("日");

  // @inv Search updates dynamically and keeps the input term unchanged.
  await expect(app.visibleResults("search-results-panel").first()).toBeVisible();
  await expect(page.getByTestId("kanji-searchbar").locator("input")).toHaveValue("日");

  // @post Clearing empties both the search bar and results.
  await page.getByTestId("kanji-searchbar").locator("input").fill("");
  await expect(app.visibleResults("search-results-panel")).toHaveCount(0);
});

test("SearchInterface finds readings and renders preview information", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R32 - SearchInterface
  // Requirement: FUNCIONALES R35 - SearchInterface
  // Requirement: USABILIDAD R12 - SearchResultProps
  // @pre The user enters a valid reading term.
  await app.goto("/search");
  await page.getByTestId("kanji-searchbar").locator("input").fill("nichi");

  // @inv Result rows keep a consistent preview structure.
  const firstResult = app.visibleResults("search-results-panel").first();
  await expect(firstResult).toBeVisible();
  await expect(firstResult.locator(".result-kanji")).toBeVisible();
  await expect(firstResult.locator(".result-meta")).toBeVisible();
  await expect(firstResult.locator(".result-levels")).toBeVisible();

  // @post Related kanji results are visible for the reading.
  await expect(firstResult).toContainText(/日|ニチ|にち/i);
});

test("SearchInterface opens a selected search result without mutating the prior list", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R34 - SearchInterface
  // Requirement: USABILIDAD R11 - SearchResultProps
  // @pre A visible search result is selected.
  await app.goto("/search");
  await page.getByTestId("kanji-searchbar").locator("input").fill("日");
  const results = app.visibleResults("search-results-panel");
  await expect(results.first()).toBeVisible();
  const countBefore = await results.count();
  await results.first().click();

  // @post The selected kanji detail is rendered.
  await expect(page.getByTestId("kanji-detail-screen")).toBeVisible();
  await expect(page.getByTestId("kanji-detail-header")).toContainText("日");

  // @inv Back navigation returns to the same search state and result count.
  await page.getByTestId("kanji-back-button").click();
  await expect(page.getByTestId("search-screen")).toBeVisible();
  await expect(page.getByTestId("kanji-searchbar").locator("input")).toHaveValue("日");
  await expect(results).toHaveCount(countBefore);
});
