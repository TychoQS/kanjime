/**
 * Props contract for the history list component.
 *
 * Requirement IDs: R2, R3.
 *
 * @pre At least one history entry exists and multiple entries are available when ordering is evaluated.
 * @inv Visible entries stay sorted from most recent to oldest.
 * @post Entries are sorted by date from newest to oldest.
 */
export interface HistoryProps {
  readonly groups: ReadonlyArray<{
    category: "search" | "visitedEntry" | "imageClassification" | "drawingClassification";
    entries: ReadonlyArray<{
      character: string;
      createdAt: string;
      summary: string;
    }>;
  }>;
  /**
   * @inv Selecting one entry does not alter the remaining items.
   * @post Selecting an entry opens the full kanji entry for that history record.
   */
  readonly onEntrySelected: (character: string) => void;
}
