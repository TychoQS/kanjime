import type { CropRegion, Stroke } from "../../../Shared/DomainTypes";
import type { InferenceInterface } from "./Contracts/InferenceInterface";
import { createInferenceViewModel } from "./ViewModel/InferenceViewModel";

/**
 * External collaborators consumed by the inference controller.
 */
export interface CreateInferenceControllerDependencies {
  readonly classifySource: (
    sourceId: string,
    inputUrl: string
  ) => Promise<ReadonlyArray<{ character: string; confidence: number; strokeCount: number }>>;
  readonly classifyDrawing?: (input: {
    strokes: ReadonlyArray<Stroke>;
    width: number;
    height: number;
  }) => Promise<ReadonlyArray<{ character: string; confidence: number; strokeCount: number }>>;
  readonly classifyImage?: (input: {
    sourceUri: string;
    crop?: CropRegion;
  }) => Promise<ReadonlyArray<{ character: string; confidence: number; strokeCount: number }>>;
  readonly getCurrentStrokes?: () => ReadonlyArray<Stroke>;
  readonly drawingWidth?: number;
  readonly drawingHeight?: number;
}

/**
 * Creates the inference controller.
 */
export function CreateInferenceController(
  dependencies: CreateInferenceControllerDependencies
): InferenceInterface {
  return createInferenceViewModel(dependencies);
}
