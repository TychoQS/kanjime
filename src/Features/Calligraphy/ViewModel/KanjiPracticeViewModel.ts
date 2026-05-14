import type { CreateKanjiPracticeControllerDependencies } from "../CreateKanjiPracticeController";
import type { KanjiPracticeInterface } from "../Contracts/KanjiPracticeInterface";
import type { CalligraphyAttempt, CalligraphyEvaluationResult } from "../../../Shared/DomainTypes";

const NOT_IMPLEMENTED_MESSAGE = "Not implemented yet";

/**
 * Creates the kanji practice view model.
 */
export function createKanjiPracticeViewModel(
  _dependencies: CreateKanjiPracticeControllerDependencies
): KanjiPracticeInterface {
  return {
    returnToCategory(): Promise<void> {
      throw new Error(NOT_IMPLEMENTED_MESSAGE);
    },
    requestEvaluation(_attempt: CalligraphyAttempt): Promise<CalligraphyEvaluationResult> {
      throw new Error(NOT_IMPLEMENTED_MESSAGE);
    }
  };
}
