import type {
  CalligraphyAttempt,
  CalligraphyEvaluationFeedback,
  CalligraphyEvaluationResult,
  CalligraphyReferenceVisual,
  CalligraphySimilarityEvaluation,
  CalligraphyVisualComparison
} from "@kanjime/shared";

/**
 * Contract for evaluating a completed calligraphy attempt.
 *
 * @inv Evaluation considers stroke count, stroke order, approximate direction, and general similarity.
 * @inv Calculated scores remain inside the permitted score range.
 * @inv Visual feedback always corresponds to the calculated evaluation result.
 */
export interface CalligraphyEvaluationInterface {
  /**
   * Evaluates a finalized writing attempt.
   *
   * Requirement IDs: R54, R68, R69, R70.
   *
   * @pre The writing attempt has been finalized and the target character reference can be rendered for comparison.
   * @post The application generates an evaluation result for the writing attempt, including the data required to build the visual comparison.
   */
  evaluateAttempt(attempt: CalligraphyAttempt): Promise<CalligraphyEvaluationResult>;

  /**
   * Calculates the general visual similarity between the reference and the user attempt.
   *
   * Requirement IDs: R68, R69.
   *
   * @pre The writing attempt has been finalized and a renderable target-character reference exists.
   * @inv The similarity calculation never mutates the stroke-count, stroke-order, or approximate-direction metrics already associated with the evaluation.
   * @post The application returns a SIFT-based similarity score or a controlled fallback similarity score when the SIFT comparison does not have enough keypoints.
   */
  calculateGeneralSimilarity(
    attempt: CalligraphyAttempt,
    reference: CalligraphyReferenceVisual
  ): Promise<CalligraphySimilarityEvaluation>;

  /**
   * Calculates the global success score from a valid evaluation result.
   *
   * Requirement IDs: R55.
   *
   * @pre A valid evaluation result exists for the writing attempt.
   * @post The application calculates a global success score for the writing attempt.
   */
  calculateScore(result: CalligraphyEvaluationResult): number;

  /**
   * Builds the visual comparison between the reference character and the user attempt.
   *
   * Requirement IDs: R70.
   *
   * @pre A calculated evaluation result exists for the same target character and attempt being rendered.
   * @inv The produced comparison always refers to the same target character and attempt represented by the evaluation result.
   * @post The application exposes differentiated reference and attempt visuals and indicates whether homography alignment was applied.
   */
  createVisualComparison(result: CalligraphyEvaluationResult): CalligraphyVisualComparison;

  /**
   * Builds the visual feedback shown to the user.
   *
   * Requirement IDs: R56.
   *
   * @pre A calculated evaluation result exists.
   * @post The application exposes feedback with the score and result summary.
   */
  createFeedback(result: CalligraphyEvaluationResult): CalligraphyEvaluationFeedback;
}
