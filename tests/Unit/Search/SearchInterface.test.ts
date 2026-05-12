import { describe, expect, it } from "vitest";

import { CreateSearchController } from "../../../src/Features/Search/CreateSearchController";
import { createAsyncArgumentRecorder, createVoidArgumentRecorder } from "../../Support/DependencyFactories";
import { TEST_PRIMARY_CHARACTER, TEST_SECONDARY_CHARACTER, TEST_TERTIARY_CHARACTER, TEST_SEARCH_READING, TEST_SEARCH_TERM, TEST_SUMMARIES } from "../../Support/TestData";
import { buildRequirementTitle } from "../../Support/RequirementTest";

const mockHistoryRecorder = createVoidArgumentRecorder<{ character: string; category: string; createdAt: string }>();
const mockHistoryController = {
  getEntriesByCategory: async () => [],
  saveEntry: mockHistoryRecorder.handler,
  openKanjiEntry: async () => { },
  subscribe: () => () => { }
};

describe("SearchInterface", () => {
  /**
 * Requirement: R31
 * Type: Unit
 * Condition: Precondition - valid
 */
  it(buildRequirementTitle("R31", "Unit", "Precondition", "accepts a non-empty search term"), async () => {
    const queryRecorder = createAsyncArgumentRecorder<string, typeof TEST_SUMMARIES>(TEST_SUMMARIES);
    const navigationRecorder = createVoidArgumentRecorder<string>();
    const controller = CreateSearchController({
      queryTerm: queryRecorder.handler,
      historyController: mockHistoryController,
      navigateToKanjiEntry: navigationRecorder.handler
    });

    await expect(controller.search(TEST_SEARCH_TERM)).resolves.toBeDefined();
  });

  /**
   * Requirement: R31
   * Type: Unit
   * Condition: Precondition - invalid
   */
  it(buildRequirementTitle("R31", "Unit", "Precondition", "rejects an empty search term"), async () => {
    const queryRecorder = createAsyncArgumentRecorder<string, typeof TEST_SUMMARIES>(TEST_SUMMARIES);
    const navigationRecorder = createVoidArgumentRecorder<string>();
    const controller = CreateSearchController({
      queryTerm: queryRecorder.handler,
      historyController: mockHistoryController,
      navigateToKanjiEntry: navigationRecorder.handler
    });

    const results = await controller.search("");
    const results2 = await controller.search("   ");
    expect(queryRecorder.calls).toHaveLength(0,
      "SearchInterface executed a query for empty terms."
    );
    expect(results).toHaveLength(0,
      "SearchInterface returned results for an empty term."
    );
    expect(results2).toHaveLength(0,
      "SearchInterface returned results for an empty term."
    );
  });

  /**
   * Requirement: R31
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R31", "Unit", "Invariant", "dispatches a query for each valid term change"), async () => {
    const queryRecorder = createAsyncArgumentRecorder<string, typeof TEST_SUMMARIES>(TEST_SUMMARIES);
    const navigationRecorder = createVoidArgumentRecorder<string>();
    const controller = CreateSearchController({
      queryTerm: queryRecorder.handler,
      historyController: mockHistoryController,
      navigateToKanjiEntry: navigationRecorder.handler
    });

    await controller.search(TEST_PRIMARY_CHARACTER);
    await controller.search(TEST_SECONDARY_CHARACTER);
    await controller.search(TEST_TERTIARY_CHARACTER);

    expect(queryRecorder.calls).toEqual([TEST_PRIMARY_CHARACTER, TEST_SECONDARY_CHARACTER, TEST_TERTIARY_CHARACTER],
      "SearchInterface did not dispatch a query for each distinct kanji term change."
    );
  });

  /**
   * Requirement: R31
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R31", "Unit", "Postcondition", "returns results related to the search term"), async () => {
    const queryRecorder = createAsyncArgumentRecorder<string, typeof TEST_SUMMARIES>(TEST_SUMMARIES);
    const navigationRecorder = createVoidArgumentRecorder<string>();
    const controller = CreateSearchController({
      queryTerm: queryRecorder.handler,
      historyController: mockHistoryController,
      navigateToKanjiEntry: navigationRecorder.handler
    });

    const results = await controller.search(TEST_SEARCH_TERM);

    expect(results).toEqual(TEST_SUMMARIES,
      "SearchInterface returned unexpected results for the search term."
    );
  });

  /**
 * Requirement: R32
 * Type: Unit
 * Condition: Precondition - valid
 */
  it(buildRequirementTitle("R32", "Unit", "Precondition", "accepts a non-empty reading term"), async () => {
    const queryRecorder = createAsyncArgumentRecorder<string, typeof TEST_SUMMARIES>(TEST_SUMMARIES);
    const navigationRecorder = createVoidArgumentRecorder<string>();
    const controller = CreateSearchController({
      queryTerm: queryRecorder.handler,
      historyController: mockHistoryController,
      navigateToKanjiEntry: navigationRecorder.handler
    });

    await expect(controller.search(TEST_SEARCH_READING)).resolves.toBeDefined();
  });

  /**
   * Requirement: R32
   * Type: Unit
   * Condition: Precondition - invalid
   */
  it(buildRequirementTitle("R32", "Unit", "Precondition", "rejects an empty reading term"), async () => {
    const queryRecorder = createAsyncArgumentRecorder<string, typeof TEST_SUMMARIES>(TEST_SUMMARIES);
    const navigationRecorder = createVoidArgumentRecorder<string>();
    const controller = CreateSearchController({
      queryTerm: queryRecorder.handler,
      historyController: mockHistoryController,
      navigateToKanjiEntry: navigationRecorder.handler
    });

    const results = await controller.search("");
    const results2 = await controller.search("   ");

    expect(queryRecorder.calls).toHaveLength(0,
      "SearchInterface executed a query for empty reading terms."
    );
    expect(results).toHaveLength(0,
      "SearchInterface returned results for an empty reading term."
    );
    expect(results2).toHaveLength(0,
      "SearchInterface returned results for an empty term."
    );
  });

  /**
   * Requirement: R32
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R32", "Unit", "Invariant", "dispatches a query for each distinct reading term"), async () => {
    const queryRecorder = createAsyncArgumentRecorder<string, typeof TEST_SUMMARIES>(TEST_SUMMARIES);
    const navigationRecorder = createVoidArgumentRecorder<string>();
    const controller = CreateSearchController({
      queryTerm: queryRecorder.handler,
      historyController: mockHistoryController,
      navigateToKanjiEntry: navigationRecorder.handler
    });
    const NI = "ni"
    const NICH = "nich"
    await controller.search(NI);
    await controller.search(NICH);
    await controller.search(TEST_SEARCH_READING);
    expect(queryRecorder.calls).toEqual([NI, NICH, TEST_SEARCH_READING],
      "SearchInterface did not dispatch a query for each distinct reading term change."
    );
  });

  /**
   * Requirement: R32
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R32", "Unit", "Postcondition", "returns results related to the reading term"), async () => {
    const queryRecorder = createAsyncArgumentRecorder<string, typeof TEST_SUMMARIES>(TEST_SUMMARIES);
    const navigationRecorder = createVoidArgumentRecorder<string>();
    const controller = CreateSearchController({
      queryTerm: queryRecorder.handler,
      historyController: mockHistoryController,
      navigateToKanjiEntry: navigationRecorder.handler
    });

    const results = await controller.search(TEST_SEARCH_READING);

    expect(results).toEqual(TEST_SUMMARIES,
      "SearchInterface returned unexpected results for the reading term."
    );
  });

  /**
 * Requirement: R33
 * Type: Unit
 * Condition: Precondition
 */
  it(buildRequirementTitle("R33", "Unit", "Precondition", "fails when attempting to clear an already empty search bar"), async () => {
    const controller = CreateSearchController({
      queryTerm: () => Promise.resolve([]),
      historyController: mockHistoryController,
      navigateToKanjiEntry: async () => { }
    });

    await expect(controller.clearSearch()).rejects.toThrow("SearchInterface cannot clear an empty search bar.");
  });

  /**
   * Requirement: R33
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R33", "Unit", "Invariant", "does not execute a query during clear"), async () => {
    const queryRecorder = createAsyncArgumentRecorder<string, typeof TEST_SUMMARIES>(TEST_SUMMARIES);
    const navigationRecorder = createVoidArgumentRecorder<string>();
    const controller = CreateSearchController({
      queryTerm: queryRecorder.handler,
      historyController: mockHistoryController,
      navigateToKanjiEntry: navigationRecorder.handler
    });

    await controller.search(TEST_SEARCH_TERM);
    controller.clearSearch();

    expect(queryRecorder.calls).toHaveLength(1,
      "SearchInterface executed a query during the clear operation."
    );
  });

  /**
   * Requirement: R33
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R33", "Unit", "Postcondition", "resets the search state after clearing"), async () => {
    const queryRecorder = createAsyncArgumentRecorder<string, typeof TEST_SUMMARIES>(TEST_SUMMARIES);
    const navigationRecorder = createVoidArgumentRecorder<string>();
    const controller = CreateSearchController({
      queryTerm: queryRecorder.handler,
      historyController: mockHistoryController,
      navigateToKanjiEntry: navigationRecorder.handler
    });

    await controller.search(TEST_SEARCH_TERM);
    controller.clearSearch();
    await controller.search(TEST_SEARCH_TERM);

    expect(queryRecorder.calls).toHaveLength(2,
      "SearchInterface did not reset the search state after clearing."
    );
  });

  /**
 * Requirement: R34
 * Type: Unit
 * Condition: Precondition - valid
 */
  it(buildRequirementTitle("R34", "Unit", "Precondition", "accepts a non-empty character to open"), async () => {
    const queryRecorder = createAsyncArgumentRecorder<string, typeof TEST_SUMMARIES>(TEST_SUMMARIES);
    const navigationRecorder = createVoidArgumentRecorder<string>();
    const controller = CreateSearchController({
      queryTerm: queryRecorder.handler,
      historyController: mockHistoryController,
      navigateToKanjiEntry: navigationRecorder.handler
    });

    await expect(controller.openKanjiEntry(TEST_PRIMARY_CHARACTER)).resolves.toBeDefined();
  });

  /**
   * Requirement: R34
   * Type: Unit
   * Condition: Precondition - invalid
   */
  it(buildRequirementTitle("R34", "Unit", "Precondition", "rejects an empty character"), async () => {
    const queryRecorder = createAsyncArgumentRecorder<string, typeof TEST_SUMMARIES>(TEST_SUMMARIES);
    const navigationRecorder = createVoidArgumentRecorder<string>();
    const controller = CreateSearchController({
      queryTerm: queryRecorder.handler,
      historyController: mockHistoryController,
      navigateToKanjiEntry: navigationRecorder.handler
    });

    await expect(controller.openKanjiEntry("")).rejects.toThrow(
      "SearchInterface accepted an empty character to open."
    );
  });

  /**
   * Requirement: R34
   * Type: Unit
   * Condition: Precondition - invalid
   */
  it(buildRequirementTitle("R34", "Unit", "Precondition", "fails to open kanji if results list is empty"), async () => {
    const controller = CreateSearchController({
      queryTerm: () => Promise.resolve([]),
      historyController: mockHistoryController,
      navigateToKanjiEntry: async () => { }
    });
    await expect(controller.openKanjiEntry(TEST_PRIMARY_CHARACTER)).rejects.toThrow(
      "SearchInterface cannot open entry because no results are available."
    );
  });

  /**
   * Requirement: R34
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R34", "Unit", "Invariant", "does not modify the results list when opening an entry"), async () => {
    const queryRecorder = createAsyncArgumentRecorder<string, typeof TEST_SUMMARIES>(TEST_SUMMARIES);
    const navigationRecorder = createVoidArgumentRecorder<string>();
    const controller = CreateSearchController({
      queryTerm: queryRecorder.handler,
      historyController: mockHistoryController,
      navigateToKanjiEntry: navigationRecorder.handler
    });

    await controller.search(TEST_SEARCH_TERM);
    await controller.openKanjiEntry(TEST_PRIMARY_CHARACTER);

    expect(queryRecorder.calls).toHaveLength(1,
      "SearchInterface executed a query when opening a kanji entry."
    );
  });

  /**
   * Requirement: R34
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R34", "Unit", "Postcondition", "navigates to the selected kanji entry"), async () => {
    const queryRecorder = createAsyncArgumentRecorder<string, typeof TEST_SUMMARIES>(TEST_SUMMARIES);
    const navigationRecorder = createVoidArgumentRecorder<string>();
    const controller = CreateSearchController({
      queryTerm: queryRecorder.handler,
      historyController: mockHistoryController,
      navigateToKanjiEntry: navigationRecorder.handler
    });

    await controller.openKanjiEntry(TEST_PRIMARY_CHARACTER);

    expect(navigationRecorder.calls).toEqual([TEST_PRIMARY_CHARACTER],
      "SearchInterface did not navigate to the selected kanji entry."
    );
  });

  /**
 * Requirement: R35
 * Type: Unit
 * Condition: Precondition - valid
 */
  it(buildRequirementTitle("R35", "Unit", "Precondition", "accepts a non-empty term for preview"), async () => {
    const queryRecorder = createAsyncArgumentRecorder<string, typeof TEST_SUMMARIES>(TEST_SUMMARIES);
    const navigationRecorder = createVoidArgumentRecorder<string>();
    const controller = CreateSearchController({
      queryTerm: queryRecorder.handler,
      historyController: mockHistoryController,
      navigateToKanjiEntry: navigationRecorder.handler
    });

    await expect(controller.search(TEST_SEARCH_TERM)).resolves.toBeDefined();
  });

  /**
   * Requirement: R35
   * Type: Unit
   * Condition: Precondition - invalid
   */
  it(buildRequirementTitle("R35", "Unit", "Precondition", "rejects an empty term for preview"), async () => {
    const queryRecorder = createAsyncArgumentRecorder<string, typeof TEST_SUMMARIES>(TEST_SUMMARIES);
    const navigationRecorder = createVoidArgumentRecorder<string>();
    const controller = CreateSearchController({
      queryTerm: queryRecorder.handler,
      historyController: mockHistoryController,
      navigateToKanjiEntry: navigationRecorder.handler
    });

    const results = await controller.search("");

    expect(queryRecorder.calls).toHaveLength(0,
      "SearchInterface executed a query for an empty preview term."
    );
    expect(results).toHaveLength(0,
      "SearchInterface returned preview results for an empty term."
    );
  });

  /**
   * Requirement: R35
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R35", "Unit", "Invariant", "does not repeat a query for the same term"), async () => {
    const queryRecorder = createAsyncArgumentRecorder<string, typeof TEST_SUMMARIES>(TEST_SUMMARIES);
    const navigationRecorder = createVoidArgumentRecorder<string>();
    const controller = CreateSearchController({
      queryTerm: queryRecorder.handler,
      historyController: mockHistoryController,
      navigateToKanjiEntry: navigationRecorder.handler
    });

    await controller.search(TEST_SEARCH_TERM);
    await controller.search(TEST_SEARCH_TERM);

    expect(queryRecorder.calls).toHaveLength(1,
      "SearchInterface queried the same effective term more than once."
    );
  });

  /**
   * Requirement: R35
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R35", "Unit", "Postcondition", "returns preview data for each result"), async () => {
    const queryRecorder = createAsyncArgumentRecorder<string, typeof TEST_SUMMARIES>(TEST_SUMMARIES);
    const navigationRecorder = createVoidArgumentRecorder<string>();
    const controller = CreateSearchController({
      queryTerm: queryRecorder.handler,
      historyController: mockHistoryController,
      navigateToKanjiEntry: navigationRecorder.handler
    });

    const results = await controller.search(TEST_SEARCH_TERM);

    expect(results).toEqual(TEST_SUMMARIES,
      "SearchInterface did not return preview data for the search results."
    );
  });
});
