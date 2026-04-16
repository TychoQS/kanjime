/**
 * Contract for the drawing canvas classification workflow.
 *
 * @inv Stroke history only contains valid stroke objects.
 * @inv Drawing predictions never expose more than five visible candidates.
 * @inv No classification is triggered when the canvas has no strokes.
 */
export interface CanvasInterface {
  /**
   * Registers a completed stroke, stores it in history, and triggers a single drawing inference.
   *
   * Requirement IDs: R5, R6, R7.
   *
   * @pre A stroke has just been completed by the user.
   * @post The stroke is appended to history and the returned predictions are filtered to the X plus or minus one stroke rule with a maximum of five items.
   */
  registerStroke(
    stroke: {
      points: ReadonlyArray<{ x: number; y: number }>;
      startedAt: string;
      endedAt: string;
    }
  ): Promise<ReadonlyArray<{ character: string; strokeCount: number }>>;

  /**
   * Clears the canvas, stroke history, and drawing suggestions.
   *
   * Requirement IDs: R3, R4.
   *
   * @pre The canvas contains at least one stroke and drawable data.
   * @post The canvas content, stroke history, and suggestion list are empty and no inference is executed during the clear operation.
   */
  clearCanvas(): void;

  /**
   * Returns the current stroke history in insertion order.
   *
   * Requirement IDs: R5.
   *
   * @post The returned collection contains only previously registered strokes.
   */
  getStrokeHistory(): ReadonlyArray<{
    points: ReadonlyArray<{ x: number; y: number }>;
    startedAt: string;
    endedAt: string;
  }>;
}
