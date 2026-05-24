import type { Stroke } from "../../../Shared/DomainTypes";

/**
 * Contract for the calligraphy practice canvas.
 *
 * @inv Captured strokes preserve the order in which the user drew them.
 * @inv The canvas remains operational after a reset operation.
 */
export interface CalligraphyCanvasInterface {
  /**
   * Registers a completed stroke in the current writing attempt.
   *
   * Requirement IDs: R51.
   *
   * @pre The user is in an active calligraphy practice.
   * @post The stroke is appended to the current canvas history.
   */
  registerStroke(stroke: Stroke): void;

  /**
   * Clears all strokes from the current writing attempt.
   *
   * Requirement IDs: R52.
   *
   * @pre The current writing attempt contains at least one registered stroke.
   * @pre The user is in an active calligraphy practice.
   * @post All strokes are removed from the current writing attempt.
   */
  resetAttempt(): void;

  /**
   * Returns the current canvas stroke history.
   */
  getStrokeHistory(): ReadonlyArray<Stroke>;
}
