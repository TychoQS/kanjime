import { describe, expect, it } from "vitest";

import { CreateSearchController } from "../../../src/Features/Search/CreateSearchController";
import { createAsyncArgumentRecorder, createVoidArgumentRecorder } from "../../Support/DependencyFactories";
import { TEST_PRIMARY_CHARACTER, TEST_SEARCH_READING, TEST_SEARCH_TERM, TEST_SUMMARIES } from "../../Support/TestData";
import { buildRequirementTitle } from "../../Support/RequirementTest";

describe("SearchInterface", () => {
  /**
   * Requirement: R31
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R31", "Unit", "Postcondition", "searches by kanji character"), async () => {
    const queryRecorder = createAsyncArgumentRecorder<string, typeof TEST_SUMMARIES>(TEST_SUMMARIES);
    const navigationRecorder = createVoidArgumentRecorder<string>();
    const controller = CreateSearchController({
      queryTerm: queryRecorder.handler,
      navigateToKanjiEntry: navigationRecorder.handler
    });

    const results = await controller.search(TEST_SEARCH_TERM);

    expect(queryRecorder.calls).toEqual([TEST_SEARCH_TERM], "SearchInterface did not query the kanji term.");
    expect(results).toEqual(TEST_SUMMARIES, "SearchInterface returned unexpected kanji search results.");
  });

  /**
   * Requirement: R32
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R32", "Unit", "Postcondition", "searches by reading"), async () => {
    const queryRecorder = createAsyncArgumentRecorder<string, typeof TEST_SUMMARIES>(TEST_SUMMARIES);
    const navigationRecorder = createVoidArgumentRecorder<string>();
    const controller = CreateSearchController({
      queryTerm: queryRecorder.handler,
      navigateToKanjiEntry: navigationRecorder.handler
    });

    const results = await controller.search(TEST_SEARCH_READING);

    expect(queryRecorder.calls).toEqual([TEST_SEARCH_READING], "SearchInterface did not query the reading term.");
    expect(results).toEqual(TEST_SUMMARIES, "SearchInterface returned unexpected reading search results.");
  });

  /**
   * Requirement: R33
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R33", "Unit", "Postcondition", "clears the current search input and results"), async () => {
    const queryRecorder = createAsyncArgumentRecorder<string, typeof TEST_SUMMARIES>(TEST_SUMMARIES);
    const navigationRecorder = createVoidArgumentRecorder<string>();
    const controller = CreateSearchController({
      queryTerm: queryRecorder.handler,
      navigateToKanjiEntry: navigationRecorder.handler
    });

    await controller.search(TEST_SEARCH_TERM);
    controller.clearSearch();

    expect(queryRecorder.calls).toEqual([TEST_SEARCH_TERM], "SearchInterface performed an unexpected query sequence.");
    expect(await controller.search(TEST_SEARCH_TERM)).toHaveLength(0);
  });

  /**
   * Requirement: R34
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R34", "Unit", "Postcondition", "opens the selected kanji from the search results"), async () => {
    const queryRecorder = createAsyncArgumentRecorder<string, typeof TEST_SUMMARIES>(TEST_SUMMARIES);
    const navigationRecorder = createVoidArgumentRecorder<string>();
    const controller = CreateSearchController({
      queryTerm: queryRecorder.handler,
      navigateToKanjiEntry: navigationRecorder.handler
    });

    await controller.openKanjiEntry(TEST_PRIMARY_CHARACTER);

    expect(navigationRecorder.calls).toEqual([TEST_PRIMARY_CHARACTER], "SearchInterface did not open the selected search result.");
  });

  /**
   * Requirement: R35 / R3
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R35", "Unit", "Invariant", "updates previews once per effective non-empty term"), async () => {
    const queryRecorder = createAsyncArgumentRecorder<string, typeof TEST_SUMMARIES>(TEST_SUMMARIES);
    const navigationRecorder = createVoidArgumentRecorder<string>();
    const controller = CreateSearchController({
      queryTerm: queryRecorder.handler,
      navigateToKanjiEntry: navigationRecorder.handler
    });

    const firstResults = await controller.search(TEST_SEARCH_TERM);
    const secondResults = await controller.search(TEST_SEARCH_TERM);

    expect(queryRecorder.calls).toHaveLength(1, "SearchInterface queried the same effective term more than once.");
    expect(firstResults).toEqual(TEST_SUMMARIES, "SearchInterface did not expose the first preview set.");
    expect(secondResults).toEqual(TEST_SUMMARIES, "SearchInterface did not keep the expected preview payload.");
  });
});
