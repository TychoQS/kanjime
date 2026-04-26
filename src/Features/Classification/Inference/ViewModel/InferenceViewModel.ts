import type { InferenceInterface } from "../Contracts/InferenceInterface";
import type {
  CreateInferenceControllerDependencies
} from "../CreateInferenceController";
import type { CropRegion, InferencePrediction } from "../../../../Shared/DomainTypes";

type PredictionWithoutStrokeCount = ReadonlyArray<{ character: string; confidence: number }>;

/**
 * Creates a model-sized image buffer initialized with a single binary color.
 *
 * @pre width and height are positive integers.
 * @post The returned image has exactly width by height pixels.
 */
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

/**
 * Validates positive model input dimensions.
 *
 * @pre width and height are supplied by the loaded model configuration.
 * @post The operation completes only when both dimensions can produce an image buffer.
 */
function assertValidModelDimensions(width: number, height: number): void {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
    throw new Error("The image could not be prepared for identification.");
  }
}

/**
 * Creates the inference view model.
 *
 * @pre The classifier dependency executes the loaded OCR model for a source.
 * @inv A source identifier is classified at most once in the current flow.
 * @post The returned controller performs preprocessing and classification through dependencies.
 */
export function createInferenceViewModel(
  dependencies: CreateInferenceControllerDependencies
): InferenceInterface {
  const processedPredictions = new Map<string, ReadonlyArray<InferencePrediction>>();
  let activeSourceId: string | null = null;

  async function classifySource(
    sourceId: string,
    inputUrl: string
  ): Promise<ReadonlyArray<InferencePrediction>> {
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

    const predictions = await dependencies.classifySource(sourceId, inputUrl);
    const snapshot = [...predictions]
      .sort((left, right) => right.confidence - left.confidence)
      .map(prediction => ({ ...prediction }));
    processedPredictions.set(sourceId, snapshot);
    activeSourceId = sourceId;

    return snapshot;
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
    async classifyInput(input): Promise<ReadonlyArray<InferencePrediction>> {
      return classifySource(input.sourceId, input.inputUrl);
    },
    async classifyFullImage(input): Promise<PredictionWithoutStrokeCount> {
      if (input.sourceUri.trim().length === 0) {
        throw new Error("Select an image before identifying a character.");
      }

      const predictions = await classifySource(input.sourceId, input.sourceUri);

      return predictions.map(prediction => ({
        character: prediction.character,
        confidence: prediction.confidence
      }));
    },
    async classifyCrop(input): Promise<PredictionWithoutStrokeCount> {
      const crop: CropRegion = input.crop;

      if (crop.width <= 0 || crop.height <= 0) {
        throw new Error("Select a valid area before identifying a character.");
      }

      const predictions = await classifySource(input.sourceId, input.sourceUri);

      return predictions.map(prediction => ({
        character: prediction.character,
        confidence: prediction.confidence
      }));
    },
    hasProcessedSource(sourceId: string): boolean {
      return activeSourceId === sourceId;
    }
  };
}
