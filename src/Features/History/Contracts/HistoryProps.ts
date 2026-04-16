/**
 * Props contract for the history list component.
 *
 * Requirement IDs: R2, R3.
 *
 * @pre At least one history entry exists and multiple entries are available when ordering is evaluated.
 * @inv Selecting one entry does not alter the remaining items.
 * @inv Visible entries stay sorted from most recent to oldest.
 * @post Selecting an entry opens the full kanji entry for that history record.
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
  readonly onEntrySelected: (character: string) => void;
}
