import { expect, test } from "@playwright/test";

import { E2EApplicationPage } from "../../Support/E2EApplicationPage";

test.beforeEach(async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => window.localStorage.clear());
});

test("SearchInterface updates results while typing a kanji", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R31 - SearchInterface
  // @pre The user enters a valid kanji in the search bar.
  await app.goto("/search");
  await page.getByTestId("kanji-searchbar").locator("input").fill("日");

  // @inv Search updates dynamically and keeps the input term unchanged.
  await expect(page.getByTestId("kanji-searchbar").locator("input")).toHaveValue("日");

  // @post Related kanji results appear automatically.
  await expect(app.visibleResults("search-results-panel").first()).toBeVisible();
});

test("SearchInterface finds results by reading", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R32 - SearchInterface
  // @pre The user enters a valid reading term.
  await app.goto("/search");
  await page.getByTestId("kanji-searchbar").locator("input").fill("nichi");

  // @inv Search updates dynamically and keeps the reading term unchanged.
  await expect(page.getByTestId("kanji-searchbar").locator("input")).toHaveValue("nichi");

  // @post Related kanji results are visible for the reading.
  await expect(app.visibleResults("search-results-panel").first()).toContainText(/日|ニチ|にち/i);
});

test("SearchInterface clears the search bar and results", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R33 - SearchInterface
  // @pre The search screen contains a term and visible results.
  await app.goto("/search");
  await page.getByTestId("kanji-searchbar").locator("input").fill("日");
  await expect(app.visibleResults("search-results-panel").first()).toBeVisible();

  // @exception Clearing an empty effective term is avoided by clearing only after content exists.
  await page.getByTestId("kanji-searchbar").locator("input").fill("");

  // @post The search bar and results are empty.
  await expect(page.getByTestId("kanji-searchbar").locator("input")).toHaveValue("");
  await expect(app.visibleResults("search-results-panel")).toHaveCount(0);
});

test("SearchInterface opens a selected search result", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R34 - SearchInterface
  // @pre A visible search result is selected.
  await app.goto("/search");
  await page.getByTestId("kanji-searchbar").locator("input").fill("日");
  const results = app.visibleResults("search-results-panel");
  await expect(results.first()).toBeVisible();
  const countBefore = await results.count();
  await results.first().click();

  // @inv Returning keeps the prior result list unchanged.
  await page.getByTestId("kanji-back-button").click();
  await expect(results).toHaveCount(countBefore);

  // @post The selected kanji detail was reachable and the previous screen is restored.
  await expect(page.getByTestId("search-screen")).toBeVisible();
});

test("SearchInterface renders preview data for each result", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R35 - SearchInterface
  // @pre The user enters a valid search term.
  await app.goto("/search");
  await page.getByTestId("kanji-searchbar").locator("input").fill("日");
  const firstResult = app.visibleResults("search-results-panel").first();

  // @inv The search input content is not modified by preview rendering.
  await expect(page.getByTestId("kanji-searchbar").locator("input")).toHaveValue("日");

  // @post Preview data is visible in the result row.
  await expect(firstResult.locator(".result-kanji")).toBeVisible();
  await expect(firstResult.locator(".result-meta")).toBeVisible();
  await expect(firstResult.locator(".result-levels")).toBeVisible();
});

test("SearchResultProps shows readings and levels in result rows", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: USABILIDAD R12 - SearchResultProps
  // @pre A valid term produces at least one search result.
  await app.goto("/search");
  await page.getByTestId("kanji-searchbar").locator("input").fill("日");
  const firstResult = app.visibleResults("search-results-panel").first();

  // @inv Result rows keep the same visible structure.
  await expect(firstResult.locator(".result-kanji")).toBeVisible();
  await expect(firstResult.locator(".result-meta")).toBeVisible();

  // @post The result row includes level metadata.
  await expect(firstResult.locator(".result-levels")).toBeVisible();
});
