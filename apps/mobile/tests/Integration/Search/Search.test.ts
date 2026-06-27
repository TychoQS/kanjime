import { createElement, Fragment } from "react";
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CreateSearchController } from "../../../src/Features/Search/CreateSearchController";
import { SearchResultView } from "../../../src/Features/Search/SearchResultView";
import { createVoidArgumentRecorder } from "../../Support/DependencyFactories";
import { renderWithIonic } from "../../Support/RenderWithIonic";
import { TEST_OTHER_PREDICTIONS, TEST_SEARCH_READING, TEST_SEARCH_TERM, TEST_SUMMARIES } from "../../Support/TestData";
import { buildRequirementTitle } from "../../Support/RequirementTest";

function renderSearchHarness(
  results: ReadonlyArray<{
    character: string;
    primaryReadings: ReadonlyArray<string>;
    levels: ReadonlyArray<string>;
  }>
) {
  return createElement(
    Fragment,
    null,
    ...results.map((summary) => createElement(SearchResultView, {
      key: summary.character,
      character: summary.character,
      mainReadings: summary.primaryReadings,
      levels: summary.levels,
      onSelected: () => undefined
    })),
    createElement("div", { "data-testid": "search-results-count" }, String(results.length))
  );
}

describe("SEARCH", () => {
  /**
   * Requirement: SEARCH
   * Type: Integration
   * Condition: All
   */
  it(buildRequirementTitle("SEARCH", "Integration", "All", "queries the repository and updates the visible results"), async () => {
    const queryRecorder = {
      calls: [] as string[],
      async handler(term: string) {
        queryRecorder.calls.push(term);
        if (term === TEST_SEARCH_TERM) {
          return TEST_SUMMARIES;
        }

        if (term === TEST_SEARCH_READING) {
          return TEST_OTHER_PREDICTIONS.map((prediction) => ({
            character: prediction.character,
            primaryReadings: ["reading"],
            levels: ["JLPT N4"]
          }));
        }

        return [];
      }
    };
    const navigationRecorder = createVoidArgumentRecorder<string>();
    const historyRecorder = createVoidArgumentRecorder<{
      character: string;
      category: "search" | "visitedEntry" | "imageClassification" | "drawingClassification";
      createdAt: string;
    }>();
    const mockHistoryController = {
      getEntriesByCategory: async () => [],
      saveEntry: historyRecorder.handler,
      openKanjiEntry: async () => undefined,
      subscribe: () => () => { }
    };
    const search = CreateSearchController({
      queryTerm: queryRecorder.handler,
      historyController: mockHistoryController,
      navigateToKanjiEntry: navigationRecorder.handler
    });

    // Precondition: search term is valid and non-empty
    const initialResults = await search.search(TEST_SEARCH_TERM);
    const { rerender } = renderWithIonic(renderSearchHarness(initialResults));
    expect(screen.getByTestId("search-results-count"), "SEARCH precondition failed: a valid non-empty term did not produce a visible results count.").toHaveTextContent(
      String(initialResults.length)
    );

    // Postcondition: new search term is recorded in history
    expect(historyRecorder.calls, "SEARCH postcondition failed: new search term was not recorded in history.").toHaveLength(1);
    expect(historyRecorder.calls[0], "SEARCH postcondition failed: search term not recorded correctly.").toEqual({
      character: TEST_SEARCH_TERM,
      category: "search",
      createdAt: expect.any(String)
    });

    // Invariant: no new query is executed when the same term is repeated
    await search.search(TEST_SEARCH_TERM);
    expect(queryRecorder.calls, "SEARCH invariant failed: repeating the same term should not issue an additional query.").toEqual([TEST_SEARCH_TERM]);
    expect(historyRecorder.calls, "SEARCH invariant failed: repeating the same term should not add duplicate to history.").toHaveLength(1);

    // Postcondition: a new effective term replaces the previous visible results
    const updatedResults = await search.search(TEST_SEARCH_READING);
    rerender(renderSearchHarness(updatedResults));

    expect(queryRecorder.calls, "SEARCH invariant failed: each effective term change must issue exactly one query, and stale duplicate queries must be avoided.").toEqual([TEST_SEARCH_TERM, TEST_SEARCH_READING]);
    expect(updatedResults, "SEARCH postcondition failed: changing the term did not replace the previous results set.").not.toEqual(initialResults);
    expect(screen.getByTestId("search-results-count")).toHaveTextContent(String(updatedResults.length));

    // Postcondition: new search term is recorded in history
    expect(historyRecorder.calls, "SEARCH postcondition failed: new search term was not recorded in history.").toHaveLength(2);
    expect(historyRecorder.calls[1], "SEARCH postcondition failed: new search term not recorded correctly.").toEqual({
      character: TEST_SEARCH_READING,
      category: "search",
      createdAt: expect.any(String)
    });

    // Postcondition: selecting a kanji entry records it in history as visitedEntry
    const character = updatedResults[0].character;
    await search.openKanjiEntry(character);
    const historyEntry = historyRecorder.calls[historyRecorder.calls.length - 1];
    expect(historyEntry, "SEARCH postcondition failed: opening entry did not record in history.").toEqual({
      character,
      category: "visitedEntry",
      createdAt: expect.any(String)
    });
  });
});
