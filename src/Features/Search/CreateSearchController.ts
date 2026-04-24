import type { SearchInterface } from "./Contracts/SearchInterface";
import type { CharacterSummary } from "../../Shared/DomainTypes";
import { createSearchViewModel } from "./ViewModel/SearchViewModel";

/**
 * External collaborators consumed by the search controller.
 */
export interface CreateSearchControllerDependencies {
  readonly queryTerm: (term: string) => Promise<ReadonlyArray<CharacterSummary>>;
  readonly navigateToKanjiEntry: (character: string) => Promise<void>;
}

/**
 * Creates the search controller.
 */
export function CreateSearchController(
  dependencies: CreateSearchControllerDependencies
): SearchInterface {
  return createSearchViewModel(dependencies);
}
