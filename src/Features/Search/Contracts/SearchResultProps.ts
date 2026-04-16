/**
 * Props contract for an individual search result item.
 *
 * Requirement IDs: R12.
 * @pre A valid search term exists.
 * @inv All search results are displayed have the same visual structure.
 * @post The rendered item of a result exposes the character, main readings (kunyomi and onyomi), and associated levels (jlpt and joyo).
 */
export interface SearchResultProps {
  readonly character: string;
  readonly mainReadings: ReadonlyArray<string>;
  readonly levels: ReadonlyArray<string>;
  /**
   *  Requirement IDs: R11
   * @pre A valid search result exists.
   * @inv The surrounding result list remains unchanged when this item is selected.
   * @post The full kanji entry is displayed.
   */
  readonly onSelected: (character: string) => void;
}
