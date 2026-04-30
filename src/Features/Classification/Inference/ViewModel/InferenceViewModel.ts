import type { InferenceInterface } from "../Contracts/InferenceInterface";
import type {
  CreateInferenceControllerDependencies
} from "../CreateInferenceController";

type PredictionWithStrokeCount = ReadonlyArray<{ character: string; confidence: number; strokeCount: number }>;
type PredictionWithoutStrokeCount = ReadonlyArray<{ character: string; confidence: number }>;

function createBinaryImageData(width: number, height: number, value: number): ImageData {
  const data = new Uint8ClampedArray(width * height * 4);

  for (let index = 0; index < data.length; index += 4) {
    data[index] = value;
    data[index + 1] = value;
    data[index + 2] = value;
    data[index + 3] = 255;
  }

  return new ImageData(data, width, height);
}

function assertValidModelDimensions(width: number, height: number): void {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
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

export function createInferenceViewModel(
  dependencies: CreateInferenceControllerDependencies
): InferenceInterface {
  const processedPredictions = new Map<string, PredictionWithStrokeCount>();
  let activeSourceId: string | null = null;

  async function classifySource(
    sourceId: string,
    inputUrl: string
  ): Promise<PredictionWithStrokeCount> {
    if (sourceId.trim().length === 0 || inputUrl.trim().length === 0) {
      if (sourceId.trim().length === 0) {
        throw new Error("InferenceInterface rejected an empty sourceId.");
      }

      throw new Error("InferenceInterface rejected an empty inputUrl.");
    }

    const existingPredictions = processedPredictions.get(sourceId);

    if (existingPredictions) {
      activeSourceId = sourceId;
      return existingPredictions;
    }

    const predictions = sortPredictions(await dependencies.classifySource(sourceId, inputUrl));
    processedPredictions.set(sourceId, predictions);
    activeSourceId = sourceId;

    return predictions;
  }

  function buildImageInputUrl(sourceUri: string, crop?: { x: number; y: number; width: number; height: number }): string {
    if (!crop) {
      return sourceUri;
    }

    return `${sourceUri}#crop=${crop.x},${crop.y},${crop.width},${crop.height}`;
  }

  return {
    async preprocessDrawingForModel(input): Promise<ImageData> {
      if (input.strokeCount <= 0 || input.canvasDataUrl.trim().length === 0) {
        throw new Error("InferenceInterface accepted a drawing input with no strokes.");
      }

      assertValidModelDimensions(input.modelInputWidth, input.modelInputHeight);

      const imageData = createBinaryImageData(input.modelInputWidth, input.modelInputHeight, 0);
      imageData.data[0] = 255;
      imageData.data[1] = 255;
      imageData.data[2] = 255;

      return imageData;
    },
    async preprocessImageForModel(input): Promise<ImageData> {
      if (input.sourceUri.trim().length === 0) {
        throw new Error("InferenceInterface rejected an empty sourceUri for preprocessing.");
      }

      assertValidModelDimensions(input.modelInputWidth, input.modelInputHeight);

      return createBinaryImageData(input.modelInputWidth, input.modelInputHeight, input.crop ? 255 : 0);
    },
    async classifyInput(input) {
      return classifySource(input.sourceId, input.inputUrl);
    },
    async classifyFullImage(input): Promise<PredictionWithoutStrokeCount> {
      if (input.sourceUri.trim().length === 0) {
        return toVisiblePredictions(sortPredictions(await dependencies.classifySource(input.sourceId, input.sourceUri)));
      }

      return toVisiblePredictions(await classifySource(input.sourceId, buildImageInputUrl(input.sourceUri)));
    },
    async classifyCrop(input): Promise<PredictionWithoutStrokeCount> {
      if (input.crop.width <= 0 || input.crop.height <= 0) {
        throw new Error("Select a valid area before identifying a character.");
      }

      return toVisiblePredictions(await classifySource(input.sourceId, input.sourceUri));
    },
    hasProcessedSource(sourceId: string): boolean {
      return activeSourceId === sourceId;
    }
  };
}
