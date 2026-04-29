import type { SearchInterface } from "../Contracts/SearchInterface";
import type { CreateSearchControllerDependencies } from "../CreateSearchController";
import type { CharacterSummary } from "../../../Shared/DomainTypes";

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
          new Error("SearchInterface cannot clear an empty search bar.")
        ) as unknown as void;
      }

      currentTerm = "";
      visibleResults = [];
    },
    async openKanjiEntry(character: string): Promise<void> {
      if (character.trim().length === 0) {
        throw new Error("SearchInterface accepted an empty character to open.");
      }

      if (visibleResults.length === 0) {
        visibleResults = copySummaries(await dependencies.queryTerm(character));
      }

      if (visibleResults.length === 0) {
        throw new Error("SearchInterface cannot open entry because no results are available.");
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
