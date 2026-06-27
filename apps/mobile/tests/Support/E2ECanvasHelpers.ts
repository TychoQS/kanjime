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

/**
 * Reads whether the page pixels occupied by the canvas expose a visible stroke.
 *
 * @pre The drawing canvas is visible in the current viewport.
 * @post Returns true when the composed page output shows foreground canvas content.
 */
export async function visiblePageCanvasHasStroke(page: Page, canvas: Locator): Promise<boolean> {
  const stage = canvas.locator("xpath=ancestor::*[contains(concat(' ', normalize-space(@class), ' '), ' drawing-canvas-stage ')][1]");
  const target = await stage.count() > 0 ? stage : canvas;
  const box = await target.boundingBox();
  const strokeColor = await canvas.getAttribute("data-stroke-color") ?? await target.getAttribute("data-stroke-color");

  if (!box || !strokeColor) {
    return false;
  }

  const screenshot = await page.screenshot({
    clip: {
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height
    }
  });

  return screenshotHasStrokePixels(page, screenshot, strokeColor);
}

async function screenshotHasStrokePixels(page: Page, screenshot: Buffer, strokeColor: string): Promise<boolean> {
  const encodedScreenshot = screenshot.toString("base64");

  return page.evaluate(async ({ base64Screenshot, expectedStrokeColor }) => {
    const colorProbe = document.createElement("canvas");
    colorProbe.width = 1;
    colorProbe.height = 1;
    const colorContext = colorProbe.getContext("2d");

    if (!colorContext) {
      return false;
    }

    colorContext.fillStyle = expectedStrokeColor;
    colorContext.fillRect(0, 0, 1, 1);
    const expectedColor = colorContext.getImageData(0, 0, 1, 1).data;
    const response = await fetch(`data:image/png;base64,${base64Screenshot}`);
    const blob = await response.blob();
    const bitmap = await createImageBitmap(blob);
    const capture = document.createElement("canvas");
    capture.width = bitmap.width;
    capture.height = bitmap.height;

    const context = capture.getContext("2d");

    if (!context || bitmap.width === 0 || bitmap.height === 0) {
      bitmap.close();
      return false;
    }

    context.drawImage(bitmap, 0, 0);
    bitmap.close();

    const imageData = context.getImageData(0, 0, capture.width, capture.height);
    let strokePixelCount = 0;

    for (let index = 0; index < imageData.data.length; index += 4) {
      const red = imageData.data[index];
      const green = imageData.data[index + 1];
      const blue = imageData.data[index + 2];
      const alpha = imageData.data[index + 3];
      const colorDistance = Math.abs(red - expectedColor[0])
        + Math.abs(green - expectedColor[1])
        + Math.abs(blue - expectedColor[2]);

      if (alpha > 200 && colorDistance < 45) {
        strokePixelCount += 1;
      }

      if (strokePixelCount > 40) {
        return true;
      }
    }

    return false;
  }, {
    base64Screenshot: encodedScreenshot,
    expectedStrokeColor: strokeColor
  });
}
