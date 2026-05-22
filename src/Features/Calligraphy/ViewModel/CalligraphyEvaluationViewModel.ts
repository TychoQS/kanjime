import type { CreateCalligraphyEvaluationControllerDependencies } from "../CreateCalligraphyEvaluationController";
import type { CalligraphyEvaluationInterface } from "../Contracts/CalligraphyEvaluationInterface";
import type {
  CalligraphyAttempt,
  CalligraphyEvaluationFeedback,
  CalligraphyEvaluationMetrics,
  CalligraphyEvaluationResult
} from "../../../Shared/DomainTypes";
import { ApplicationError, StrokeError } from "../../../Shared/AppErrors";

/**
 * Creates the calligraphy evaluation view model.
 */
export function createCalligraphyEvaluationViewModel(
  dependencies: CreateCalligraphyEvaluationControllerDependencies
): CalligraphyEvaluationInterface {
  return {
    async evaluateAttempt(attempt: CalligraphyAttempt): Promise<CalligraphyEvaluationResult> {
      if (!attempt.isFinalized || attempt.strokes.length === 0) {
        throw new StrokeError("Draw at least one stroke before evaluating the practice.");
      }

      return dependencies.evaluateAttempt(attempt);
    },
    calculateScore(result: CalligraphyEvaluationResult): number {
      if (!isValidEvaluationResult(result)) {
        throw new ApplicationError("The calligraphy score could not be calculated.");
      }

      return Math.max(0, Math.min(100, Math.round(result.score)));
    },
    createFeedback(result: CalligraphyEvaluationResult): CalligraphyEvaluationFeedback {
      if (!isValidEvaluationResult(result)) {
        throw new ApplicationError("The calligraphy feedback could not be created.");
      }

      return dependencies.createFeedback(result);
    }
  };
}

function isValidEvaluationResult(result: CalligraphyEvaluationResult): boolean {
  return (
    result.targetCharacter.trim().length > 0 &&
    result.summary.trim().length > 0 &&
    isScore(result.score) &&
    isValidMetrics(result.metrics)
  );
}

function isValidMetrics(metrics: CalligraphyEvaluationMetrics): boolean {
  return (
    isScore(metrics.strokeCount) &&
    isScore(metrics.strokeOrder) &&
    isScore(metrics.approximateDirection) &&
    isScore(metrics.generalSimilarity)
  );
}

function isScore(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 100;
}
