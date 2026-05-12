import { expect, test } from "@playwright/test";

import { drawSingleStroke } from "../../Support/E2ECanvasHelpers";
import { loadImageFromStorage } from "../../Support/ImageHelper";
import { E2EApplicationPage } from "../../Support/E2EApplicationPage";
import { TEST_KANJI_DAY, TEST_KANJI_MOON, TEST_KANJI_FIRE } from "../../Support/TestData";

test.describe("With History Setup", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => window.localStorage.clear());

    const app = new E2EApplicationPage(page);

    await app.goto("/search");
    await page.getByTestId("kanji-searchbar").locator("input").fill(TEST_KANJI_DAY.character);
    await page.waitForSelector("[data-testid='search-results-panel']");
    await page.getByTestId("search-results-panel").locator(".result-row").first().click();
    await page.waitForSelector("[data-testid='kanji-detail-screen']");

    await app.goto("/search");
    await page.getByTestId("kanji-searchbar").locator("input").fill(TEST_KANJI_MOON);
    await page.waitForSelector("[data-testid='search-results-panel']");
    await page.getByTestId("search-results-panel").locator(".result-row").first().click();
    await page.waitForSelector("[data-testid='kanji-detail-screen']");

    await app.goto("/classification");
    await loadImageFromStorage(page);
    await page.waitForSelector("[data-testid='ocr-results-panel']");
    const imageResults = page.getByTestId("ocr-results-panel").locator(".result-row").first();
    await expect(imageResults).toBeVisible({ timeout: 30_000 });
    await imageResults.click();
    await page.waitForSelector("[data-testid='kanji-detail-screen']");

    await app.goto("/classification");
    await page.getByTestId("ocr-drawing-segment").click();
    await page.waitForSelector("[data-testid='drawing-canvas']");
    const canvas = page.getByTestId("drawing-canvas");
    await drawSingleStroke(page, canvas);
    await page.waitForSelector("[data-testid='ocr-results-panel']");
    const drawingResults = page.getByTestId("ocr-results-panel").locator(".result-row").first();
    await expect(drawingResults).toBeVisible({ timeout: 30_000 });
    await drawingResults.click();
    await page.waitForSelector("[data-testid='kanji-detail-screen']");
  });

  test("[R18][E2E] HistoryInterface renders the four history categories", async ({ page }) => {
    const app = new E2EApplicationPage(page);

    // Requirement: FUNCIONALES R18 - HistoryInterface
    // @pre The user is on the History screen.
    await app.goto("/history");

    // @inv Exactly the supported history categories are available.
    await expect(page.getByTestId("history-segment-search")).toBeVisible();
    await expect(page.getByTestId("history-segment-visitedEntry")).toBeVisible();
    await expect(page.getByTestId("history-segment-imageClassification")).toBeVisible();
    await expect(page.getByTestId("history-segment-drawingClassification")).toBeVisible();

    // @post Entries are grouped by their correct category.
    await page.getByTestId("history-segment-search").click();
    await expect(page.getByTestId(`history-entry-search-${TEST_KANJI_DAY.character}`)).toBeVisible();
    await expect(page.getByTestId(`history-entry-search-${TEST_KANJI_MOON}`)).toBeVisible();

    await page.getByTestId("history-segment-visitedEntry").click();
    await expect(page.getByTestId(`history-entry-visitedEntry-${TEST_KANJI_DAY.character}`)).toBeVisible();

    await page.getByTestId("history-segment-imageClassification").click();
    const imageEntries = page.getByTestId("history-view").locator("[data-testid^='history-entry-imageClassification-']");
    await expect(imageEntries).toHaveCount(1);

    await page.getByTestId("history-segment-drawingClassification").click();
    const drawingEntries = page.getByTestId("history-view").locator("[data-testid^='history-entry-drawingClassification-']");
    await expect(drawingEntries).toHaveCount(1);
  });

  test("[R15][E2E] HistoryInterface displays persistent history records across screens", async ({ page }) => {
    const app = new E2EApplicationPage(page);

    // Requirement: FUNCIONALES R15 - HistoryInterface
    // @pre The user is on the History screen.
    await app.goto("/history");

    // @post Stored records are visible grouped by category.
    await page.getByTestId("history-segment-search").click();
    await expect(page.getByTestId(`history-entry-search-${TEST_KANJI_DAY.character}`)).toBeVisible();

    await page.getByTestId("history-segment-visitedEntry").click();
    await expect(page.getByTestId(`history-entry-visitedEntry-${TEST_KANJI_DAY.character}`)).toBeVisible();

    await page.getByTestId("history-segment-imageClassification").click();
    await expect(page.getByTestId("history-view").locator("[data-testid^='history-entry-imageClassification-']")).toHaveCount(1);

    await page.getByTestId("history-segment-drawingClassification").click();
    await expect(page.getByTestId("history-view").locator("[data-testid^='history-entry-drawingClassification-']")).toHaveCount(1);

    // @inv History data persists after leaving and reopening the History screen.
    await app.goto("/search");
    await app.goto("/history");

    await page.getByTestId("history-segment-search").click();
    await expect(page.getByTestId(`history-entry-search-${TEST_KANJI_DAY.character}`)).toBeVisible();

    await page.getByTestId("history-segment-visitedEntry").click();
    await expect(page.getByTestId(`history-entry-visitedEntry-${TEST_KANJI_DAY.character}`)).toBeVisible();

    await page.getByTestId("history-segment-imageClassification").click();
    await expect(page.getByTestId("history-view").locator("[data-testid^='history-entry-imageClassification-']")).toHaveCount(1);

    await page.getByTestId("history-segment-drawingClassification").click();
    await expect(page.getByTestId("history-view").locator("[data-testid^='history-entry-drawingClassification-']")).toHaveCount(1);
  });

  test("[R16][E2E] HistoryInterface opens a stored kanji without altering the history list", async ({ page }) => {
    const app = new E2EApplicationPage(page);

    // Requirement: FUNCIONALES R16 - HistoryInterface
    // @pre At least one history entry exists in the selected category.
    await app.goto("/history");
    await page.getByTestId("history-segment-search").click();
    const searchEntry = page.getByTestId(`history-entry-search-${TEST_KANJI_DAY.character}`);
    await expect(searchEntry).toBeVisible();
    await searchEntry.click();

    // @post The kanji detail screen is rendered.
    await expect(page.getByTestId("kanji-detail-screen")).toBeVisible();
    await expect(page.getByTestId("kanji-detail-header")).toContainText(TEST_KANJI_DAY.character);

    // @inv Returning to history keeps the existing entries unchanged.
    await page.getByTestId("kanji-back-button").click();
    await expect(page.getByTestId("history-screen")).toBeVisible();
    await page.getByTestId("history-segment-search").click();
    await expect(page.getByTestId("history-view").locator("[data-testid^='history-entry-search-']")).not.toHaveCount(0);
  });

  test("[R2][E2E] HistoryProps entries are interactive and open the complete kanji entry", async ({ page }) => {
    const app = new E2EApplicationPage(page);

    // Requirement: FUNCIONALES R2 - HistoryProps
    // @pre The History component is rendered with at least one entry.
    await app.goto("/history");
    await page.getByTestId("history-segment-search").click();
    const historyEntries = page.getByTestId("history-view").locator("[data-testid^='history-entry-search-']");
    await expect(historyEntries).toHaveCount(2);
    const entriesBeforeSelection = await historyEntries.evaluateAll(nodes =>
      nodes.map(node => ({
        testId: node.getAttribute("data-testid"),
        text: node.textContent
      }))
    );

    await page.getByTestId(`history-entry-search-${TEST_KANJI_MOON}`).click();

    // @post The complete corresponding kanji entry is rendered.
    await expect(page.getByTestId("kanji-detail-screen")).toBeVisible();
    await expect(page.getByTestId("kanji-detail-header")).toContainText(TEST_KANJI_MOON);
    await expect(page.getByTestId("kanji-meanings-section")).toBeVisible();
    await expect(page.getByTestId("kanji-readings-section")).toBeVisible();
    await expect(page.getByTestId("kanji-information-section")).toBeVisible();
    await expect(page.getByTestId("kanji-stroke-order-section")).toBeVisible();

    // @inv Selecting one entry does not alter the rest of the entries.
    await page.getByTestId("kanji-back-button").click();
    await expect(page.getByTestId("history-screen")).toBeVisible();
    await page.getByTestId("history-segment-search").click();
    const entriesAfterSelection = await page.getByTestId("history-view")
      .locator("[data-testid^='history-entry-search-']")
      .evaluateAll(nodes =>
        nodes.map(node => ({
          testId: node.getAttribute("data-testid"),
          text: node.textContent
        }))
      );

    expect(entriesAfterSelection).toEqual(entriesBeforeSelection);
  });

  test("[R3][E2E] HistoryProps renders entries from newest to oldest without reordering", async ({ page }) => {
    const app = new E2EApplicationPage(page);

    // Requirement: FUNCIONALES R3 - HistoryProps
    // @pre Multiple entries exist in the selected history category.
    await app.goto("/history");
    await page.getByTestId("history-segment-search").click();
    const searchEntryCharacters = page.getByTestId("history-view")
      .locator("[data-testid^='history-entry-search-'] .result-kanji");
    await expect(searchEntryCharacters).toHaveCount(2);

    // @post Entries are shown in descending date order.
    await expect(searchEntryCharacters).toHaveText([
      TEST_KANJI_MOON,
      TEST_KANJI_DAY.character
    ]);

    // @inv The temporal order remains unchanged when no new records are inserted.
    const orderBeforeReload = await searchEntryCharacters.allTextContents();
    await app.goto("/history");
    await page.getByTestId("history-segment-search").click();
    const orderAfterReload = await page.getByTestId("history-view")
      .locator("[data-testid^='history-entry-search-'] .result-kanji")
      .allTextContents();

    expect(orderAfterReload).toEqual(orderBeforeReload);
  });
});

