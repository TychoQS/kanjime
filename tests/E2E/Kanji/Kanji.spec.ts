import { expect, test } from "@playwright/test";

import { installE2ENativeMocks } from "../../Support/E2ECapacitorMocks";
import { E2EApplicationPage } from "../../Support/E2EApplicationPage";
import { TEST_KANJI_DAY } from "../../Support/TestData";
import { loadImageFromStorage, performCrop, DEFAULT_CROP_AREA } from "../../Support/ImageHelper";
import { drawSingleStroke, visiblePageCanvasHasStroke } from "../../Support/E2ECanvasHelpers";

test.beforeEach(async ({ page }) => {
  await installE2ENativeMocks(page);
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => window.localStorage.clear());
});

test("[R12][E2E] DisplayKanjiInterface renders available fields for the selected kanji", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R12 - DisplayKanjiInterface
  // @pre A valid kanji route is opened.
  await app.goto(`/kanji/${TEST_KANJI_DAY.character}`);

  // @inv Rendered fields belong to the selected kanji.
  await expect(page.getByTestId("kanji-detail-header")).toContainText(TEST_KANJI_DAY.character);

  // @post Available detail fields are visible with correct data from database.
  // Character
  await expect(page.locator("h1").first()).toHaveText(TEST_KANJI_DAY.character);

  // Meanings section - verify English content exists
  const meaningsSection = page.getByTestId("kanji-meanings-section");
  const englishMeanings = TEST_KANJI_DAY.meanings?.filter(m => m.language === "en").map(m => m.value) ?? [];
  for (const meaning of englishMeanings) {
    await expect(meaningsSection).toContainText(meaning);
  }

  // Readings section - onyomi and kunyomi
  const readingsSection = page.getByTestId("kanji-readings-section");
  await expect(readingsSection).toContainText(/Onyomi/);
  await expect(readingsSection).toContainText(/Kunyomi/);
  for (const reading of TEST_KANJI_DAY.onyomi ?? []) {
    await expect(readingsSection).toContainText(reading);
  }
  for (const reading of TEST_KANJI_DAY.kunyomi ?? []) {
    await expect(readingsSection).toContainText(reading);
  }

  // Information section - radical, stroke count, levels
  const infoSection = page.getByTestId("kanji-information-section");
  await expect(infoSection).toContainText(/Radical/);
  await expect(infoSection).toContainText(TEST_KANJI_DAY.radical ?? "");
  await expect(infoSection).toContainText(/Strokes/);
  await expect(infoSection).toContainText(String(TEST_KANJI_DAY.strokeCount));
  await expect(infoSection).toContainText(/JLPT/);
  await expect(infoSection).toContainText(TEST_KANJI_DAY.jlptLevel ?? "");
  await expect(infoSection).toContainText(/Joyo/);
  await expect(infoSection).toContainText(TEST_KANJI_DAY.joyoLevel ?? "");

  // Examples section - verify examples are present
  const examplesSection = page.getByTestId("kanji-examples-section");
  await expect(examplesSection).toBeVisible();
  await expect(examplesSection).toContainText(/Examples/);
  await expect(examplesSection).toContainText(/Onyomi/);
  await expect(examplesSection).toContainText(/Kunyomi/);
  for (const example of TEST_KANJI_DAY.onyomiExamples ?? []) {
    await expect(examplesSection).toContainText(example);
  }
  for (const example of TEST_KANJI_DAY.kunyomiExamples ?? []) {
    await expect(examplesSection).toContainText(example);
  }

  // Stroke order section - verify SVG with paths
  const strokeOrderSection = page.getByTestId("kanji-stroke-order-section");
  await expect(strokeOrderSection).toBeVisible();
  await expect(strokeOrderSection.locator("svg")).toBeVisible();
});

test("[R13][E2E] DisplayKanjiInterface copies the selected character", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R13 - DisplayKanjiInterface
  // @pre The user is on a valid kanji detail screen.
  await app.goto(`/kanji/${TEST_KANJI_DAY.character}`);
  await expect(page.getByTestId("kanji-copy-button")).toBeEnabled();

  // @post The selected character is available through the mocked clipboard.
  await page.getByTestId("kanji-copy-button").click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(TEST_KANJI_DAY.character);
});

test("[R14][E2E] DisplayKanjiInterface returns to the previous screen preserving state", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R14 - DisplayKanjiInterface
  // @pre A kanji detail was opened from search results.
  await app.goto("/search");
  await page.getByTestId("kanji-searchbar").locator("input").fill(TEST_KANJI_DAY.character);
  await expect(app.visibleResults("search-results-panel").first()).toBeVisible();
  await app.visibleResults("search-results-panel").first().click();
  await expect(page.getByTestId("kanji-detail-screen")).toBeVisible();

  // @post The visible back control returns to the previous screen.
  await page.getByTestId("kanji-back-button").click();
  await expect(page.getByTestId("search-screen")).toBeVisible();

  // @inv Previous search state remains unchanged.
  await expect(page.getByTestId("kanji-searchbar").locator("input")).toHaveValue(TEST_KANJI_DAY.character);
});

