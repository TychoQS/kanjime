import type { DisplayKanjiInterface } from "./Contracts/DisplayKanjiInterface";
import type { DetailedKanjiEntry } from "../../Shared/DomainTypes";

/**
 * External collaborators consumed by the kanji-detail controller.
 */
export interface CreateDisplayKanjiControllerDependencies {
  readonly loadKanjiDetails: (character: string) => Promise<DetailedKanjiEntry>;
  readonly copyToClipboard: (character: string) => Promise<void>;
  readonly navigateBack: () => Promise<void> | void;
}

/**
 * Creates the kanji-detail controller stub used by the RED test suite.
 */
export function CreateDisplayKanjiController(
  _dependencies: CreateDisplayKanjiControllerDependencies
): DisplayKanjiInterface {
  return {
    async getKanjiDetails(character: string): Promise<DetailedKanjiEntry> {
      return {
        character,
        strokeCount: 0
      };
    },
    async copyKanjiCharacter(_character: string): Promise<void> {},
    returnToPreviousScreen(): void {}
  };
}
