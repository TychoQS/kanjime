import { expect, test } from "@playwright/test";

import { createE2EImageFile } from "../../Support/E2EImageFixtures";
import { E2EApplicationPage } from "../../Support/E2EApplicationPage";

test.beforeEach(async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => window.localStorage.clear());
});

test("ImageInterface loads an image from storage and clears it without new inference", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R21 - ImageInterface
  // Requirement: FUNCIONALES R30 - PhotoInterface
  // Requirement: USABILIDAD R13 - ImageProps
  // @pre The user is in image OCR mode and storage selection is available.
  await app.goto("/classification");
  await expect(page.getByTestId("image-ocr-zone")).toBeVisible();

  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.getByTestId("choose-image-button").click();
  const chooser = await fileChooserPromise;
  await chooser.setFiles(createE2EImageFile());

  // @inv The image remains visible while inference may be processing.
  await expect(page.getByTestId("image-preview")).toBeVisible();

  // @post Clearing the image removes the preview and visible results.
  await page.getByTestId("clear-image-button").click();
  await expect(page.getByTestId("image-preview")).toBeHidden();
  await expect(app.visibleResults("ocr-results-panel")).toHaveCount(0);
});

test("ImageInterface renders only one active crop overlay for the current image", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R20 - ImageInterface
  // Requirement: FUNCIONALES R22 - InferenceInterface
  // Requirement: USABILIDAD R14 - CropProps
  // @pre A valid image is loaded and the user selects a crop within image bounds.
  await app.goto("/classification");
  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.getByTestId("choose-image-button").click();
  const chooser = await fileChooserPromise;
  await chooser.setFiles(createE2EImageFile());
  await expect(page.getByTestId("image-preview")).toBeVisible();

  const frame = page.getByTestId("image-crop-frame");
  const box = await frame.boundingBox();

  if (!box) {
    throw new Error("The image crop frame is not visible.");
  }

  await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.65, box.y + box.height * 0.65, { steps: 6 });
  await page.mouse.up();

  // @inv Only one crop overlay is active and the original image remains visible.
  await expect(page.getByTestId("crop-overlay-view")).toHaveCount(1);
  await expect(page.getByTestId("image-preview")).toBeVisible();

  // @post The crop is represented visually over the image.
  await expect(page.getByTestId("active-crop-box")).toBeVisible();
});
