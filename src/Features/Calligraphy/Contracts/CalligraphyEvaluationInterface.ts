import type {
  CalligraphyAttempt,
  CalligraphyEvaluationFeedback,
  CalligraphyEvaluationResult
} from "../../../Shared/DomainTypes";

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
   * Requirement IDs: R54.
   *
   * @pre The writing attempt has been finalized.
   * @post The application generates an evaluation result for the writing attempt.
   */
  evaluateAttempt(attempt: CalligraphyAttempt): Promise<CalligraphyEvaluationResult>;

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
   * Builds the visual feedback shown to the user.
   *
   * Requirement IDs: R56.
   *
   * @pre A calculated evaluation result exists.
   * @post The application exposes feedback with the score and result summary.
   */
  createFeedback(result: CalligraphyEvaluationResult): CalligraphyEvaluationFeedback;
}
