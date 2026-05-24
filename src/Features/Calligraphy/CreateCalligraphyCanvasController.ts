import type { CalligraphyCanvasInterface } from "./Contracts/CalligraphyCanvasInterface";
import { createCalligraphyCanvasViewModel } from "./ViewModel/CalligraphyCanvasViewModel";

/**
 * External collaborators consumed by the calligraphy canvas controller.
 */
export interface CreateCalligraphyCanvasControllerDependencies {}

/**
 * Creates the calligraphy canvas controller.
 */
export function CreateCalligraphyCanvasController(
  dependencies: CreateCalligraphyCanvasControllerDependencies
): CalligraphyCanvasInterface {
  return createCalligraphyCanvasViewModel(dependencies);
}
