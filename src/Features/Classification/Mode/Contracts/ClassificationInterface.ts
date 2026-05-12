/**
 * Contract for the active classification mode within the OCR screen.
 *
 * @inv Only one OCR mode can be active at any given time.
 */
export interface ClassificationInterface {
  /**
   * Returns the currently active OCR mode.
   *
   * Requirement IDs: R39.
   *
   * @pre The user is on the classification screen.
   * @post The returned value identifies the single active OCR mode.
   */
  getActiveMode(): "image" | "drawing";

  /**
   * Activates the requested OCR mode and deactivates the other one.
   *
   * Requirement IDs: R39.
   *
   * @pre The user is on the classification screen.
   * @post Only the selected mode remains active after the operation completes.
   */
  activateMode(mode: "image" | "drawing"): void;
}
