/**
 * Contract for presenting and navigating inference results.
 */
export interface DisplayInferencesInterface {
  updateResultsFromImageSource(
    sourceId: string,
    predictions: ReadonlyArray<{ character: string; confidence: number }>
  ): void;

  updateResultsFromDrawingInference(
    predictions: ReadonlyArray<{ character: string; confidence: number; strokeCount?: number }>
  ): void;

  getVisibleResults(): ReadonlyArray<{
    character: string;
    primaryReadings: ReadonlyArray<string>;
    levels: ReadonlyArray<string>;
  }>;

  openKanjiEntry(character: string): Promise<void>;

  clearResults(): void;
}
