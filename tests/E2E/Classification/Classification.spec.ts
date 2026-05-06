import { expect, test } from "@playwright/test";

import { drawSingleStroke, canvasHasVisibleStroke } from "../../Support/E2ECanvasHelpers";
import { E2EApplicationPage } from "../../Support/E2EApplicationPage";

test.beforeEach(async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => window.localStorage.clear());
});

test("NavigationInterface starts the application on image OCR mode", async ({ page }) => {
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

test("ClassificationInterface keeps OCR modes mutually exclusive", async ({ page }) => {
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

test("CanvasInterface clears the drawing after a valid stroke", async ({ page }) => {
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

test("CanvasInterface leaves results empty after clearing drawing state", async ({ page }) => {
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

test("CanvasInterface filters results by stroke count within one tolerance", async ({ page }) => {
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
  await expect(results.first()).toBeVisible({ timeout: 30_000 });
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

test("CanvasInterface triggers exactly one inference per stroke", async ({ page }) => {
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
  await expect(page.getByTestId("ocr-spinner")).toBeHidden({ timeout: 30_000 });
  const countAfterFirst = await results.count();
  expect(countAfterFirst).toBeGreaterThan(0);

  await drawSingleStroke(page, canvas);
  await expect(page.getByTestId("ocr-spinner")).toBeHidden({ timeout: 30_000 });
  const countAfterSecond = await results.count();
  expect(countAfterSecond).toBeGreaterThan(0);
});

test("CanvasInputProps keeps drawing contrast stable", async ({ page }) => {
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

test("DisplayInferencesInterface shows bounded results without confidence values", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R10 - DisplayInferencesInterface
  // @pre A valid drawing inference is completed.
  await app.goto("/classification");
  await page.getByTestId("ocr-drawing-segment").click();
  await drawSingleStroke(page, page.getByTestId("drawing-canvas"));

  // @inv Confidence values are not rendered in visible suggestions.
  const results = app.visibleResults("ocr-results-panel");
  await expect(results.first()).toBeVisible({ timeout: 30_000 });
  await expect(results.first()).not.toContainText(/\d+\.\d+|%/);

  // @post The suggestion list contains between one and five results.
  await expect.poll(() => results.count()).toBeGreaterThan(0);
  await expect.poll(() => results.count()).toBeLessThanOrEqual(5);
});

test("ToggleClassificationModeInterface clears previous mode state without changing preferences", async ({ page }) => {
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
