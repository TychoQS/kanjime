import type { InferenceInterface } from "./Contracts/InferenceInterface";

/**
 * External collaborators consumed by the inference controller.
 */
export interface CreateInferenceControllerDependencies {
  readonly classifySource: (
    sourceId: string,
    inputUrl: string
  ) => Promise<ReadonlyArray<{ character: string; confidence: number; strokeCount: number }>>;
}

function createPlaceholderImageData(): ImageData {
  return new ImageData(new Uint8ClampedArray([0, 0, 0, 255]), 1, 1);
}

/**
 * Creates the inference controller stub used by the RED test suite.
 */
export function CreateInferenceController(
  _dependencies: CreateInferenceControllerDependencies
): InferenceInterface {
  return {
    async preprocessDrawingForModel(): Promise<ImageData> {
      return createPlaceholderImageData();
    },
    async preprocessImageForModel(): Promise<ImageData> {
      return createPlaceholderImageData();
    },
    async classifyInput(): Promise<ReadonlyArray<{ character: string; confidence: number; strokeCount: number }>> {
      return [];
    },
    async classifyFullImage(): Promise<ReadonlyArray<{ character: string; confidence: number }>> {
      return [];
    },
    async classifyCrop(): Promise<ReadonlyArray<{ character: string; confidence: number }>> {
      return [];
    },
    hasProcessedSource(): boolean {
      return false;
    }
  };
}
