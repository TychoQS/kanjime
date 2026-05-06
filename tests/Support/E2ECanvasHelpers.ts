import type { Locator, Page } from "@playwright/test";

/**
 * Draws one deterministic stroke on the OCR canvas.
 *
 * @pre The drawing canvas is visible and enabled.
 * @post Pointer events are dispatched as a complete stroke.
 */
export async function drawSingleStroke(page: Page, canvas: Locator): Promise<void> {
  const box = await canvas.boundingBox();

  if (!box) {
    throw new Error("The drawing canvas is not visible.");
  }

  await page.mouse.move(box.x + box.width * 0.25, box.y + box.height * 0.25);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.72, box.y + box.height * 0.72, { steps: 8 });
  await page.mouse.up();
}

/**
 * Reads whether the canvas contains a pixel that differs from the background.
 *
 * @pre The drawing canvas has been rendered.
 * @post Returns true when at least one sampled pixel is not the background color.
 */
export async function canvasHasVisibleStroke(canvas: Locator): Promise<boolean> {
  return canvas.evaluate((element) => {
    const canvasElement = element as HTMLCanvasElement;
    const context = canvasElement.getContext("2d");

    if (!context) {
      return false;
    }

    const imageData = context.getImageData(0, 0, canvasElement.width, canvasElement.height);
    const first = [imageData.data[0], imageData.data[1], imageData.data[2]].join(",");

    for (let index = 0; index < imageData.data.length; index += 16) {
      const current = [imageData.data[index], imageData.data[index + 1], imageData.data[index + 2]].join(",");

      if (current !== first) {
        return true;
      }
    }

    return false;
  });
}
