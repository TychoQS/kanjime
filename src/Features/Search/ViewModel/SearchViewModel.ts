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

export function clearRegisteredSearchScreenState(): void {
  registeredSearchScreenClear?.();
}

export function markRegisteredSearchScreenForReset(): void {
  shouldClearSearchScreenOnEnable = true;
}


function copySummaries(results: ReadonlyArray<CharacterSummary>): ReadonlyArray<CharacterSummary> {
  return results.map(result => ({
    character: result.character,
    primaryReadings: [...result.primaryReadings],
    levels: [...result.levels]
  }));
}

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