test("[R5][E2E] KanjiEntryProps copies the kanji character to clipboard", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: USABILIDAD R5 - KanjiEntryProps
  // @pre The kanji entry is visible.
  await installE2ENativeMocks(page);
  await app.goto(`/kanji/${TEST_KANJI_DAY.character}`);
  await expect(page.getByTestId("kanji-detail-screen")).toBeVisible();

  // @inv The application state remains intact after copying.
  await page.getByTestId("kanji-copy-button").click();
  await expect(page.getByTestId("kanji-detail-header")).toContainText(TEST_KANJI_DAY.character);
  await expect(page.getByTestId("kanji-detail-screen")).toBeVisible();

  // @post The kanji character is copied to the clipboard.
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(TEST_KANJI_DAY.character);
});

test("[R6][E2E] KanjiEntryProps returns to previous screen preserving state", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: USABILIDAD R6 - KanjiEntryProps

  // --- From search ---
  // @pre The kanji entry is visible from search.
  await app.goto("/search");
  await page.getByTestId("kanji-searchbar").locator("input").fill(TEST_KANJI_DAY.character);
  const searchResults = app.visibleResults("search-results-panel");
  await expect(searchResults.first()).toBeVisible();
  await searchResults.first().click();
  await expect(page.getByTestId("kanji-detail-screen")).toBeVisible();
  // @post Returns to the previous screen.
  await page.getByTestId("kanji-back-button").click();
  await expect(page.getByTestId("search-screen")).toBeVisible();
  // @inv Previous search state intact after returning.
  await expect(page.getByTestId("kanji-searchbar").locator("input")).toHaveValue(TEST_KANJI_DAY.character);
  await expect(searchResults.first()).toBeVisible();

  // --- From drawing classification ---
  // @pre The kanji entry is visible from drawing classification.
  await app.goto("/classification");
  await page.getByTestId("ocr-drawing-segment").click();
  await drawSingleStroke(page, page.getByTestId("drawing-canvas"));
  const drawingResults = app.visibleResults("ocr-results-panel");
  await expect(drawingResults.first()).toBeVisible({ timeout: 30_000 });
  const drawnCanvas = page.getByTestId("drawing-canvas");
  await expect.poll(() => visiblePageCanvasHasStroke(page, drawnCanvas)).toBe(true);
  await drawingResults.first().click();
  await expect(page.getByTestId("kanji-detail-screen")).toBeVisible();
  await drawnCanvas.evaluate(element => {
    const canvasElement = element as HTMLCanvasElement;
    const context = canvasElement.getContext("2d");

    if (context) {
      context.clearRect(0, 0, canvasElement.width, canvasElement.height);
    }
  });
  // @post Returns to the previous screen.
  await page.getByTestId("kanji-back-button").click();
  // @inv Previous drawing state intact after returning.
  const canvas = page.getByTestId("drawing-canvas");
  expect(await visiblePageCanvasHasStroke(page, canvas)).toBe(true);
  await expect(page.getByTestId("classification-screen")).toBeVisible();
  await expect(canvas).toBeVisible();
  await expect(page.getByTestId("clear-drawing-button")).not.toBeDisabled();
  expect(await visiblePageCanvasHasStroke(page, canvas)).toBe(true);
  await expect(drawingResults.first()).toBeVisible();

  // --- From image classification with crop ---
  // @pre The kanji entry is visible from image classification with crop.
  await app.goto("/classification");
  await loadImageFromStorage(page);
  await performCrop(page, DEFAULT_CROP_AREA);
  const imageResults = app.visibleResults("ocr-results-panel");
  await expect(imageResults.first()).toBeVisible({ timeout: 30_000 });
  await imageResults.first().click();
  await expect(page.getByTestId("kanji-detail-screen")).toBeVisible();
  // @post Returns to the previous screen.
  await page.getByTestId("kanji-back-button").click();
  await expect(page.getByTestId("classification-screen")).toBeVisible();
  // @inv Previous image state with crop intact after returning.
  await expect(page.getByTestId("image-preview")).toBeVisible();
  await expect(page.getByTestId("clear-image-button")).toBeVisible();
  await expect(page.getByTestId("image-crop-frame")).toBeVisible();
  await expect(imageResults.first()).toBeVisible();

  // --- From image classification without crop ---
  // @pre The kanji entry is visible from image classification without crop.
  await app.goto("/classification");
  await loadImageFromStorage(page);
  const imageResultsNoCrop = app.visibleResults("ocr-results-panel");
  await expect(imageResultsNoCrop.first()).toBeVisible({ timeout: 30_000 });
  await imageResultsNoCrop.first().click();
  await expect(page.getByTestId("kanji-detail-screen")).toBeVisible();
  // @post Returns to the previous screen.
  await page.getByTestId("kanji-back-button").click();
  await expect(page.getByTestId("classification-screen")).toBeVisible();
  // @inv Previous image state intact after returning.
  await expect(page.getByTestId("image-preview")).toBeVisible();
  await expect(page.getByTestId("clear-image-button")).toBeVisible();
  await expect(imageResultsNoCrop.first()).toBeVisible();
});
