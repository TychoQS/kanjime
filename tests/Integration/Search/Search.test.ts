import { describe, expect, it } from "vitest";

import { CreateSearchController } from "../../../src/Features/Search/CreateSearchController";
import { createAsyncArgumentRecorder, createVoidArgumentRecorder } from "../../Support/DependencyFactories";
import { TEST_SEARCH_TERM, TEST_SUMMARIES } from "../../Support/TestData";
import { buildRequirementTitle } from "../../Support/RequirementTest";

describe("SEARCH", () => {
  /**
   * Requirement: SEARCH
   * Type: Integration
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("SEARCH", "Integration", "Postcondition", "queries the repository and updates the visible results"), async () => {
    const queryRecorder = createAsyncArgumentRecorder<string, typeof TEST_SUMMARIES>(TEST_SUMMARIES);
    const navigationRecorder = createVoidArgumentRecorder<string>();
    const search = CreateSearchController({
      queryTerm: queryRecorder.handler,
      navigateToKanjiEntry: navigationRecorder.handler
    });

    const results = await search.search(TEST_SEARCH_TERM);
    await search.search(TEST_SEARCH_TERM);

    expect(queryRecorder.calls).toEqual([TEST_SEARCH_TERM], "Search integration executed an unexpected query sequence.");
    expect(results).toEqual(TEST_SUMMARIES, "Search integration did not expose the query results.");
  });
});
