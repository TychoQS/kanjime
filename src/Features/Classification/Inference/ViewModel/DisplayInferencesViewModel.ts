import type { DisplayInferencesInterface } from "../Contracts/DisplayInferencesInterface";
import type {
  CreateDisplayInferencesControllerDependencies
} from "../CreateDisplayInferencesController";
import type { CharacterSummary, HistoryCategory } from "../../../../Shared/DomainTypes";

const MAX_VISIBLE_RESULTS = 5;

let registeredDisplayClear: (() => void) | null = null;

export function clearRegisteredInferenceDisplayState(): void {
  registeredDisplayClear?.();
}

function toSummary(
  prediction: { character: string },
  dependencies: CreateDisplayInferencesControllerDependencies
): CharacterSummary & { strokeCount: number } {
  const resolvedSummary = dependencies.resolveSummary?.(prediction.character);

  if (resolvedSummary) {
    return {
      character: resolvedSummary.character,
      primaryReadings: [...resolvedSummary.primaryReadings],
      levels: [...resolvedSummary.levels],
      strokeCount: resolvedSummary.strokeCount
    };
  }

  return {
    character: prediction.character,
    primaryReadings: [],
    levels: [],
    strokeCount: 0
  };
}

function createVisibleResults(
  predictions: ReadonlyArray<{ character: string; confidence: number }>,
  options: { readonly sortByConfidence: boolean; readonly limit: number },
  dependencies: CreateDisplayInferencesControllerDependencies
): ReadonlyArray<CharacterSummary & { strokeCount: number }> {
  if (predictions.length === 0) {
    throw new Error("empty predictions");
  }

  if (predictions.some(prediction => prediction.character.trim().length === 0)) {
    throw new Error("The character could not be identified.");
  }

  const orderedPredictions = options.sortByConfidence
    ? [...predictions].sort((left, right) => right.confidence - left.confidence)
    : [...predictions];

  return orderedPredictions
    .slice(0, options.limit)
    .map(prediction => toSummary(prediction, dependencies));
}

export function createDisplayInferencesViewModel(
  dependencies: CreateDisplayInferencesControllerDependencies
): DisplayInferencesInterface {
  let visibleResults: ReadonlyArray<CharacterSummary & { strokeCount: number }> = [];
  let lastImageSourceId: string | null = null;
  let lastHistoryCategory: HistoryCategory = "drawingClassification";
  let wasCleared = false;

  registeredDisplayClear = () => {
    visibleResults = [];
    lastImageSourceId = null;
    wasCleared = true;
  };

  return {
    updateResultsFromImageSource(sourceId, predictions): void {
      if (sourceId.trim().length === 0) {
        throw new Error("invalid image source");
      }

      if (sourceId === lastImageSourceId) {
        return;
      }

      wasCleared = false;
      visibleResults = createVisibleResults(predictions, {
        sortByConfidence: true,
        limit: MAX_VISIBLE_RESULTS
      }, dependencies);
      lastImageSourceId = sourceId;
      lastHistoryCategory = "imageClassification";
    },
    updateResultsFromDrawingInference(predictions): void {
      wasCleared = false;
      visibleResults = createVisibleResults(predictions, {
        sortByConfidence: true,
        limit: MAX_VISIBLE_RESULTS
      }, dependencies);
      lastHistoryCategory = "drawingClassification";
    },
    getVisibleResults(): ReadonlyArray<CharacterSummary> {
      if (visibleResults.length === 0) {
        if (wasCleared) {
          return [];
        }

        throw new Error("No character results are available yet.");
      }

      return visibleResults.map(result => ({
        character: result.character,
        primaryReadings: [...result.primaryReadings],
        levels: [...result.levels]
      }));
    },
    async openKanjiEntry(character: string): Promise<void> {
      if (!visibleResults.some(result => result.character === character)) {
        throw new Error("Select a result before opening details.");
      }

      await dependencies.navigateToKanjiEntry(character);
      await dependencies.saveHistoryEntry(character, lastHistoryCategory);
    },
    clearResults(): void {
      visibleResults = [];
      lastImageSourceId = null;
      wasCleared = true;
    }
  };
}
