import type { CreateKanjiPracticeControllerDependencies } from "../CreateKanjiPracticeController";
import type { KanjiPracticeInterface } from "../Contracts/KanjiPracticeInterface";
import type { CalligraphyAttempt, CalligraphyEvaluationResult } from "../../../Shared/DomainTypes";
import { StrokeError } from "../../../Shared/AppErrors";

/**
 * Creates the kanji practice view model.
 */
export function createKanjiPracticeViewModel(
  dependencies: CreateKanjiPracticeControllerDependencies
): KanjiPracticeInterface {
  return {
    returnToCategory(): Promise<void> {
      return dependencies.navigateBackToCategory();
    },
    async requestEvaluation(attempt: CalligraphyAttempt): Promise<CalligraphyEvaluationResult> {
      if (attempt.strokes.length === 0) {
        throw new StrokeError("Draw at least one stroke before evaluating the practice.");
      }

      return dependencies.requestEvaluation({
        targetCharacter: attempt.targetCharacter,
        categoryId: attempt.categoryId,
        isFinalized: attempt.isFinalized,
        strokes: attempt.strokes.map(stroke => ({
          points: stroke.points.map(point => ({ ...point })),
          startedAt: stroke.startedAt,
          endedAt: stroke.endedAt
        }))
      });
    }
  };
}
