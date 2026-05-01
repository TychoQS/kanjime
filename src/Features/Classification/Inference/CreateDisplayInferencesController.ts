import type { DisplayInferencesInterface } from "./Contracts/DisplayInferencesInterface";
import type { CharacterSummary, HistoryCategory } from "../../../Shared/DomainTypes";
import { createDisplayInferencesViewModel } from "./ViewModel/DisplayInferencesViewModel";

/**
 * External collaborators consumed by the inference-display controller.
 */
export interface CreateDisplayInferencesControllerDependencies {
  readonly navigateToKanjiEntry: (character: string) => Promise<void>;
  readonly saveHistoryEntry: (character: string, category: HistoryCategory) => Promise<void>;
  readonly resolveSummary: (character: string) => (CharacterSummary & { strokeCount: number }) | null;
}

/**
 * Creates the visible inference controller.
 */
export function CreateDisplayInferencesController(
  dependencies: CreateDisplayInferencesControllerDependencies
): DisplayInferencesInterface {
  return createDisplayInferencesViewModel(dependencies);
}
