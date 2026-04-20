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
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("CHECK-HISTORY", "Integration", "Postcondition", "loads and renders the persisted history"), async () => {
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

    const groups = await history.getEntriesByCategory();

    renderWithIonic(
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
    );

    expect(groupsRecorder.calls.length).toBeGreaterThan(0, "History integration never queried the persisted groups.");
    expect(groups).toEqual(TEST_HISTORY_GROUPS, "History integration returned unexpected grouped entries.");
    expect(screen.getByText(TEST_HISTORY_GROUPS[0].entries[0].character)).toBeInTheDocument();
  });
});
