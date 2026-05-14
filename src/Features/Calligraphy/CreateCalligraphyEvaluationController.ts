import type { CalligraphyEvaluationInterface } from "./Contracts/CalligraphyEvaluationInterface";
import { createCalligraphyEvaluationViewModel } from "./ViewModel/CalligraphyEvaluationViewModel";

/**
 * External collaborators consumed by the calligraphy evaluation controller.
 */
export interface CreateCalligraphyEvaluationControllerDependencies {}

/**
 * Creates the calligraphy evaluation controller.
 */
export function CreateCalligraphyEvaluationController(
  dependencies: CreateCalligraphyEvaluationControllerDependencies
): CalligraphyEvaluationInterface {
  return createCalligraphyEvaluationViewModel(dependencies);
}
