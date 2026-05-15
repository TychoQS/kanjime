import type { KanjiPracticeInterface } from "./Contracts/KanjiPracticeInterface";
import { createKanjiPracticeViewModel } from "./ViewModel/KanjiPracticeViewModel";
import {CalligraphyAttempt, CalligraphyEvaluationResult} from "../../Shared/DomainTypes";

/**
 * External collaborators consumed by the kanji practice controller.
 */
export interface CreateKanjiPracticeControllerDependencies {
  readonly navigateBackToCategory: () => Promise<void>;

  readonly requestEvaluation: (
      attempt: CalligraphyAttempt
  ) => Promise<CalligraphyEvaluationResult>;
}

/**
 * Creates the kanji practice controller.
 */
export function CreateKanjiPracticeController(
  dependencies: CreateKanjiPracticeControllerDependencies
): KanjiPracticeInterface {
  return createKanjiPracticeViewModel(dependencies);
}
