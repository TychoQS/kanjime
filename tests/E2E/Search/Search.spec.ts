import { expect, test } from "@playwright/test";

import { E2EApplicationPage } from "../../Support/E2EApplicationPage";
import { TEST_KANJI_DAY, TEST_KANJI_MOON, TEST_READING_HI, TEST_READING_NICHI } from "../../Support/TestData";

test.beforeEach(async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => window.localStorage.clear());
});

test("[R31][E2E] SearchInterface updates results while typing a kanji", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R31 - SearchInterface
  // @pre The user enters a valid kanji in the search bar.
  await app.goto("/search");
  await page.getByTestId("kanji-searchbar").locator("input").fill(TEST_KANJI_DAY.character);

  // @post Related kanji results appear automatically.
  await expect(app.visibleResults("search-results-panel").first()).toBeVisible();
  const postConditionResults = await app.visibleResults("search-results-panel").allInnerTexts();

  // @inv Search updates dynamically and keeps the input term unchanged.
  await expect(page.getByTestId("kanji-searchbar").locator("input")).toHaveValue(TEST_KANJI_DAY.character);

  await page.getByTestId("kanji-searchbar").locator("input").fill(TEST_KANJI_MOON);
  await expect(app.visibleResults("search-results-panel").first()).toBeVisible();
  const invariantResults = await app.visibleResults("search-results-panel").allInnerTexts();

  expect(invariantResults).not.toEqual(postConditionResults);
});

test("[R32][E2E] SearchInterface finds results by reading", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R32 - SearchInterface
  // @pre The user enters a valid reading term.
  await app.goto("/search");
  await page.getByTestId("kanji-searchbar").locator("input").fill(TEST_READING_NICHI);

  // @post Related kanji results are visible for the reading.
  await expect(app.visibleResults("search-results-panel").first()).toBeVisible();
  const results = app.visibleResults("search-results-panel");
  const count = await results.count();
  for (let i = 0; i < count; i++) {
    await expect(results.nth(i)).toContainText(TEST_READING_NICHI);
  }
  const postConditionResults = await results.allInnerTexts();

  // @inv Search updates dynamically and keeps the reading term unchanged.
  await expect(page.getByTestId("kanji-searchbar").locator("input")).toHaveValue(TEST_READING_NICHI);

  await page.getByTestId("kanji-searchbar").locator("input").fill(TEST_READING_HI);
  await expect(app.visibleResults("search-results-panel").first()).toBeVisible();
  const invariantResults = await app.visibleResults("search-results-panel").allInnerTexts();

  expect(invariantResults).not.toEqual(postConditionResults);
});

test("[R33][E2E] SearchInterface clears the search bar and results", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R33 - SearchInterface
  // @pre The search screen contains a term and visible results.
  await app.goto("/search");
  await page.getByTestId("kanji-searchbar").locator("input").fill(TEST_KANJI_DAY.character);
  await expect(app.visibleResults("search-results-panel").first()).toBeVisible();

  // @post The search bar and results are empty.
  await page.getByTestId("kanji-searchbar").locator(".searchbar-clear-button").click();
  await expect(page.getByTestId("kanji-searchbar").locator("input")).toHaveValue("");
  await expect(app.visibleResults("search-results-panel")).toHaveCount(0);
});

test("[R34][E2E] SearchInterface opens a selected search result", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R34 - SearchInterface
  // @pre A visible search result is selected.
  await app.goto("/search");
  await page.getByTestId("kanji-searchbar").locator("input").fill(TEST_KANJI_DAY.character);
  const results = app.visibleResults("search-results-panel");
  await expect(results.first()).toBeVisible();
  const countBefore = await results.count();
  await results.first().click();

  // @post The selected kanji detail was reachable and the previous screen is restored.
  await expect(page.getByTestId("kanji-detail-screen")).toBeVisible();

  // @inv Returning keeps the prior result list unchanged.
  await page.getByTestId("kanji-back-button").click();
  await expect(results).toHaveCount(countBefore);
});

test("[R35][E2E] SearchInterface renders preview data for each result", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R35 - SearchInterface
  // @pre The user enters a valid search term.
  await app.goto("/search");
  await page.getByTestId("kanji-searchbar").locator("input").fill(TEST_KANJI_DAY.character);
  const firstResult = app.visibleResults("search-results-panel").first();

  // @inv The search input content is not modified by preview rendering.
  await expect(page.getByTestId("kanji-searchbar").locator("input")).toHaveValue(TEST_KANJI_DAY.character);

  // @post Preview data is visible in the result row.
  await expect(firstResult.locator(".result-kanji")).toBeVisible();
  await expect(firstResult.locator(".result-meta")).toBeVisible();
  await expect(firstResult.locator(".result-levels")).toBeVisible();
});

test("[R12][E2E] SearchResultProps shows readings and levels in result rows", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: USABILIDAD R12 - SearchResultProps
  // @pre A valid term produces at least one search result.
  await app.goto("/search");
  await page.getByTestId("kanji-searchbar").locator("input").fill(TEST_KANJI_DAY.character);
  const firstResult = app.visibleResults("search-results-panel").first();

  // @inv Result rows keep the same visible structure.
  await expect(firstResult.locator(".result-kanji")).toBeVisible();
  await expect(firstResult.locator(".result-meta")).toBeVisible();

  // @post The result row includes level metadata.
  await expect(firstResult.locator(".result-levels")).toBeVisible();
});
