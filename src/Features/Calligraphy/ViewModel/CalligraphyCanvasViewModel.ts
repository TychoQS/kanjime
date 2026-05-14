import type { CreateCalligraphyCanvasControllerDependencies } from "../CreateCalligraphyCanvasController";
import type { CalligraphyCanvasInterface } from "../Contracts/CalligraphyCanvasInterface";
import type { Stroke } from "../../../Shared/DomainTypes";

const NOT_IMPLEMENTED_MESSAGE = "Not implemented yet";

/**
 * Creates the calligraphy canvas view model.
 */
export function createCalligraphyCanvasViewModel(
  _dependencies: CreateCalligraphyCanvasControllerDependencies
): CalligraphyCanvasInterface {
  return {
    registerStroke(_stroke: Stroke): void {
      throw new Error(NOT_IMPLEMENTED_MESSAGE);
    },
    resetAttempt(): void {
      throw new Error(NOT_IMPLEMENTED_MESSAGE);
    },
    getStrokeHistory(): ReadonlyArray<Stroke> {
      throw new Error(NOT_IMPLEMENTED_MESSAGE);
    }
  };
}
