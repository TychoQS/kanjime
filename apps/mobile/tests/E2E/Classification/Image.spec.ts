import { expect, test } from "@playwright/test";

import { loadImageFromStorage, performCrop } from "../../Support/ImageHelper";
import { E2EApplicationPage } from "../../Support/E2EApplicationPage";

test.beforeEach(async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => window.localStorage.clear());
});

test("[R19][E2E] ImageInterface clears the loaded image", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R19 - ImageInterface
  // @pre A valid image is loaded.
  await app.goto("/classification");
  await loadImageFromStorage(page);
  await expect(app.visibleResults("ocr-results-panel").first()).toBeVisible({
    timeout: 10_000,
  });

  await page.getByTestId("clear-image-button").click();

  // @post The image is removed from the interface.
  await page.evaluate(() => new Promise(requestAnimationFrame));
  await page.evaluate(() => new Promise(requestAnimationFrame));
  await expect(page.getByTestId("image-preview")).toBeHidden();

  // @inv Clearing does not create additional visible results.
  await expect(app.visibleResults("ocr-results-panel")).toHaveCount(0, { timeout: 10_000 });

});

test("[R20][E2E] ImageInterface uses crop selection as classification input", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R20 - ImageInterface
  // @pre A valid image is loaded and crop is within image bounds.
  await app.goto("/classification");
  await loadImageFromStorage(page);
  await expect(page.getByTestId("image-preview")).toBeVisible();

  await expect(app.visibleResults("ocr-results-panel").first()).toBeVisible({ timeout: 10_000 });
  await expect(page.getByTestId("ocr-spinner")).toBeHidden({ timeout: 10_000 });
  const resultsBefore = await app.visibleResults("ocr-results-panel").first().textContent();

  // @inv Only one crop is active and original image remains intact.
  await performCrop(page);
  await expect(page.getByTestId("crop-overlay-view")).toHaveCount(1);
  await expect(page.getByTestId("active-crop-box")).toBeVisible();
  await expect(page.getByTestId("image-preview")).toBeVisible();

  // @post The crop triggers a new classification and produces different results.
  await expect.poll(
    async () => {
      const current = await app.visibleResults("ocr-results-panel").first().textContent();
      return current !== resultsBefore;
    },
    { timeout: 30_000, intervals: [500, 1000, 2000] }
  ).toBe(true);
});

test("[R21][E2E] ImageInterface sets a selected image as OCR input", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R21 - ImageInterface
  // @pre The user is in image OCR mode.
  await app.goto("/classification");
  await expect(page.getByTestId("image-ocr-zone")).toBeVisible();

  // @inv The image input zone contains either a valid image or no image.
  await expect(page.getByTestId("image-preview")).toBeHidden();

  // @post Selecting an image stores it in visible OCR state.
  await loadImageFromStorage(page);
  await expect(page.getByTestId("image-preview")).toBeVisible();
  await expect(page.getByTestId("image-preview")).toHaveAttribute("src", /^blob:/);
});

test("[R30][E2E] PhotoInterface selects an image from storage", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R30 - PhotoInterface
  // @pre The storage image picker is available.
  await app.goto("/classification");
  await loadImageFromStorage(page);

  // @post The selected image is loaded correctly in the interface.
  await expect(page.getByTestId("image-preview")).toHaveAttribute("src", /^blob:/);
  await expect(page.getByTestId("image-preview")).toBeVisible();
});

test("[R13][E2E] ImageProps keeps the image visible during OCR processing", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: USABILIDAD R13 - ImageProps
  // @pre An image is loaded for classification.
  await app.goto("/classification");
  await loadImageFromStorage(page);

  // @inv The image preview remains visible while inference may be processing.
  await expect(page.getByTestId("image-preview")).toBeVisible();

  // @post The image remains visible after the inference finishes.
  await expect(page.getByTestId("ocr-spinner")).toBeHidden({ timeout: 5_000 });
  await expect(page.getByTestId("image-preview")).toBeVisible({ timeout: 5_000 });
});


test("[R14][E2E] CropProps renders one active crop overlay", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: USABILIDAD R14 - CropProps
  // @pre A valid image crop is defined by the user.
  await app.goto("/classification");
  await loadImageFromStorage(page);
  await performCrop(page);

  // @inv Only one crop overlay is active.
  await expect(page.getByTestId("crop-overlay-view")).toHaveCount(1);

  // @post The crop is represented visually over the image.
  await expect(page.getByTestId("active-crop-box")).toBeVisible();
});

test("[R16][E2E] ImageProps hides the image after it is cleared", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: USABILIDAD R16 - ImageProps
  // @pre A valid image is loaded.
  await app.goto("/classification");
  await loadImageFromStorage(page);
  await expect(page.getByTestId("image-preview")).toBeVisible();
  await expect(page.getByTestId("clear-image-button")).toBeVisible();

  // @post The image is no longer visible after clearing.
  await page.getByTestId("clear-image-button").click();
  await expect(page.getByTestId("image-preview")).toBeHidden();
  await expect(page.getByTestId("take-photo-button")).toBeVisible();
  await expect(page.getByTestId("choose-image-button")).toBeVisible();
});
