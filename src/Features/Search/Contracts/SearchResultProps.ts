/**
 * Props contract for an individual search result item.
 *
 * Requirement IDs: R11, R12.
 *
 * @pre A valid search result exists.
 * @inv The surrounding result list remains unchanged when this item is selected.
 * @post The rendered item exposes the character, main readings, and associated levels and allows navigation to the full kanji entry.
 */
export interface SearchResultProps {
  readonly character: string;
  readonly mainReadings: ReadonlyArray<string>;
  readonly levels: ReadonlyArray<string>;
  readonly onSelected: (character: string) => void;
}
