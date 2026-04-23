/**
 * Contract for presenting and navigating inference results.
 *
 * @inv Visible results are ordered by descending confidence.
 * @inv Visible results never expose numeric confidence values.
 * @inv The result list contains between one and five visible items whenever results are available.
 * @inv Results are not overwritten when receiving the same source again.
 */
export interface DisplayInferencesInterface {
  /**
   * Updates the result list from a newly classified image or crop source.
   *
   * Requirement IDs: R8.
   *
   * @pre A valid image source or crop source has been classified.
   * @post The result list is refreshed exactly once for the provided source identifier.
   */
  updateResultsFromImageSource(
    sourceId: string,
    predictions: ReadonlyArray<{ character: string; confidence: number }>
  ): void;

  /**
   * Updates the result list after a new drawing inference.
   *
   * Requirement IDs: R9.
   *
   * @pre A valid drawing inference has been received in draw mode.
   * @post The visible result list is refreshed for the new drawing inference with no more than five items.
   */
  updateResultsFromDrawingInference(
    predictions: ReadonlyArray<{ character: string; confidence: number }>
  ): void;

  /**
   * Returns the ordered results prepared for display.
   *
   * Requirement IDs: R10.
   *
   * @pre A valid inference exists and the model is loaded.
   * @post The returned collection contains between one and five results ordered from highest to lowest confidence without exposing confidence numbers.
   */
  getVisibleResults(): ReadonlyArray<{
    character: string;
    primaryReadings: ReadonlyArray<string>;
    levels: ReadonlyArray<string>;
  }>;

  /**
   * Opens the detailed kanji entry for a selected inference result.
   *
   * Requirement IDs: R11.
   *
   * @pre Results are available and the user is on the classification screen.
   * @inv The navitation to the kanji entry don't modify the current result list or mode state.
   * @post The selected kanji entry is opened and the action is recorded in history.
   */
  openKanjiEntry(character: string): Promise<void>;
}
