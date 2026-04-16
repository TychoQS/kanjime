/**
 * Contract for persistent application history.
 *
 * @inv History records are persistent and do not belong to volatile screen state.
 * @inv No duplicated history entries exist for the same character and category combination.
 * @inv Every history record belongs to exactly one of the four supported categories.
 */
export interface HistoryInterface {
  /**
   * Returns the stored history grouped by category.
   *
   * Requirement IDs: R15, R18.
   *
   * @pre The user is on the history screen.
   * @post The returned groups contain the stored records organized by search, visitedEntry, imageClassification, or drawingClassification.
   */
  getEntriesByCategory(): Promise<
    ReadonlyArray<{
      category: "search" | "visitedEntry" | "imageClassification" | "drawingClassification";
      entries: ReadonlyArray<{
        character: string;
        createdAt: string;
      }>;
    }>
  >;

  /**
   * Persists a new history entry when the character and category are valid.
   *
   * Requirement IDs: R17.
   *
   * @pre The character and category are valid.
   * @post The new history entry is stored in persistent storage if it is not a duplicate.
   */
  saveEntry(
    entry: {
      character: string;
      category: "search" | "visitedEntry" | "imageClassification" | "drawingClassification";
      createdAt: string;
    }
  ): Promise<void>;

  /**
   * Opens the full kanji entry from a selected history item.
   *
   * Requirement IDs: R16.
   *
   * @pre At least one history entry exists.
   * @post The selected kanji entry is displayed without mutating the stored history.
   */
  openKanjiEntry(character: string): Promise<void>;
}
