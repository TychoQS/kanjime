import { expect, test, type Page } from "@playwright/test";

import { createE2EImageFile } from "../../Support/E2EImageFixtures";
import { E2EApplicationPage } from "../../Support/E2EApplicationPage";

test.beforeEach(async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => window.localStorage.clear());
});

async function loadImageFromStorage(page: Page): Promise<void> {
  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.getByTestId("choose-image-button").click();
  const chooser = await fileChooserPromise;
  await chooser.setFiles(createE2EImageFile());
  await expect(page.getByTestId("image-preview")).toBeVisible();
}

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
});

test("[R30][E2E] PhotoInterface selects an image from storage", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R30 - PhotoInterface
  // @pre The storage image picker is available.
  await app.goto("/classification");

  // @inv The selected image is not altered before entering OCR state.
  await loadImageFromStorage(page);

  // @post The selected image is loaded correctly in the interface.
  await expect(page.getByTestId("image-preview")).toHaveAttribute("src", /^blob:/);
});

test("[R13][E2E] ImageProps keeps the image visible during OCR processing", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: USABILIDAD R13 - ImageProps
  // @pre An image is loaded for classification.
  await app.goto("/classification");
  await loadImageFromStorage(page);

  // @inv The image preview remains visible while inference may be processing.
  await expect(page.getByTestId("image-preview")).toBeVisible();

  // @post The image remains visible after the processing feedback settles.
  await expect(page.getByTestId("image-preview")).toBeVisible({ timeout: 30_000 });
});

test("[R19][E2E] ImageInterface clears the loaded image", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R19 - ImageInterface
  // @pre A valid image is loaded.
  await app.goto("/classification");
  await loadImageFromStorage(page);

  // @inv Clearing does not create additional visible results.
  await page.getByTestId("clear-image-button").click();
  await expect(app.visibleResults("ocr-results-panel")).toHaveCount(0);

  // @post The image is removed from the interface.
  await expect(page.getByTestId("image-preview")).toBeHidden();
});

test("[R14][E2E] CropProps renders one active crop overlay", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: USABILIDAD R14 - CropProps
  // @pre A valid image crop is defined by the user.
  await app.goto("/classification");
  await loadImageFromStorage(page);
  const frame = page.getByTestId("image-crop-frame");
  const box = await frame.boundingBox();

  if (!box) {
    throw new Error("The image crop frame is not visible.");
  }

  await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.65, box.y + box.height * 0.65, { steps: 6 });
  await page.mouse.up();

  // @inv Only one crop overlay is active.
  await expect(page.getByTestId("crop-overlay-view")).toHaveCount(1);

  // @post The crop is represented visually over the image.
  await expect(page.getByTestId("active-crop-box")).toBeVisible();
});
