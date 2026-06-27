import type { CreateCalligraphyEvaluationControllerDependencies } from "../CreateCalligraphyEvaluationController";
import type { CalligraphyEvaluationInterface } from "../Contracts/CalligraphyEvaluationInterface";
import {
  createCalligraphyVisualComparison
} from "../Services/CalligraphyEvaluationService";
import type {
  CalligraphyAttempt,
  CalligraphyEvaluationFeedback,
  CalligraphyEvaluationMetrics,
  CalligraphyEvaluationResult,
  CalligraphyReferenceVisual,
  CalligraphySimilarityEvaluation,
  CalligraphyVisualComparison
} from "@kanjime/shared";
import { ApplicationError, StrokeError } from "@kanjime/shared";

/**
 * Creates the calligraphy evaluation view model.
 */
export function createCalligraphyEvaluationViewModel(
  dependencies: CreateCalligraphyEvaluationControllerDependencies
): CalligraphyEvaluationInterface {
  const viewModel: CalligraphyEvaluationInterface = {
    async evaluateAttempt(attempt: CalligraphyAttempt): Promise<CalligraphyEvaluationResult> {
      if (!attempt.isFinalized || attempt.strokes.length === 0) {
        throw new StrokeError("Draw at least one stroke before evaluating the practice.");
      }

      const result = await dependencies.evaluateAttempt(attempt);
      const similarityEvaluation = result.similarityEvaluation ?? await viewModel.calculateGeneralSimilarity(attempt, {
        targetCharacter: result.targetCharacter,
        referenceImageUri: `reference:${result.targetCharacter}`
      });
      const resultWithSimilarity = {
        ...result,
        similarityEvaluation,
        visualComparison: result.visualComparison ?? createCalligraphyVisualComparison({
          ...result,
          similarityEvaluation
        })
      };

      return {
        ...resultWithSimilarity,
        score: viewModel.calculateScore(resultWithSimilarity)
      };
    },
    calculateScore(result: CalligraphyEvaluationResult): number {
      if (!isValidEvaluationResult(result)) {
        throw new ApplicationError("The calligraphy score could not be calculated.");
      }

      return Math.max(0, Math.min(100, Math.round(result.score)));
    },
    async calculateGeneralSimilarity(
      attempt: CalligraphyAttempt,
      reference: CalligraphyReferenceVisual
    ): Promise<CalligraphySimilarityEvaluation> {
      if (!attempt.isFinalized) {
        throw new StrokeError("The calligraphy attempt must be finalized before calculating similarity.");
      }

      if (!dependencies.calculateGeneralSimilarity) {
        throw new StrokeError("No similarity engine is configured for evaluation.");
      }

      return dependencies.calculateGeneralSimilarity(attempt, reference);
    },
    createVisualComparison(result: CalligraphyEvaluationResult): CalligraphyVisualComparison {
      if (!result.visualComparison) {
        throw new ApplicationError(
            "The visual comparison could not be created because the evaluation result does not contain visual comparison data."
        );
      }

      return dependencies.createVisualComparison
          ? dependencies.createVisualComparison(result)
          : createCalligraphyVisualComparison(result);
    },
    createFeedback(result: CalligraphyEvaluationResult): CalligraphyEvaluationFeedback {
      if (!isValidEvaluationResult(result)) {
        throw new ApplicationError("The calligraphy feedback could not be created.");
      }

      return dependencies.createFeedback(result);
    }
  };

  return viewModel;
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
