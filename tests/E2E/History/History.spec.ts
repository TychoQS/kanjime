import { expect, test } from "@playwright/test";

import { E2EApplicationPage } from "../../Support/E2EApplicationPage";

test.beforeEach(async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => window.localStorage.clear());
});

test("HistoryInterface renders the four history categories", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R18 - HistoryInterface
  // @pre The user is on the History screen.
  await app.goto("/history");

  // @inv Exactly the supported history categories are available.
  await expect(page.getByTestId("history-segment-search")).toBeVisible();
  await expect(page.getByTestId("history-segment-visitedEntry")).toBeVisible();
  await expect(page.getByTestId("history-segment-imageClassification")).toBeVisible();
  await expect(page.getByTestId("history-segment-drawingClassification")).toBeVisible();

  // @post The active category renders a bounded scrollable list container.
  await expect(page.getByTestId("history-view")).toBeVisible();
});

test("HistoryInterface persists search and visited entries across screens", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R15 - HistoryInterface
  // Requirement: FUNCIONALES R41 - HistoryInterface
  // @pre The user performs actions that create history records.
  await app.goto("/search");
  await page.getByTestId("kanji-searchbar").locator("input").fill("日");
  await expect(app.visibleResults("search-results-panel").first()).toBeVisible();
  await app.visibleResults("search-results-panel").first().click();
  await expect(page.getByTestId("kanji-detail-screen")).toBeVisible();
  await app.goto("/history");

  // @inv History is loaded from persistent browser storage, not volatile screen state.
  await expect(page.getByTestId("history-entry-search-日")).toBeVisible();
  await page.getByTestId("history-segment-visitedEntry").click();
  await expect(page.getByTestId("history-entry-visitedEntry-日")).toBeVisible();

  // @post Stored records are visible immediately without restarting the application.
  await app.goto("/history");
  await page.getByTestId("history-segment-visitedEntry").click();
  await expect(page.getByTestId("history-entry-visitedEntry-日")).toBeVisible();
});

test("HistoryInterface opens a stored kanji without altering the history list", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R16 - HistoryInterface
  // Requirement: USABILIDAD R2 - HistoryProps
  // @pre At least one history entry exists in the selected category.
  await page.addInitScript(() => {
    window.localStorage.setItem("tfg-app.history", JSON.stringify([
      { character: "日", category: "visitedEntry", createdAt: "2026-05-04T10:00:00.000Z", summary: "ニチ" }
    ]));
  });
  await app.goto("/history");
  await page.getByTestId("history-segment-visitedEntry").click();
  const entries = page.getByTestId("history-view").locator("[data-testid^='history-entry-']");
  await expect(entries).toHaveCount(1);
  await entries.first().click();

  // @post The kanji detail screen is rendered.
  await expect(page.getByTestId("kanji-detail-screen")).toBeVisible();
  await expect(page.getByTestId("kanji-detail-header")).toContainText("日");

  // @inv Returning to history keeps the existing entries unchanged.
  await page.getByTestId("kanji-back-button").click();
  await expect(page.getByTestId("history-screen")).toBeVisible();
  await page.getByTestId("history-segment-visitedEntry").click();
  await expect(entries).toHaveCount(1);
});
