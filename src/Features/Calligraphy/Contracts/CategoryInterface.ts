import type { CalligraphyKanjiSummary } from "../../../Shared/DomainTypes";

/**
 * Contract for a selected calligraphy category list.
 *
 * @inv Visible kanji belong exclusively to the selected category.
 * @inv Each visible kanji has exactly one visual entry.
 */
export interface CategoryInterface {
  /**
   * Returns the kanji of the selected category ordered by ascending stroke count.
   *
   * Requirement IDs: R45, R47.
   *
   * @pre The user is on the kanji list screen for a selected calligraphy category.
   * @post The application shows all kanji belonging to the selected category ordered by ascending stroke count.
   * @post The application shows only one visual entry per each kanji of the category.
   */
  getKanjiByCategory(categoryId: string): Promise<ReadonlyArray<CalligraphyKanjiSummary>>;

  /**
   * Starts calligraphy practice for the selected kanji.
   *
   * Requirement IDs: R48.
   *
   * @pre The user is on the kanji list screen for a selected calligraphy category.
   * @post The selected kanji becomes the target of the calligraphy practice.
   */
  startPractice(character: string): Promise<void>;

  /**
   * Returns to the main calligraphy screen.
   *
   * Requirement IDs: R49.
   *
   * @pre The user is on the kanji list screen for a selected calligraphy category.
   * @post The application returns to the main calligraphy screen.
   */
  returnToCalligraphyHome(): Promise<void>;
}
