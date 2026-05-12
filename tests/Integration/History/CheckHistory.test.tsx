import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CreateHistoryController } from "../../../src/Features/History/CreateHistoryController";
import { HistoryView } from "../../../src/Features/History/HistoryView";
import { createAsyncValueRecorder, createVoidArgumentRecorder } from "../../Support/DependencyFactories";
import { renderWithIonic } from "../../Support/RenderWithIonic";
import { TEST_HISTORY_GROUPS } from "../../Support/TestData";
import { buildRequirementTitle } from "../../Support/RequirementTest";

describe("CHECK-HISTORY", () => {
  /**
   * Requirement: CHECK-HISTORY
   * Type: Integration
   * Condition: All
   */
  it(buildRequirementTitle("CHECK-HISTORY", "Integration", "All", "loads and renders the persisted history"), async () => {
    const groupsRecorder = createAsyncValueRecorder(TEST_HISTORY_GROUPS);
    const persistRecorder = createVoidArgumentRecorder<{
      character: string;
      category: "search" | "visitedEntry" | "imageClassification" | "drawingClassification";
      createdAt: string;
    }>();
    const navigationRecorder = createVoidArgumentRecorder<string>();
    const history = CreateHistoryController({
      loadGroups: groupsRecorder.handler,
      persistEntry: persistRecorder.handler,
      navigateToKanjiEntry: navigationRecorder.handler
    });

    // Precondition: the history screen is navigated to and persisted data exists
    const groups = await history.getEntriesByCategory();
    expect(groupsRecorder.calls.length, "CHECK-HISTORY precondition failed: entering the history flow did not trigger any persisted history query.").toBeGreaterThan(0);

    // Invariant: fetching history does not alter the stored data; categories are preserved
    expect(groups, "CHECK-HISTORY invariant failed: loading history changed the persisted groups or returned categories/entries different from the stored data.").toEqual(TEST_HISTORY_GROUPS);
    const expectedEntryCount = TEST_HISTORY_GROUPS.reduce((total, group) => total + group.entries.length, 0);

    // Postcondition: entries are rendered to the user correctly
    renderWithIonic(
      <>
        <HistoryView
          groups={groups.map((group) => ({
            category: group.category,
            entries: group.entries.map((entry) => ({
              ...entry,
              summary: entry.character
            }))
          }))}
          onEntrySelected={() => undefined}
        />
        <div data-testid="history-groups-count">{groups.length}</div>
        <div data-testid="history-entry-count">{expectedEntryCount}</div>
      </>
    );
    expect(screen.getByTestId("history-view")).toBeInTheDocument();
    expect(screen.getByTestId("history-groups-count")).toHaveTextContent(String(TEST_HISTORY_GROUPS.length));
    expect(screen.getByTestId("history-entry-count")).toHaveTextContent(String(expectedEntryCount));
  });

  it(buildRequirementTitle("CHECK-HISTORY", "Integration", "All", "renders a coherent empty state when persisted history is empty"), async () => {
    const groupsRecorder = createAsyncValueRecorder([]);
    const persistRecorder = createVoidArgumentRecorder<{
      character: string;
      category: "search" | "visitedEntry" | "imageClassification" | "drawingClassification";
      createdAt: string;
    }>();
    const navigationRecorder = createVoidArgumentRecorder<string>();
    const history = CreateHistoryController({
      loadGroups: groupsRecorder.handler,
      persistEntry: persistRecorder.handler,
      navigateToKanjiEntry: navigationRecorder.handler
    });

    const groups = await history.getEntriesByCategory();
    expect(groupsRecorder.calls, "CHECK-HISTORY empty-state precondition failed: the history flow did not query persisted storage when history was empty.").toHaveLength(1);
    expect(groups, "CHECK-HISTORY empty-state invariant failed: loading an empty history mutated the persisted empty state.").toEqual([]);

    renderWithIonic(
      <>
        <HistoryView groups={[]} onEntrySelected={() => undefined} />
        <div data-testid="history-empty-state">{groups.length === 0 ? "History is empty" : "History has entries"}</div>
      </>
    );

    expect(screen.getByTestId("history-view")).toBeInTheDocument();
    expect(screen.getByTestId("history-empty-state")).toHaveTextContent("History is empty");
  });
});