test("[R41][E2E] HistoryInterface updates immediately after a new history entry is created", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R41 - HistoryInterface
  // @pre The user performs actions that generate new history records.
  await app.goto("/search");
  await page.getByTestId("kanji-searchbar").locator("input").fill(TEST_KANJI_FIRE);

  const searchResults = page.getByTestId("search-results-panel").locator(".result-row");
  await expect(searchResults.first()).toBeVisible();
  await searchResults.first().click();
  await expect(page.getByTestId("kanji-detail-screen")).toBeVisible();

  await app.goto("/classification");
  await expect(page.getByTestId("image-ocr-zone")).toBeVisible();
  await loadImageFromStorage(page);

  const imageResults = page.getByTestId("ocr-results-panel").locator(".result-row");
  await expect(imageResults.first()).toBeVisible({ timeout: 10_000 });
  await imageResults.first().click();
  await expect(page.getByTestId("kanji-detail-screen")).toBeVisible();

  await app.goto("/classification");
  await page.getByTestId("ocr-drawing-segment").click();
  await expect(page.getByTestId("ocr-drawing-segment")).toHaveAttribute(
    "aria-selected",
    "true"
  );

  const canvas = page.getByTestId("drawing-canvas");
  await expect(canvas).toBeVisible();

  await drawSingleStroke(page, canvas);

  const drawingResults = page.getByTestId("ocr-results-panel").locator(".result-row");
  await expect(drawingResults.first()).toBeVisible({ timeout: 10_000 });
  await drawingResults.first().click();
  await expect(page.getByTestId("kanji-detail-screen")).toBeVisible();

  // @inv The application is not restarted before checking History.
  await app.goto("/history");
  await expect(page.getByTestId("history-screen")).toBeVisible();

  // @post The new records appear immediately in the History screen.
  // R41 creates: 1 search, 1 visitedEntry, 1 imageClassification, 1 drawingClassification
  await page.getByTestId("history-segment-search").click();
  await expect(page.getByTestId("history-segment-search")).toHaveAttribute(
    "aria-selected",
    "true"
  );
  await expect(
    page.getByTestId("history-view").locator("[data-testid^='history-entry-search-']")
  ).toHaveCount(1);

  await page.getByTestId("history-segment-visitedEntry").click();
  await expect(page.getByTestId("history-segment-visitedEntry")).toHaveAttribute(
    "aria-selected",
    "true"
  );
  await expect(
    page.getByTestId("history-view").locator("[data-testid^='history-entry-visitedEntry-']")
  ).toHaveCount(1);

  await page.getByTestId("history-segment-imageClassification").click();
  await expect(page.getByTestId("history-segment-imageClassification")).toHaveAttribute(
    "aria-selected",
    "true"
  );
  await expect(
    page.getByTestId("history-view").locator("[data-testid^='history-entry-imageClassification-']")
  ).toHaveCount(1);

  await page.getByTestId("history-segment-drawingClassification").click();
  await expect(page.getByTestId("history-segment-drawingClassification")).toHaveAttribute(
    "aria-selected",
    "true"
  );
  await expect(
    page.getByTestId("history-view").locator("[data-testid^='history-entry-drawingClassification-']")
  ).toHaveCount(1);
});
