import type { DisplayKanjiInterface } from "./Contracts/DisplayKanjiInterface";
import type { DetailedKanjiEntry } from "../../Shared/DomainTypes";
import { createDisplayKanjiViewModel } from "./ViewModel/DisplayKanjiViewModel";

/**
 * External collaborators consumed by the kanji-detail controller.
 */
export interface CreateDisplayKanjiControllerDependencies {
  readonly loadKanjiDetails: (character: string) => Promise<DetailedKanjiEntry>;
  readonly copyToClipboard: (character: string) => Promise<void>;
  readonly navigateBack: () => Promise<void> | void;
}

/**
 * Creates the kanji-detail controller.
 */
export function CreateDisplayKanjiController(
  dependencies: CreateDisplayKanjiControllerDependencies
): DisplayKanjiInterface {
  return createDisplayKanjiViewModel(dependencies);
}
