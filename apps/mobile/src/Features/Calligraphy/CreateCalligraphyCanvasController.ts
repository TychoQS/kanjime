import type { CalligraphyCanvasInterface } from "./Contracts/CalligraphyCanvasInterface";
import { createCalligraphyCanvasViewModel } from "./ViewModel/CalligraphyCanvasViewModel";

/**
 * Creates the calligraphy canvas controller.
 */
export function CreateCalligraphyCanvasController(): CalligraphyCanvasInterface {
  return createCalligraphyCanvasViewModel();
}
