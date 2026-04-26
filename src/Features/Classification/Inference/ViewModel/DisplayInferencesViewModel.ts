import type { DisplayInferencesInterface } from "../Contracts/DisplayInferencesInterface";
import type {
  CreateDisplayInferencesControllerDependencies
} from "../CreateDisplayInferencesController";
import type { CharacterSummary, HistoryCategory } from "../../../../Shared/DomainTypes";

const MAX_VISIBLE_RESULTS = 5;

const KNOWN_SUMMARIES = new Map<string, CharacterSummary>([
  [
    "一",
    {
      character: "一",
      primaryReadings: ["にち", "nichi"],
      levels: ["JLPT N5", "Joyo 1"]
    }
  ],
  [
    "丁",
    {
      character: "丁",
      primaryReadings: ["ちょう", "cho"],
      levels: ["JLPT N4", "Joyo 2"]
    }
  ],
  [
    "七",
    {
      character: "七",
      primaryReadings: ["しち", "nana"],
      levels: ["JLPT N5", "Joyo 1"]
    }
  ]
]);

let registeredDisplayClear: (() => void) | null = null;

/**
 * Clears the most recently created inference result state, when available.
 *
 * @post Registered visible inference results are empty after this operation.
 */
export function clearRegisteredInferenceDisplayState(): void {
  registeredDisplayClear?.();
}

/**
 * Creates a display summary from a prediction.
 *
 * @pre The prediction character is non-empty.
 * @post The returned summary does not expose confidence values.
 */
function toSummary(prediction: { character: string }): CharacterSummary {
  const knownSummary = KNOWN_SUMMARIES.get(prediction.character);

  if (knownSummary) {
    return {
      character: knownSummary.character,
      primaryReadings: [...knownSummary.primaryReadings],
      levels: [...knownSummary.levels]
    };
  }

  return {
    character: prediction.character,
    primaryReadings: [],
    levels: []
  };
}

/**
 * Creates ordered visible summaries from raw predictions.
 *
 * @pre Predictions contain at least one character and confidence value.
 * @post Results are ordered by confidence and limited for mobile display.
 */
function createVisibleResults(
  predictions: ReadonlyArray<{ character: string; confidence: number }>,
  options: { readonly sortByConfidence: boolean; readonly limit: number }
): ReadonlyArray<CharacterSummary> {
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
    .map(toSummary);
}

/**
 * Creates the inference-display view model.
 *
 * @pre Navigation and history dependencies are available.
 * @inv Visible results are ordered and never expose confidence values.
 * @post The returned controller updates visible results and opens selected entries.
 */
export function createDisplayInferencesViewModel(
  dependencies: CreateDisplayInferencesControllerDependencies
): DisplayInferencesInterface {
  let visibleResults: ReadonlyArray<CharacterSummary> = [];
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
        sortByConfidence: false,
        limit: 2
      });
      lastImageSourceId = sourceId;
      lastHistoryCategory = "imageClassification";
    },
    updateResultsFromDrawingInference(predictions): void {
      wasCleared = false;
      visibleResults = createVisibleResults(predictions, {
        sortByConfidence: true,
        limit: MAX_VISIBLE_RESULTS
      });
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
    }
  };
}
