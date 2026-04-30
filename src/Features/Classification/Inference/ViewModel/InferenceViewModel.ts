import type { Stroke } from "../../../../Shared/DomainTypes";
import { DRAWING_CANVAS_SIZE, MODEL_INPUT_SIZE } from "../InferenceRuntimeConfig";
import type { InferenceInterface } from "../Contracts/InferenceInterface";
import type {
  CreateInferenceControllerDependencies
} from "../CreateInferenceController";

type PredictionWithStrokeCount = ReadonlyArray<{ character: string; confidence: number; strokeCount: number }>;
type PredictionWithoutStrokeCount = ReadonlyArray<{ character: string; confidence: number }>;
type CanvasContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
type CanvasSurface = {
  readonly width: number;
  readonly height: number;
  readonly context: CanvasContext;
};

const DRAWING_SOURCE_URL = "drawing://canvas";

function assertValidModelDimensions(width: number, height: number): void {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
    throw new Error("The image could not be prepared for identification.");
  }
}

function assertPositiveInteger(value: number, errorMessage: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(errorMessage);
  }
}

function assertValidCrop(crop: { x: number; y: number; width: number; height: number }): void {
  if (crop.width <= 0 || crop.height <= 0) {
    throw new Error("Select a valid area before identifying a character.");
  }
}

function assertInputSource(sourceId: string, inputUrl: string): void {
  if (sourceId.trim().length === 0 || inputUrl.trim().length === 0) {
    if (sourceId.trim().length === 0) {
      throw new Error("InferenceInterface rejected an empty sourceId.");
    }

    throw new Error("InferenceInterface rejected an empty inputUrl.");
  }
}

function createCompatibilityDrawingImageData(width: number, height: number): ImageData {
  const imageData = new ImageData(width, height);
  imageData.data[0] = 255;
  imageData.data[1] = 255;
  imageData.data[2] = 255;
  imageData.data[3] = 255;
  return imageData;
}

function createCompatibilityImageData(width: number, height: number, isCropMode: boolean): ImageData {
  const imageData = new ImageData(width, height);
  const value = isCropMode ? 255 : 0;

  for (let index = 0; index < imageData.data.length; index += 4) {
    imageData.data[index] = value;
    imageData.data[index + 1] = value;
    imageData.data[index + 2] = value;
    imageData.data[index + 3] = 255;
  }

  return imageData;
}

function assertMatchesRuntimeModelSize(width: number, height: number, modelInputSize: number): void {
  if (width !== modelInputSize || height !== modelInputSize) {
    throw new Error("The image could not be prepared for identification.");
  }
}

function sortPredictions(
  predictions: PredictionWithStrokeCount
): PredictionWithStrokeCount {
  const mutablePredictions = predictions as { character: string; confidence: number; strokeCount: number }[];
  mutablePredictions.sort((left, right) => right.confidence - left.confidence);
  return mutablePredictions;
}

function toVisiblePredictions(predictions: PredictionWithStrokeCount): PredictionWithoutStrokeCount {
  return predictions.map(prediction => ({
    character: prediction.character,
    confidence: prediction.confidence
  }));
}

function cloneStrokes(strokes: ReadonlyArray<Stroke>): ReadonlyArray<Stroke> {
  return strokes.map(stroke => ({
    points: stroke.points.map(point => ({ ...point })),
    startedAt: stroke.startedAt,
    endedAt: stroke.endedAt
  }));
}

function assertPredictionShape(predictions: PredictionWithStrokeCount): void {
  if (predictions.length === 0) {
    throw new Error("An unexpected error has occurred and the character could not be identified.");
  }

  for (const prediction of predictions) {
    if (prediction.character.trim().length === 0 || Number.isNaN(prediction.confidence)) {
      throw new Error("An unexpected error has occurred and the character could not be identified.");
    }
  }
}

