import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export interface E2EImageFile {
  readonly name: string;
  readonly mimeType: string;
  readonly buffer: Buffer;
}

export function createE2EImageFile(): E2EImageFile {
  const imagePath = join(process.cwd(), "tests/Support", "sample_image.jpeg");

  return {
    name: "sample_image.jpeg",
    mimeType: "image/jpeg",
    buffer: readFileSync(imagePath)
  };
}

export async function loadImageFromStorage(page: Page): Promise<void> {
  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.getByTestId("choose-image-button").waitFor({ state: "visible" });
  await page.getByTestId("choose-image-button").click();
  const chooser = await fileChooserPromise;
  await chooser.setFiles(createE2EImageFile());
  await expect(page.getByTestId("image-preview")).toBeVisible();
}

export interface CropArea {
  readonly startX: number;
  readonly startY: number;
  readonly endX: number;
  readonly endY: number;
}

export const DEFAULT_CROP_AREA: CropArea = {
  startX: 0.2,
  startY: 0.2,
  endX: 0.65,
  endY: 0.65
};

export async function performCrop(
  page: Page,
  area: CropArea = DEFAULT_CROP_AREA
): Promise<void> {
  const frame = page.getByTestId("image-crop-frame");
  const box = await frame.boundingBox();

  if (!box) {
    throw new Error("The image crop frame is not visible.");
  }

  await page.mouse.move(box.x + box.width * area.startX, box.y + box.height * area.startY);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * area.endX, box.y + box.height * area.endY, { steps: 6 });
  await page.mouse.up();
}