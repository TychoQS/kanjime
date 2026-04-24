import type { CanvasInterface } from "./Contracts/CanvasInterface";
import type { Stroke } from "../../../Shared/DomainTypes";
import { createCanvasViewModel } from "./ViewModel/CanvasViewModel";

/**
 * External collaborators consumed by the canvas controller.
 */
export interface CreateCanvasControllerDependencies {
  readonly requestDrawingInference: (
    stroke: Stroke
  ) => Promise<ReadonlyArray<{ character: string; strokeCount: number }>>;
}

/**
 * Creates the drawing canvas controller.
 */
export function CreateCanvasController(dependencies: CreateCanvasControllerDependencies): CanvasInterface {
  return createCanvasViewModel(dependencies);
}
