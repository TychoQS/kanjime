import type { CalligraphyEvaluationInterface } from "./Contracts/CalligraphyEvaluationInterface";
import { createCalligraphyEvaluationViewModel } from "./ViewModel/CalligraphyEvaluationViewModel";
import type {
  CalligraphyAttempt,
  CalligraphyEvaluationFeedback,
  CalligraphyEvaluationResult
} from "@kanjime/shared";

/**
 * External collaborators consumed by the calligraphy evaluation controller.
 */
export interface CreateCalligraphyEvaluationControllerDependencies {
  readonly evaluateAttempt: (
      attempt: CalligraphyAttempt
  ) => Promise<CalligraphyEvaluationResult>;

  readonly createFeedback: (
      result: CalligraphyEvaluationResult
  ) => CalligraphyEvaluationFeedback;
}

/**
 * Creates the calligraphy evaluation controller.
 */
export function CreateCalligraphyEvaluationController(
  dependencies: CreateCalligraphyEvaluationControllerDependencies
): CalligraphyEvaluationInterface {
  return createCalligraphyEvaluationViewModel(dependencies);
}