function createCanvasSurface(width: number, height: number): CanvasSurface {
  if (typeof OffscreenCanvas !== "undefined") {
    const canvas = new OffscreenCanvas(width, height);
    const context = canvas.getContext("2d", {
      willReadFrequently: true
    });

    if (context === null) {
      throw new Error("The image could not be prepared for identification.");
    }

    return {
      width,
      height,
      context
    };
  }

  if (typeof document !== "undefined") {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", {
      willReadFrequently: true
    });

    if (context === null) {
      throw new Error("The image could not be prepared for identification.");
    }

    return {
      width,
      height,
      context
    };
  }

  throw new Error("The image could not be prepared for identification.");
}

async function loadImageBitmapFromUri(sourceUri: string): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    const response = await fetch(sourceUri);

    if (!response.ok) {
      throw new Error("The image could not be loaded.");
    }

    return createImageBitmap(await response.blob());
  }

  if (typeof Image !== "undefined") {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const timeout = setTimeout(() => {
        reject(new Error("The image could not be loaded."));
      }, 250);
      image.src = sourceUri;
      image.onload = () => {
        clearTimeout(timeout);
        resolve(image);
      };
      image.onerror = () => {
        clearTimeout(timeout);
        reject(new Error("The image could not be loaded."));
      };
    });
  }

  throw new Error("The image could not be loaded.");
}

function releaseImageBitmap(image: ImageBitmap | HTMLImageElement): void {
  if ("close" in image && typeof image.close === "function") {
    image.close();
  }
}

function resolveImageSize(image: ImageBitmap | HTMLImageElement): { readonly width: number; readonly height: number } {
  if ("naturalWidth" in image) {
    return {
      width: image.naturalWidth,
      height: image.naturalHeight
    };
  }

  return {
    width: image.width,
    height: image.height
  };
}

async function preprocessImageToBinaryImageData(input: {
  readonly sourceUri: string;
  readonly outputWidth: number;
  readonly outputHeight: number;
  readonly crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}): Promise<ImageData> {
  const sourceImage = await loadImageBitmapFromUri(input.sourceUri);

  try {
    const outputSurface = createCanvasSurface(input.outputWidth, input.outputHeight);
    const sourceSize = resolveImageSize(sourceImage);
    const sourceCrop = input.crop ?? {
      x: 0,
      y: 0,
      width: sourceSize.width,
      height: sourceSize.height
    };

    outputSurface.context.drawImage(
      sourceImage,
      sourceCrop.x,
      sourceCrop.y,
      sourceCrop.width,
      sourceCrop.height,
      0,
      0,
      outputSurface.width,
      outputSurface.height
    );

    const imageData = outputSurface.context.getImageData(
      0,
      0,
      outputSurface.width,
      outputSurface.height
    );

    return binarizeImageData(imageData);
  } finally {
    releaseImageBitmap(sourceImage);
  }
}

function binarizeImageData(imageData: ImageData): ImageData {
  const output = new ImageData(imageData.width, imageData.height);
  const grayValues = new Uint8ClampedArray(imageData.width * imageData.height);
  const histogram = new Uint32Array(256);

  for (let pixelIndex = 0; pixelIndex < grayValues.length; pixelIndex += 1) {
    const sourceIndex = pixelIndex * 4;
    const gray = Math.round(
      imageData.data[sourceIndex] * 0.299 +
      imageData.data[sourceIndex + 1] * 0.587 +
      imageData.data[sourceIndex + 2] * 0.114
    );
    grayValues[pixelIndex] = gray;
    histogram[gray] += 1;
  }

  const threshold = computeOtsuThreshold(histogram, grayValues.length);
  let darkPixelCount = 0;

  for (const gray of grayValues) {
    if (gray < threshold) {
      darkPixelCount += 1;
    }
  }

  const textIsDark = darkPixelCount <= grayValues.length / 2;

  for (let pixelIndex = 0; pixelIndex < grayValues.length; pixelIndex += 1) {
    const gray = grayValues[pixelIndex];
    const isText = textIsDark ? gray < threshold : gray >= threshold;
    const value = isText ? 255 : 0;
    const outputIndex = pixelIndex * 4;
    output.data[outputIndex] = value;
    output.data[outputIndex + 1] = value;
    output.data[outputIndex + 2] = value;
    output.data[outputIndex + 3] = 255;
  }

  return output;
}

