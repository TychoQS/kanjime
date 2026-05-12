/**
 * Props contract for the kanji entry screen component.
 *
 * Requirement IDs: R5, R6.
 *
 * @pre The kanji entry screen is visible.
 * @inv Copying or navigating back does not mutate the preserved application state.
 * @post The component exposes visible mechanisms to copy the kanji character and return to the previous screen.
 */
export interface KanjiEntryProps {
  readonly character: string;
  readonly meanings: ReadonlyArray<{ language: string; value: string }>;
  readonly primaryReadings: ReadonlyArray<string>;
  readonly levels: ReadonlyArray<string>;
  readonly canCopy: boolean;
  readonly canGoBack: boolean;
  readonly onCopyRequested: () => void;
  readonly onBackRequested: () => void;
}
