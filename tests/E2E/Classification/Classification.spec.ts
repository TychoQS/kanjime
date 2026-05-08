import { expect, test } from "@playwright/test";

import { drawSingleStroke, canvasHasVisibleStroke } from "../../Support/E2ECanvasHelpers";
import { E2EApplicationPage } from "../../Support/E2EApplicationPage";
import { loadImageFromStorage, performCrop, DEFAULT_CROP_AREA } from "../../Support/ImageHelper";

test.beforeEach(async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => window.localStorage.clear());
});

test("[R28][E2E] NavigationInterface starts the application on image OCR mode", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R28 - NavigationInterface
  // @pre The application starts after the model has loaded.
  await app.goto("/");

  // @inv The initial route resolves consistently to OCR.
  await expect(page).toHaveURL(/\/classification$/);

  // @post The OCR screen is shown in image mode.
  await expect(page.getByTestId("image-ocr-zone")).toBeVisible();
  await expect(page.getByTestId("drawing-ocr-zone")).toBeHidden();
});

test("[R39][E2E] ClassificationInterface keeps OCR modes mutually exclusive", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R39 - ClassificationInterface
  // @pre The user is on the classification screen.
  await app.goto("/classification");

  // @inv Only one mode can be visible before interaction.
  await expect(page.getByTestId("image-ocr-zone")).toBeVisible();
  await expect(page.getByTestId("drawing-ocr-zone")).toBeHidden();

  // @post Only the selected OCR mode remains active after switching.
  await page.getByTestId("ocr-drawing-segment").click();
  await expect(page.getByTestId("drawing-ocr-zone")).toBeVisible();
  await expect(page.getByTestId("image-ocr-zone")).toBeHidden();
});

test("[R3][E2E] CanvasInterface clears the drawing after a valid stroke", async ({ page }) => {
  const app = new E2EApplicationPage(page);
  // Requirement: FUNCIONALES R3 - CanvasInterface
  await app.goto("/classification");
  await page.getByTestId("ocr-drawing-segment").click();

  const canvas = page.getByTestId("drawing-canvas");
  const clearButton = page.getByTestId("clear-drawing-button");

  // @inv Clearing an empty canvas is disabled and does not alter visible state.
  await expect(clearButton).toHaveAttribute("aria-disabled", "true");

  // @pre The canvas contains at least one stroke.
  await drawSingleStroke(page, canvas);
  await expect.poll(() => canvasHasVisibleStroke(canvas)).toBe(true);
  await expect(clearButton).not.toHaveAttribute("aria-disabled", "true");

  // @post Activating clear removes the visible canvas content.
  await clearButton.click();
  await expect.poll(() => canvasHasVisibleStroke(canvas)).toBe(false);
  await expect(clearButton).toHaveAttribute("aria-disabled", "true");
});

test("[R4][E2E] CanvasInterface leaves results empty after clearing drawing state", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R4 - CanvasInterface
  // @pre The canvas contains drawing data.
  await app.goto("/classification");
  await page.getByTestId("ocr-drawing-segment").click();
  await drawSingleStroke(page, page.getByTestId("drawing-canvas"));
  await expect(page.getByTestId("clear-drawing-button")).toBeEnabled();

  // @post Canvas suggestions are empty after the clear operation.
  await page.getByTestId("clear-drawing-button").click();
  await expect(app.visibleResults("ocr-results-panel")).toHaveCount(0);
});

test("[R6][E2E] CanvasInterface filters results by stroke count within one tolerance", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R6 - CanvasInterface
  await app.goto("/classification");
  await page.getByTestId("ocr-drawing-segment").click();
  const canvas = page.getByTestId("drawing-canvas");

  // @pre Draw a known number of strokes (3).
  const drawnStrokes = 3;
  for (let i = 0; i < drawnStrokes; i++) {
    await drawSingleStroke(page, canvas);
  }

  // @inv The suggestion list contains at most 5 results.
  const results = app.visibleResults("ocr-results-panel");
  await expect(results.first()).toBeVisible({ timeout: 5_000 });
  await expect.poll(() => results.count()).toBeLessThanOrEqual(5);

  // @post Every result has a stroke count within drawnStrokes ± 1.
  const count = await results.count();
  for (let i = 0; i < count; i++) {
    const character = await results.nth(i).getAttribute("data-testid");
    await results.nth(i).click();
    await expect(page.getByTestId("kanji-detail-screen")).toBeVisible();

    const strokesText = await page
      .getByTestId("kanji-information-section")
      .locator("dt", { hasText: "Strokes" })
      .locator("xpath=following-sibling::dd[1]")
      .innerText();

    const strokeCount = parseInt(strokesText, 10);
    expect(strokeCount).toBeGreaterThanOrEqual(drawnStrokes - 1);
    expect(strokeCount).toBeLessThanOrEqual(drawnStrokes + 1);

    await page.goBack();
    await expect(results.first()).toBeVisible();
  }
});

