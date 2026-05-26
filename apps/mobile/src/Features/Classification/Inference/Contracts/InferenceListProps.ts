/**
 * Props contract for the visible inference result list.
 *
 * Requirement IDs: R4.
 *
 * @pre At least one inference result is available.
 * @inv Selecting a result does not mutate the source result list.
 * @post Selecting an item opens the full kanji entry for the chosen character.
 */
export interface InferenceListProps {
  readonly results: ReadonlyArray<{
    character: string;
    primaryReadings: ReadonlyArray<string>;
    levels: ReadonlyArray<string>;
    isSelected: boolean;
  }>;
  readonly onResultSelected: (character: string) => void;
}
