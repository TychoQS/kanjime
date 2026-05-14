import type { CreateCalligraphyEvaluationControllerDependencies } from "../CreateCalligraphyEvaluationController";
import type { CalligraphyEvaluationInterface } from "../Contracts/CalligraphyEvaluationInterface";
import type {
  CalligraphyAttempt,
  CalligraphyEvaluationFeedback,
  CalligraphyEvaluationResult
} from "../../../Shared/DomainTypes";

const NOT_IMPLEMENTED_MESSAGE = "Not implemented yet";

/**
 * Creates the calligraphy evaluation view model.
 */
export function createCalligraphyEvaluationViewModel(
  _dependencies: CreateCalligraphyEvaluationControllerDependencies
): CalligraphyEvaluationInterface {
  return {
    evaluateAttempt(_attempt: CalligraphyAttempt): Promise<CalligraphyEvaluationResult> {
      throw new Error(NOT_IMPLEMENTED_MESSAGE);
    },
    calculateScore(_result: CalligraphyEvaluationResult): number {
      throw new Error(NOT_IMPLEMENTED_MESSAGE);
    },
    createFeedback(_result: CalligraphyEvaluationResult): CalligraphyEvaluationFeedback {
      throw new Error(NOT_IMPLEMENTED_MESSAGE);
    }
  };
}
