import type { CanvasInterface } from "./Contracts/CanvasInterface";
import type { Stroke } from "../../../Shared/DomainTypes";

/**
 * External collaborators consumed by the canvas controller.
 */
export interface CreateCanvasControllerDependencies {
  readonly requestDrawingInference: (
    stroke: Stroke
  ) => Promise<ReadonlyArray<{ character: string; strokeCount: number }>>;
}

/**
 * Creates the drawing canvas controller stub used by the RED test suite.
 */
export function CreateCanvasController(_dependencies: CreateCanvasControllerDependencies): CanvasInterface {
  return {
    async registerStroke(
      _stroke: Stroke
    ): Promise<ReadonlyArray<{ character: string; strokeCount: number }>> {
      return [];
    },
    clearCanvas(): void {},
    getStrokeHistory(): ReadonlyArray<Stroke> {
      return [];
    }
  };
}
