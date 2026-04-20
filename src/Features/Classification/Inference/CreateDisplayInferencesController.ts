import type { DisplayInferencesInterface } from "./Contracts/DisplayInferencesInterface";
import type { CharacterSummary, HistoryCategory } from "../../../Shared/DomainTypes";

/**
 * External collaborators consumed by the inference-display controller.
 */
export interface CreateDisplayInferencesControllerDependencies {
  readonly navigateToKanjiEntry: (character: string) => Promise<void>;
  readonly saveHistoryEntry: (character: string, category: HistoryCategory) => Promise<void>;
}

/**
 * Creates the visible inference controller stub used by the RED test suite.
 */
export function CreateDisplayInferencesController(
  _dependencies: CreateDisplayInferencesControllerDependencies
): DisplayInferencesInterface {
  return {
    updateResultsFromImageSource(
      _sourceId: string,
      _predictions: ReadonlyArray<{ character: string; confidence: number }>
    ): void {},
    updateResultsFromDrawingInference(
      _predictions: ReadonlyArray<{ character: string; confidence: number }>
    ): void {},
    getVisibleResults(): ReadonlyArray<CharacterSummary> {
      return [];
    },
    async openKanjiEntry(_character: string): Promise<void> {}
  };
}
