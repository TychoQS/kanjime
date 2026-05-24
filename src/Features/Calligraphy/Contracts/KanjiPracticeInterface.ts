import type { CalligraphyAttempt, CalligraphyEvaluationResult } from "../../../Shared/DomainTypes";

/**
 * Contract for an active kanji calligraphy practice.
 *
 * @inv Registered strokes are not modified while evaluation is requested.
 */
export interface KanjiPracticeInterface {
  /**
   * Returns to the kanji list of the selected category.
   *
   * Requirement IDs: R50.
   *
   * @pre The user is in an active calligraphy practice.
   * @post The application returns to the kanji list for the selected category.
   */
  returnToCategory(): Promise<void>;

  /**
   * Finalizes the current writing attempt and requests its evaluation.
   *
   * Requirement IDs: R53.
   *
   * @pre The user is in an active calligraphy practice with at least one registered stroke.
   * @post The application requests evaluation of the current writing attempt.
   */
  requestEvaluation(attempt: CalligraphyAttempt): Promise<CalligraphyEvaluationResult>;
}
