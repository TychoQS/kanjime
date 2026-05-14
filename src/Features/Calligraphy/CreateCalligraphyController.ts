import type { CalligraphyInterface } from "./Contracts/CalligraphyInterface";
import { createCalligraphyViewModel } from "./ViewModel/CalligraphyViewModel";

/**
 * External collaborators consumed by the calligraphy controller.
 */
export interface CreateCalligraphyControllerDependencies {}

/**
 * Creates the calligraphy controller.
 */
export function CreateCalligraphyController(
  dependencies: CreateCalligraphyControllerDependencies
): CalligraphyInterface {
  return createCalligraphyViewModel(dependencies);
}