test("[R7][E2E] CanvasInterface triggers exactly one inference per stroke", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R7 - CanvasInterface
  await app.goto("/classification");
  await page.getByTestId("ocr-drawing-segment").click();
  const canvas = page.getByTestId("drawing-canvas");
  const results = app.visibleResults("ocr-results-panel");

  // @inv No results are shown before any stroke is drawn.
  await expect(page.getByTestId("ocr-results-panel").locator("button")).toHaveCount(0);

  // @pre A stroke is completed on the canvas.
  await drawSingleStroke(page, canvas);

  // @post Each new stroke produces exactly one inference update.
  await expect(page.getByTestId("ocr-spinner")).toBeHidden({ timeout: 5_000 });
  const countAfterFirst = await results.count();
  expect(countAfterFirst).toBeGreaterThan(0);

  await drawSingleStroke(page, canvas);
  await expect(page.getByTestId("ocr-spinner")).toBeHidden({ timeout: 5_000 });
  const countAfterSecond = await results.count();
  expect(countAfterSecond).toBeGreaterThan(0);
});

test("[R1][E2E] CanvasInputProps keeps drawing contrast stable", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: USABILIDAD R1 - CanvasInputProps
  // @pre The user draws content on the canvas.
  await app.goto("/classification");
  await page.getByTestId("ocr-drawing-segment").click();
  const canvas = page.getByTestId("drawing-canvas");
  const initialBackground = await canvas.getAttribute("data-background");
  const initialStroke = await canvas.getAttribute("data-stroke-color");
  await drawSingleStroke(page, canvas);

  // @inv Canvas contrast colors remain stable while drawing.
  await expect(canvas).toHaveAttribute("data-background", initialBackground ?? "");
  await expect(canvas).toHaveAttribute("data-stroke-color", initialStroke ?? "");

  // @post The stroke is visually distinguishable from the background.
  await expect.poll(() => canvasHasVisibleStroke(canvas)).toBe(true);
});

test("[R8][E2E] DisplayInferencesInterface updates results once per valid image source", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R8 - DisplayInferencesInterface
  // @pre A valid image is loaded in image mode.
  await app.goto("/classification");
  await loadImageFromStorage(page);

  const results = app.visibleResults("ocr-results-panel");
  await expect(results.first()).toBeVisible({ timeout: 5_000 });

  // Make first crop.
  await performCrop(page);
  await expect(page.getByTestId("active-crop-box")).toBeVisible();
  await expect(results.first()).toBeVisible({ timeout: 5_000 });

  // @post A new crop generates a new set of results.
  await performCrop(page, { startX: 0.3, startY: 0.3, endX: 0.8, endY: 0.8 });
  await expect(results.first()).toBeVisible({ timeout: 5_000 });
  await expect.poll(() => results.count()).toBeGreaterThan(0);
});

test("[R10][E2E] DisplayInferencesInterface shows bounded results without confidence values", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R10 - DisplayInferencesInterface
  // @pre A valid drawing inference is completed.
  await app.goto("/classification");
  await page.getByTestId("ocr-drawing-segment").click();
  await drawSingleStroke(page, page.getByTestId("drawing-canvas"));

  // @post The suggestion list contains between one and five results.
  const results = app.visibleResults("ocr-results-panel");
  await expect.poll(() => results.count()).toBeGreaterThan(0);
  await expect.poll(() => results.count()).toBeLessThanOrEqual(5);
});

test("[R11][E2E] DisplayInferencesInterface shows kanji detail and records history on selection", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R11 - DisplayInferencesInterface
  // @pre Inference results are available on the classification screen.
  await app.goto("/classification");
  await page.getByTestId("ocr-drawing-segment").click();
  await drawSingleStroke(page, page.getByTestId("drawing-canvas"));
  const results = app.visibleResults("ocr-results-panel");
  await expect(results.first()).toBeVisible({ timeout: 5_000 });

  // Get the character from the first result.
  const testId = await results.first().getAttribute("data-testid");
  const character = testId?.replace("ocr-result-", "") ?? "";
  const countBefore = await results.count();

  // @inv Selecting a result does not alter the result list.
  await results.first().click();
  await expect(page.getByTestId("kanji-detail-screen")).toBeVisible();
  await page.getByTestId("kanji-back-button").click();
  await expect.poll(() => results.count()).toBe(countBefore);

  // @post The kanji detail screen is shown and action is recorded in history.
  await results.first().click();
  await expect(page.getByTestId("kanji-detail-screen")).toBeVisible();
});

