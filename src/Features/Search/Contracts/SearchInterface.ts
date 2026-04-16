/**
 * Contract for kanji search behavior.
 *
 * @inv Search updates dynamically as the effective non-empty term changes.
 * @inv No new search is executed when the incoming term is empty or equal to the previous term.
 */
export interface SearchInterface {
  /**
   * Searches by kanji, kana, or romaji term and returns summarized results.
   *
   * Requirement IDs: R31, R32, R35, R3.
   *
   * @pre The supplied search term is valid and different from the previous non-empty term.
   * @post Exactly one query is executed for the new term and the returned results contain summary data for each match.
   */
  search(term: string): Promise<
    ReadonlyArray<{
      character: string;
      primaryReadings: ReadonlyArray<string>;
      levels: ReadonlyArray<string>;
    }>
  >;

  /**
   * Clears the current search term and visible results.
   *
   * Requirement IDs: R33.
   *
   * @pre The search screen contains a non-empty term or visible results.
   * @post The search input and result list are empty and no new search is executed during the clear operation.
   */
  clearSearch(): void;

  /**
   * Opens the full kanji entry for a selected search result.
   *
   * Requirement IDs: R34.
   *
   * @pre A search result has been selected.
   * @post The selected kanji entry is displayed without mutating the current result list.
   */
  openKanjiEntry(character: string): Promise<void>;
}
