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
}

/**
 * Creates the inference controller.
 */
export function CreateInferenceController(
  dependencies: CreateInferenceControllerDependencies
): InferenceInterface {
  return createInferenceViewModel(dependencies);
}