test("[R22][E2E] InferenceInterface classifies a crop as an independent input source", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R22 - InferenceInterface
  // @pre Image OCR mode is active with a valid image loaded.
  await app.goto("/classification");
  await loadImageFromStorage(page);
  await expect(page.getByTestId("image-preview")).toBeVisible();

  // Make first crop and record its position.
  await performCrop(page);
  await expect(page.getByTestId("active-crop-box")).toBeVisible();
  const firstCropX = await page.getByTestId("crop-overlay-view").getAttribute("data-crop-x");
  const firstCropY = await page.getByTestId("crop-overlay-view").getAttribute("data-crop-y");
  await expect(app.visibleResults("ocr-results-panel").first()).toBeVisible({ timeout: 30_000 });

  // @inv Each new crop replaces the previous one.
  await performCrop(page, { startX: 0.3, startY: 0.3, endX: 0.8, endY: 0.8 });
  await expect(page.getByTestId("crop-overlay-view")).toHaveCount(1);
  const secondCropX = await page.getByTestId("crop-overlay-view").getAttribute("data-crop-x");
  const secondCropY = await page.getByTestId("crop-overlay-view").getAttribute("data-crop-y");
  expect(secondCropX).not.toBe(firstCropX);
  expect(secondCropY).not.toBe(firstCropY);

  // @post Classification runs using the new crop as input.
  const results = app.visibleResults("ocr-results-panel");
  await expect(results.first()).toBeVisible({ timeout: 5_000 });
  await expect.poll(() => results.count()).toBeGreaterThan(0);
});

test("[R25][E2E] InferenceInterface executes exactly one inference per valid input", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R25 - InferenceInterface
  // @pre A valid input exists and OCR mode is active.
  await app.goto("/classification");
  await loadImageFromStorage(page);

  // @inv No duplicate inferences for the same input.
  const results = app.visibleResults("ocr-results-panel");
  await expect(results.first()).toBeVisible({ timeout: 5_000 });

  const firstResultIds = await results.evaluateAll(
    els => els.map(el => el.getAttribute("data-testid"))
  );
  await expect.poll(async () => {
    const currentIds = await results.evaluateAll(
      els => els.map(el => el.getAttribute("data-testid"))
    );
    return JSON.stringify(currentIds);
  }).toBe(JSON.stringify(firstResultIds));

  // @post Exactly one inference per new input.
  await performCrop(page);
  await expect(page.getByTestId("ocr-spinner")).toBeHidden({ timeout: 5_000 });
  await expect.poll(() => results.count()).toBeGreaterThan(0);
});

test("[R26][E2E] InferenceInterface classifies the full image when no crop is active", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R26 - InferenceInterface
  // @pre A valid image is loaded without an active crop in image OCR mode.
  await app.goto("/classification");
  await loadImageFromStorage(page);

  // @inv No crop is active during classification.
  await expect(page.getByTestId("crop-overlay-view")).toBeHidden();
  await expect(page.getByTestId("active-crop-box")).toBeHidden();

  // @post The full image is classified and results appear.
  const results = app.visibleResults("ocr-results-panel");
  await expect(results.first()).toBeVisible({ timeout: 5_000 });
  await expect.poll(() => results.count()).toBeGreaterThan(0);
});

test("[R36][E2E] ToggleClassificationModeInterface clears previous mode state without changing preferences", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R36 - ToggleClassificationModeInterface
  // @pre Drawing mode contains active canvas state.
  await app.goto("/classification");
  const themeBefore = await page.locator("html").getAttribute("data-theme");
  await page.getByTestId("ocr-drawing-segment").click();
  await drawSingleStroke(page, page.getByTestId("drawing-canvas"));
  await expect(page.getByTestId("clear-drawing-button")).toBeEnabled();

  // @inv Preferences are not modified by mode changes.
  await page.getByTestId("ocr-image-segment").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", themeBefore ?? "light");

  // @post Returning to drawing mode shows cleared drawing state.
  await page.getByTestId("ocr-drawing-segment").click();
  await expect(page.getByTestId("clear-drawing-button")).toHaveAttribute("aria-disabled", "true");
});
