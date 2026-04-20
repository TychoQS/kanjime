import type { SearchInterface } from "./Contracts/SearchInterface";
import type { CharacterSummary } from "../../Shared/DomainTypes";

/**
 * External collaborators consumed by the search controller.
 */
export interface CreateSearchControllerDependencies {
  readonly queryTerm: (term: string) => Promise<ReadonlyArray<CharacterSummary>>;
  readonly navigateToKanjiEntry: (character: string) => Promise<void>;
}

/**
 * Creates the search controller stub used by the RED test suite.
 */
export function CreateSearchController(
  _dependencies: CreateSearchControllerDependencies
): SearchInterface {
  return {
    async search(_term: string): Promise<ReadonlyArray<CharacterSummary>> {
      return [];
    },
    clearSearch(): void {},
    async openKanjiEntry(_character: string): Promise<void> {}
  };
}
