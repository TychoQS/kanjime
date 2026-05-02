import { useEffect, useState } from "react";

import type { DisplayKanjiInterface } from "../Contracts/DisplayKanjiInterface";
import type { CreateDisplayKanjiControllerDependencies } from "../CreateDisplayKanjiController";
import type { DetailedKanjiEntry } from "../../../Shared/DomainTypes";
import { ApplicationError, DatabaseError, InfrastructureError } from "../../../Shared/AppErrors";

let hasReportedMissingBackContext = false;

export interface KanjiDetailScreenViewModel {
  readonly details: DetailedKanjiEntry | null;
  readonly isLoading: boolean;
  readonly errorMessage: string | null;
  copyKanjiCharacter(): Promise<void>;
  returnToPreviousScreen(): void;
}

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
        throw new DatabaseError("Select a character before opening details.");
      }

      const entry = await dependencies.loadKanjiDetails(character);

      if (entry.character !== character || entry.strokeCount <= 0) {
        throw new DatabaseError("The character details could not be loaded.");
      }

      selectedCharacter = character;

      return copyEntry(entry);
    },
    async copyKanjiCharacter(character: string): Promise<void> {
      if (character.trim().length === 0) {
        throw new ApplicationError("Open a character before copying it.");
      }

      selectedCharacter = character;
      await dependencies.copyToClipboard(character);
    },
    returnToPreviousScreen(): void {
      if (selectedCharacter === null) {
        if (!hasReportedMissingBackContext) {
          hasReportedMissingBackContext = true;
          throw new InfrastructureError("Open a character before going back.");
        }
      }

      void dependencies.navigateBack();
    }
  };
}

/**
 * Creates the Kanji detail screen hook view model.
 *
 * @pre The route character, when present, identifies the requested kanji entry.
 * @inv Loaded details, loading state, and feedback messages remain owned by the view model.
 * @post The returned state reflects the currently requested kanji detail workflow.
 */
export function useKanjiDetailScreenViewModel(
  displayKanjiController: DisplayKanjiInterface,
  character: string | null,
  language: string,
  refreshKey: string,
  isEnabled: boolean
): KanjiDetailScreenViewModel {
  const [details, setDetails] = useState<DetailedKanjiEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isEnabled || character === null) {
      setDetails(null);
      setIsLoading(false);
      setErrorMessage(null);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    void displayKanjiController.getKanjiDetails(character)
      .then(nextDetails => {
        setDetails(nextDetails);
        setIsLoading(false);
      })
      .catch(() => {
        setDetails(null);
        setErrorMessage("The character details could not be loaded.");
        setIsLoading(false);
      });
  }, [character, displayKanjiController, isEnabled, language, refreshKey]);

  return {
    details,
    isLoading,
    errorMessage,
    async copyKanjiCharacter(): Promise<void> {
      if (character === null) {
        setErrorMessage("An unexpected error has occurred and the character could not be identified.");
        return;
      }

      try {
        await displayKanjiController.copyKanjiCharacter(character);
      } catch {
        setErrorMessage("An unexpected error has occurred and the character could not be identified.");
      }
    },
    returnToPreviousScreen(): void {
      try {
        displayKanjiController.returnToPreviousScreen();
      } catch {
        window.history.back();
      }
    }
  };
}
