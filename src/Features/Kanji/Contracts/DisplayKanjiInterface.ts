/**
 * Contract for displaying and interacting with a kanji entry.
 *
 * @inv Only fields that exist for the selected kanji are exposed for rendering.
 * @inv All returned data belongs exclusively to the selected kanji.
 * @inv Copy and back-navigation actions do not mutate the preserved previous screen state.
 */
export interface DisplayKanjiInterface {
  /**
   * Returns the available data fields for the selected kanji.
   *
   * Requirement IDs: R12.
   *
   * @pre A valid kanji has been selected.
   * @post Every available stored field for the selected kanji is returned and missing fields are omitted from the result.
   */
  getKanjiDetails(character: string): Promise<{
    character: string;
    radical?: string;
    components?: ReadonlyArray<string>;
    meanings?: ReadonlyArray<{ language: string; value: string }>;
    kunyomi?: ReadonlyArray<string>;
    kunyomiExamples?: ReadonlyArray<string>;
    onyomi?: ReadonlyArray<string>;
    onyomiExamples?: ReadonlyArray<string>;
    strokeCount: number;
    strokeOrder?: string;
    jlptLevel?: string;
    joyoLevel?: string;
  }>;

  /**
   * Copies the selected kanji character to the system clipboard.
   *
   * Requirement IDs: R13.
   *
   * @pre The user is currently on the kanji information screen.
   * @post The kanji character is copied to the clipboard without changing the application state.
   */
  copyKanjiCharacter(character: string): Promise<void>;

  /**
   * Returns to the previous screen while preserving its prior state.
   *
   * Requirement IDs: R14.
   *
   * @pre The user is currently on the kanji information screen.
   * @post Navigation returns to the previous screen and restores the preserved state that existed before the kanji entry was opened.
   */
  returnToPreviousScreen(): void;
}
