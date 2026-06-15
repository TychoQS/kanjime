import type { OpenCvHomographyRuntime, OpenCvMat, InkMask } from "./Types";

const RASTER_SIZE = 256;
const INK_LUMINANCE_THRESHOLD = 245;
const INK_NEIGHBOR_RADIUS = 3;
const VISUAL_SIZE = 109;

export function getRasterSize(): number {
  return RASTER_SIZE;
}

export function getVisualSize(): number {
  return VISUAL_SIZE;
}

export async function rasterizeSvgToImageData(svgDataUri: string): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const canvas = new OffscreenCanvas(RASTER_SIZE, RASTER_SIZE);
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Could not get 2D context for rasterization."));
        return;
      }

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, RASTER_SIZE, RASTER_SIZE);
      ctx.drawImage(img, 0, 0, RASTER_SIZE, RASTER_SIZE);
      resolve(ctx.getImageData(0, 0, RASTER_SIZE, RASTER_SIZE));
    };

    img.onerror = () => reject(new Error("Failed to load SVG for rasterization."));
    img.src = svgDataUri;
  });
}

export function imageDataToGrayMat(cv: OpenCvHomographyRuntime, imageData: ImageData): OpenCvMat {
  const rgbaMat = cv.matFromImageData(imageData);
  const grayMat = new cv.Mat();

  cv.cvtColor(rgbaMat, grayMat, cv.COLOR_RGBA2GRAY);
  rgbaMat.delete();

  return grayMat;
}

export function createInkMask(imageData: ImageData): InkMask {
  const pixels = new Uint8Array(imageData.width * imageData.height);

  for (let y = 0; y < imageData.height; y += 1) {
    for (let x = 0; x < imageData.width; x += 1) {
      const dataIndex = (y * imageData.width + x) * 4;
      const red = imageData.data[dataIndex];
      const green = imageData.data[dataIndex + 1];
      const blue = imageData.data[dataIndex + 2];
      const alpha = imageData.data[dataIndex + 3];

      const luminance = 0.299 * red + 0.587 * green + 0.114 * blue;
      const isInk = alpha > 0 && luminance < INK_LUMINANCE_THRESHOLD;

      pixels[y * imageData.width + x] = isInk ? 1 : 0;
    }
  }

  return {
    width: imageData.width,
    height: imageData.height,
    pixels
  };
}

export function isNearInk(mask: InkMask, x: number, y: number): boolean {
  const centerX = Math.round(x);
  const centerY = Math.round(y);

  const minX = Math.max(0, centerX - INK_NEIGHBOR_RADIUS);
  const maxX = Math.min(mask.width - 1, centerX + INK_NEIGHBOR_RADIUS);
  const minY = Math.max(0, centerY - INK_NEIGHBOR_RADIUS);
  const maxY = Math.min(mask.height - 1, centerY + INK_NEIGHBOR_RADIUS);

  for (let currentY = minY; currentY <= maxY; currentY += 1) {
    for (let currentX = minX; currentX <= maxX; currentX += 1) {
      if (mask.pixels[currentY * mask.width + currentX] === 1) {
        return true;
      }
    }
  }

  return false;
}

export function createOpenCvStrokeDataUri(
  strokes: ReadonlyArray<{ readonly points: ReadonlyArray<{ readonly x: number; readonly y: number }> }>
): string {
  const points = strokes.flatMap(stroke => stroke.points);
  const bounds = getBounds(points);
  const padding = 4;
  const minX = bounds.minX - padding;
  const minY = bounds.minY - padding;
  const width = Math.max(bounds.width + padding * 2, VISUAL_SIZE);
  const height = Math.max(bounds.height + padding * 2, VISUAL_SIZE);

  const paths = strokes
      .map(stroke => stroke.points.map(point => `${roundSvg(point.x)},${roundSvg(point.y)}`).join(" "))
      .filter(pointList => pointList.length > 0)
      .map(pointList => `<polyline points="${pointList}" fill="none" stroke="black" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`)
      .join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${roundSvg(minX)} ${roundSvg(minY)} ${roundSvg(width)} ${roundSvg(height)}" role="img"><rect x="${roundSvg(minX)}" y="${roundSvg(minY)}" width="${roundSvg(width)}" height="${roundSvg(height)}" fill="white"/>${paths}</svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function getBounds(points: ReadonlyArray<{ readonly x: number; readonly y: number }>): {
  readonly minX: number;
  readonly minY: number;
  readonly width: number;
  readonly height: number;
} {
  if (points.length === 0) {
    return { minX: 0, minY: 0, width: 1, height: 1 };
  }

  const xs = points.map(point => point.x);
  const ys = points.map(point => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return {
    minX,
    minY,
    width: maxX - minX,
    height: maxY - minY
  };
}

function roundSvg(value: number): string {
  return Number.isFinite(value) ? value.toFixed(2) : "0";
}