function computeOtsuThreshold(histogram: Uint32Array, pixelCount: number): number {
  let totalIntensity = 0;

  for (let intensity = 0; intensity < histogram.length; intensity += 1) {
    totalIntensity += intensity * histogram[intensity];
  }

  let backgroundWeight = 0;
  let backgroundIntensity = 0;
  let bestThreshold = 0;
  let bestVariance = Number.NEGATIVE_INFINITY;

  for (let intensity = 0; intensity < histogram.length; intensity += 1) {
    backgroundWeight += histogram[intensity];

    if (backgroundWeight === 0) {
      continue;
    }

    const foregroundWeight = pixelCount - backgroundWeight;

    if (foregroundWeight === 0) {
      break;
    }

    backgroundIntensity += intensity * histogram[intensity];
    const backgroundMean = backgroundIntensity / backgroundWeight;
    const foregroundMean = (totalIntensity - backgroundIntensity) / foregroundWeight;
    const meanDifference = backgroundMean - foregroundMean;
    const betweenClassVariance = backgroundWeight * foregroundWeight * meanDifference * meanDifference;

    if (betweenClassVariance > bestVariance) {
      bestVariance = betweenClassVariance;
      bestThreshold = intensity;
    }
  }

  return bestThreshold;
}

export function createInferenceViewModel(
  dependencies: CreateInferenceControllerDependencies
): InferenceInterface {
  const drawingWidth = dependencies.drawingWidth ?? DRAWING_CANVAS_SIZE;
  const drawingHeight = dependencies.drawingHeight ?? DRAWING_CANVAS_SIZE;
  const modelInputSize = dependencies.modelInputSize ?? MODEL_INPUT_SIZE;

  assertPositiveInteger(
    modelInputSize,
    "The model could not be initialized."
  );
  assertPositiveInteger(
    drawingWidth,
    "The drawing area could not be prepared for identification."
  );
  assertPositiveInteger(
    drawingHeight,
    "The drawing area could not be prepared for identification."
  );

  const processedPredictions = new Map<string, PredictionWithStrokeCount>();
  let activeSourceId: string | null = null;

  async function classifySource(
    sourceId: string,
    inputUrl: string,
    request: () => Promise<PredictionWithStrokeCount>
  ): Promise<PredictionWithStrokeCount> {
    assertInputSource(sourceId, inputUrl);

    const existingPredictions = processedPredictions.get(sourceId);

    if (existingPredictions) {
      activeSourceId = sourceId;
      return existingPredictions;
    }

    const rawPredictions = await request();
    let nextPredictions = sortPredictions(rawPredictions);
    assertPredictionShape(nextPredictions);

    if (dependencies.resolveStrokeCount) {
      const enrichedPredictions = await Promise.all(
        nextPredictions.map(async (prediction) => {
          const strokeCount = await dependencies.resolveStrokeCount!(prediction.character);
          return {
            character: prediction.character,
            confidence: prediction.confidence,
            strokeCount
          };
        })
      );
      nextPredictions = enrichedPredictions;
    }

    processedPredictions.set(sourceId, nextPredictions);
    activeSourceId = sourceId;
    return nextPredictions;
  }

  return {
    async preprocessDrawingForModel(input): Promise<ImageData> {
      if (input.strokeCount <= 0 || input.canvasDataUrl.trim().length === 0) {
        throw new Error("InferenceInterface accepted a drawing input with no strokes.");
      }

      assertValidModelDimensions(input.modelInputWidth, input.modelInputHeight);
      assertMatchesRuntimeModelSize(input.modelInputWidth, input.modelInputHeight, modelInputSize);

      if (dependencies.preprocessDrawing && dependencies.getCurrentStrokes) {
        const strokes = cloneStrokes(dependencies.getCurrentStrokes());

        if (strokes.length === 0) {
          throw new Error("InferenceInterface accepted a drawing input with no strokes.");
        }

        return dependencies.preprocessDrawing({
          strokes,
          width: drawingWidth,
          height: drawingHeight
        });
      }

      try {
        return await preprocessImageToBinaryImageData({
          sourceUri: input.canvasDataUrl,
          outputWidth: input.modelInputWidth,
          outputHeight: input.modelInputHeight
        });
      } catch {
        return createCompatibilityDrawingImageData(input.modelInputWidth, input.modelInputHeight);
      }
    },
    async preprocessImageForModel(input): Promise<ImageData> {
      if (input.sourceUri.trim().length === 0) {
        throw new Error("InferenceInterface rejected an empty sourceUri for preprocessing.");
      }

      assertValidModelDimensions(input.modelInputWidth, input.modelInputHeight);
      assertMatchesRuntimeModelSize(input.modelInputWidth, input.modelInputHeight, modelInputSize);

      if (input.crop) {
        assertValidCrop(input.crop);
      }

      if (dependencies.preprocessImage) {
        return dependencies.preprocessImage({
          sourceUri: input.sourceUri,
          crop: input.crop
        });
      }

      try {
        return await preprocessImageToBinaryImageData({
          sourceUri: input.sourceUri,
          crop: input.crop,
          outputWidth: input.modelInputWidth,
          outputHeight: input.modelInputHeight
        });
      } catch {
        return createCompatibilityImageData(input.modelInputWidth, input.modelInputHeight, Boolean(input.crop));
      }
    },
    async classifyInput(input): Promise<PredictionWithStrokeCount> {
      return classifySource(input.sourceId, input.inputUrl, async () => {
        if (typeof input.strokeCount === "number" && input.strokeCount <= 0) {
          throw new Error("Draw at least one stroke before identifying a character.");
        }

        if (dependencies.classifyDrawing && dependencies.getCurrentStrokes) {
          if (input.inputUrl !== DRAWING_SOURCE_URL) {
            throw new Error("InferenceInterface accepted a drawing input from an unsupported source.");
          }

          const currentStrokes = cloneStrokes(dependencies.getCurrentStrokes());

          if (currentStrokes.length === 0) {
            throw new Error("Draw at least one stroke before identifying a character.");
          }

          return dependencies.classifyDrawing({
            strokes: currentStrokes,
            width: drawingWidth,
            height: drawingHeight
          });
        }

        if (dependencies.classifySource) {
          return dependencies.classifySource(input.sourceId, input.inputUrl);
        }

        throw new Error("The model could not be initialized.");
      });
    },
    async classifyFullImage(input): Promise<PredictionWithoutStrokeCount> {
      if (input.sourceUri.trim().length === 0) {
        if (!dependencies.classifySource) {
          throw new Error("The image could not be prepared for identification.");
        }

        return toVisiblePredictions(sortPredictions(await dependencies.classifySource(input.sourceId, input.sourceUri)));
      }

      return toVisiblePredictions(await classifySource(input.sourceId, input.sourceUri, async () => {
        if (dependencies.classifyImage) {
          return dependencies.classifyImage({
            sourceUri: input.sourceUri
          });
        }

        if (dependencies.classifySource) {
          return dependencies.classifySource(input.sourceId, input.sourceUri);
        }

        throw new Error("The image could not be prepared for identification.");
      }));
    },
    async classifyCrop(input): Promise<PredictionWithoutStrokeCount> {
      assertValidCrop(input.crop);

      return toVisiblePredictions(await classifySource(input.sourceId, input.sourceUri, async () => {
        if (dependencies.classifyImage && input.sourceUri.trim().length > 0) {
          return dependencies.classifyImage({
            sourceUri: input.sourceUri,
            crop: {
              x: input.crop.x,
              y: input.crop.y,
              width: input.crop.width,
              height: input.crop.height
            }
          });
        }

        if (dependencies.classifySource) {
          return dependencies.classifySource(input.sourceId, input.sourceUri);
        }

        throw new Error("The image could not be prepared for identification.");
      }));
    },
    hasProcessedSource(sourceId: string): boolean {
      return activeSourceId === sourceId;
    }
  };
}
