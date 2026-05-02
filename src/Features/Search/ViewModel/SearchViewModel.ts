import { useEffect, useState } from "react";

import type { SearchInterface } from "../Contracts/SearchInterface";
import type { CreateSearchControllerDependencies } from "../CreateSearchController";
import type { CharacterSummary } from "../../../Shared/DomainTypes";
import { SearchError } from "../../../Shared/AppErrors";

const SEARCH_DELAY_MS = 100;
let registeredSearchScreenClear: (() => void) | null = null;
let shouldClearSearchScreenOnEnable = false;

export interface SearchScreenViewModel {
  readonly term: string;
  readonly results: ReadonlyArray<CharacterSummary>;
  readonly isSearching: boolean;
  setTerm(term: string): void;
  clear(): void;
  openKanjiEntry(character: string): Promise<void>;
}

/**
 * Clears the registered Search screen hook state, when available.
 *
 * @post The visible search term, results, and busy state are reset.
 */
export function clearRegisteredSearchScreenState(): void {
  registeredSearchScreenClear?.();
}

/**
 * Marks the Search screen to clear its state the next time it becomes active.
 *
 * @post The next enabled Search screen render resets its visible state.
 */
export function markRegisteredSearchScreenForReset(): void {
  shouldClearSearchScreenOnEnable = true;
}

/**
 * Creates a defensive copy of result summaries.
 *
 * @pre Results come from the kanji repository.
 * @post Mutating the returned array cannot alter controller state.
 */
function copySummaries(results: ReadonlyArray<CharacterSummary>): ReadonlyArray<CharacterSummary> {
  return results.map(result => ({
    character: result.character,
    primaryReadings: [...result.primaryReadings],
    levels: [...result.levels]
  }));
}

/**
 * Creates the search view model.
 *
 * @pre Query and navigation dependencies are wired to kanji data.
 * @inv Empty and repeated terms do not issue repository queries.
 * @post The returned controller stores visible results for navigation.
 */
export function createSearchViewModel(dependencies: CreateSearchControllerDependencies): SearchInterface {
  let currentTerm = "";
  let visibleResults: ReadonlyArray<CharacterSummary> = [];

  return {
    search(term: string): Promise<ReadonlyArray<CharacterSummary>> {
      const effectiveTerm = term.trim();

      if (effectiveTerm.length === 0) {
        return Promise.resolve([]);
      }

      if (effectiveTerm === currentTerm) {
        return Promise.resolve(copySummaries(visibleResults));
      }

      return dependencies.queryTerm(effectiveTerm).then(results => {
        const isNewTerm = effectiveTerm !== currentTerm;
        currentTerm = effectiveTerm;
        visibleResults = copySummaries(results);

        if (isNewTerm && results.length > 0) {
          dependencies.historyController.saveEntry({
            character: effectiveTerm,
            category: "search",
            createdAt: new Date().toISOString()
          });
        }

        return copySummaries(visibleResults);
      });
    },
    clearSearch(): void {
      if (currentTerm.length === 0 && visibleResults.length === 0) {
        return Promise.reject(
          new SearchError("SearchInterface cannot clear an empty search bar.")
        ) as unknown as void;
      }

      currentTerm = "";
      visibleResults = [];
    },
    async openKanjiEntry(character: string): Promise<void> {
      if (character.trim().length === 0) {
        throw new SearchError("SearchInterface accepted an empty character to open.");
      }

      if (visibleResults.length === 0) {
        visibleResults = copySummaries(await dependencies.queryTerm(character));
      }

      if (visibleResults.length === 0) {
        throw new SearchError("SearchInterface cannot open entry because no results are available.");
      }

      await dependencies.historyController.saveEntry({
        character,
        category: "visitedEntry",
        createdAt: new Date().toISOString()
      });

      await dependencies.navigateToKanjiEntry(character);

      return character as unknown as void;
    }
  };
}

/**
 * Creates the Search screen hook view model.
 *
 * @pre The search controller is connected to the offline repository and navigation.
 * @inv The hook keeps input state and visible results synchronized through the controller.
 * @post The returned state reflects the debounced search term, result list, and busy indicator.
 */
export function useSearchScreenViewModel(
  searchController: SearchInterface,
  isEnabled: boolean
): SearchScreenViewModel {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<ReadonlyArray<CharacterSummary>>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    registeredSearchScreenClear = () => {
      try {
        searchController.clearSearch();
      } catch {
        // no-op: the screen can already be empty
      }

      setTerm("");
      setResults([]);
      setIsSearching(false);
    };

    return () => {
      if (registeredSearchScreenClear !== null) {
        registeredSearchScreenClear = null;
      }
    };
  }, [searchController]);

  useEffect(() => {
    if (!isEnabled || !shouldClearSearchScreenOnEnable) {
      return;
    }

    shouldClearSearchScreenOnEnable = false;
    clearRegisteredSearchScreenState();
  }, [isEnabled]);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    const effectiveTerm = term.trim();

    if (effectiveTerm.length === 0) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeout = window.setTimeout(() => {
      void searchController.search(effectiveTerm)
        .then(nextResults => {
          setResults(nextResults);
          setIsSearching(false);
        })
        .catch(() => {
          setResults([]);
          setIsSearching(false);
        });
    }, SEARCH_DELAY_MS);

    return () => window.clearTimeout(timeout);
  }, [isEnabled, searchController, term]);

  return {
    term,
    results,
    isSearching,
    setTerm,
    clear(): void {
      clearRegisteredSearchScreenState();
    },
    openKanjiEntry(character: string): Promise<void> {
      return searchController.openKanjiEntry(character);
    }
  };
}
