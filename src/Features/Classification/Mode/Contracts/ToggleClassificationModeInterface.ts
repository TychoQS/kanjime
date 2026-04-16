/**
 * Contract for toggling between OCR modes.
 *
 * @inv User preferences remain unchanged while switching modes.
 */
export interface ToggleClassificationModeInterface {
  /**
   * Switches the OCR screen to the requested mode and clears the previous mode state.
   *
   * Requirement IDs: R36.
   *
   * @pre The current screen is already in one of the OCR modes.
   * @post The previous mode state is discarded and the selected mode becomes active without changing user preferences.
   */
  switchMode(mode: "image" | "drawing"): void;
}
