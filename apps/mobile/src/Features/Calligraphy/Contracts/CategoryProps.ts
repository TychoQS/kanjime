import type { CalligraphyKanjiSummary } from "@kanjime/shared";

/**
 * Props contract for the calligraphy category kanji list screen.
 *
 * Requirement IDs: R29.
 *
 * @pre The user is on the kanji selection screen for one calligraphy category.
 * @inv The category search field remains visible before and after any filtering attempt.
 * @post The user can identify the category search field without opening an additional screen or menu.
 */
export interface CategoryProps {
  readonly categoryId: string;
  readonly searchTerm: string;
  readonly visibleKanji: ReadonlyArray<CalligraphyKanjiSummary>;
  readonly onBackRequested: () => void;
  readonly onKanjiSelected: (character: string) => void;
  readonly onSearchTermChanged: (term: string) => void;
}
