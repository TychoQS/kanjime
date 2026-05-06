import { expect, test } from "@playwright/test";

import { drawSingleStroke, canvasHasVisibleStroke } from "../../Support/E2ECanvasHelpers";
import { E2EApplicationPage } from "../../Support/E2EApplicationPage";

test.beforeEach(async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => window.localStorage.clear());
});

test("ClassificationInterface starts in image mode and keeps modes mutually exclusive", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R28 - NavigationInterface
  // Requirement: FUNCIONALES R39 - ClassificationInterface
  // @pre The application starts after the model has loaded.
  await app.goto("/");

  // @inv The initial OCR state is image mode.
  await expect(page).toHaveURL(/\/classification$/);
  await expect(page.getByTestId("image-ocr-zone")).toBeVisible();
  await expect(page.getByTestId("drawing-ocr-zone")).toBeHidden();

  // @post Only the selected OCR mode remains active after switching.
  await page.getByTestId("ocr-drawing-segment").click();
  await expect(page.getByTestId("drawing-ocr-zone")).toBeVisible();
  await expect(page.getByTestId("image-ocr-zone")).toBeHidden();
  await page.getByTestId("ocr-image-segment").click();
  await expect(page.getByTestId("image-ocr-zone")).toBeVisible();
  await expect(page.getByTestId("drawing-ocr-zone")).toBeHidden();
});

test("CanvasInterface clears the drawing after a valid stroke and keeps empty clear as a no-op", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R3 - CanvasInterface
  // Requirement: FUNCIONALES R4 - CanvasInterface
  // Requirement: USABILIDAD R1 - CanvasInputProps
  // @pre The user is in drawing mode and the canvas can receive strokes.
  await app.goto("/classification");
  await page.getByTestId("ocr-drawing-segment").click();
  const canvas = page.getByTestId("drawing-canvas");
  const clearButton = page.getByTestId("clear-drawing-button");
  const initialBackground = await canvas.getAttribute("data-background");
  const initialStroke = await canvas.getAttribute("data-stroke-color");

  // @exception Clearing an empty canvas is disabled and does not alter visible state.
  await expect(clearButton).toHaveAttribute("aria-disabled", "true");
  await expect(canvas).toHaveAttribute("data-background", initialBackground ?? "");

  await drawSingleStroke(page, canvas);
  await expect(clearButton).toBeEnabled();
  await expect.poll(() => canvasHasVisibleStroke(canvas)).toBe(true);

  // @inv Canvas contrast colors remain stable while drawing.
  await expect(canvas).toHaveAttribute("data-background", initialBackground ?? "");
  await expect(canvas).toHaveAttribute("data-stroke-color", initialStroke ?? "");

  // @post Clearing removes the visible stroke and empties the suggestion list.
  await clearButton.click();
  await expect(clearButton).toHaveAttribute("aria-disabled", "true");
  await expect.poll(() => canvasHasVisibleStroke(canvas)).toBe(false);
  await expect(app.visibleResults("ocr-results-panel")).toHaveCount(0);
});

test("DisplayInferencesInterface shows a bounded result list after drawing inference", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R6 - CanvasInterface
  // Requirement: FUNCIONALES R10 - DisplayInferencesInterface
  // Requirement: RENDIMIENTO Y FIABILIDAD R2 - InferenceInterface
  // @pre A valid drawing stroke is completed on the OCR canvas.
  await app.goto("/classification");
  await page.getByTestId("ocr-drawing-segment").click();
  await drawSingleStroke(page, page.getByTestId("drawing-canvas"));

  // @inv The UI remains responsive while inference is in progress.
  await expect(page.getByTestId("menu-button")).toBeEnabled();

  // @post Suggestions appear without numeric confidence values and never exceed five items.
  const results = app.visibleResults("ocr-results-panel");
  await expect(results.first()).toBeVisible({ timeout: 30_000 });
  await expect.poll(() => results.count()).toBeGreaterThan(0);
  await expect.poll(() => results.count()).toBeLessThanOrEqual(5);
  await expect(results.first()).not.toContainText(/\d+\.\d+|%/);
});

test("ToggleClassificationModeInterface clears previous mode state without changing preferences", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R36 - ToggleClassificationModeInterface
  // Requirement: FUNCIONALES R27 - NavigationInterface
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
  await expect(app.visibleResults("ocr-results-panel")).toHaveCount(0);
});
