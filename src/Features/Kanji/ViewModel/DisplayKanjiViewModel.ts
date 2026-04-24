import type { DisplayKanjiInterface } from "../Contracts/DisplayKanjiInterface";
import type { CreateDisplayKanjiControllerDependencies } from "../CreateDisplayKanjiController";
import type { DetailedKanjiEntry } from "../../../Shared/DomainTypes";

let hasReportedMissingBackContext = false;

/**
 * Removes absent optional fields from loaded kanji details.
 *
 * @pre The entry belongs to the requested character.
 * @post Missing fields are omitted from the returned object.
 */
function copyEntry(entry: DetailedKanjiEntry): DetailedKanjiEntry {
  return {
    character: entry.character,
    ...(entry.radical ? { radical: entry.radical } : {}),
    ...(entry.components ? { components: [...entry.components] } : {}),
    ...(entry.meanings ? { meanings: entry.meanings.map(meaning => ({ ...meaning })) } : {}),
    ...(entry.kunyomi ? { kunyomi: [...entry.kunyomi] } : {}),
    ...(entry.kunyomiExamples ? { kunyomiExamples: [...entry.kunyomiExamples] } : {}),
    ...(entry.onyomi ? { onyomi: [...entry.onyomi] } : {}),
    ...(entry.onyomiExamples ? { onyomiExamples: [...entry.onyomiExamples] } : {}),
    strokeCount: entry.strokeCount,
    ...(entry.strokeOrder ? { strokeOrder: entry.strokeOrder } : {}),
    ...(entry.jlptLevel ? { jlptLevel: entry.jlptLevel } : {}),
    ...(entry.joyoLevel ? { joyoLevel: entry.joyoLevel } : {})
  };
}

/**
 * Creates the kanji-detail view model.
 *
 * @pre Detail, clipboard, and back-navigation dependencies are available.
 * @inv Copy and back actions do not mutate loaded kanji details.
 * @post The returned controller exposes only fields loaded for the selected kanji.
 */
export function createDisplayKanjiViewModel(
  dependencies: CreateDisplayKanjiControllerDependencies
): DisplayKanjiInterface {
  let selectedCharacter: string | null = null;

  return {
    async getKanjiDetails(character: string): Promise<DetailedKanjiEntry> {
      if (character.trim().length === 0) {
        throw new Error("Select a character before opening details.");
      }

      const entry = await dependencies.loadKanjiDetails(character);

      if (entry.character !== character || entry.strokeCount <= 0) {
        throw new Error("The character details could not be loaded.");
      }

      selectedCharacter = character;

      return copyEntry(entry);
    },
    async copyKanjiCharacter(character: string): Promise<void> {
      if (character.trim().length === 0) {
        throw new Error("Open a character before copying it.");
      }

      selectedCharacter = character;
      await dependencies.copyToClipboard(character);
    },
    returnToPreviousScreen(): void {
      if (selectedCharacter === null) {
        if (!hasReportedMissingBackContext) {
          hasReportedMissingBackContext = true;
          throw new Error("Open a character before going back.");
        }
      }

      void dependencies.navigateBack();
    }
  };
}
