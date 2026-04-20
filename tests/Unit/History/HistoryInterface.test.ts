import { describe, expect, it } from "vitest";

import { CreateHistoryController } from "../../../src/Features/History/CreateHistoryController";
import { createAsyncValueRecorder, createVoidArgumentRecorder } from "../../Support/DependencyFactories";
import { TEST_HISTORY_GROUPS, TEST_PRIMARY_CHARACTER, TEST_TIMESTAMP } from "../../Support/TestData";
import { buildRequirementTitle } from "../../Support/RequirementTest";

describe("HistoryInterface", () => {
  /**
   * Requirement: R15
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R15", "Unit", "Postcondition", "loads persistent history grouped by category"), async () => {
    const groupsRecorder = createAsyncValueRecorder(TEST_HISTORY_GROUPS);
    const persistRecorder = createVoidArgumentRecorder<{
      character: string;
      category: "search" | "visitedEntry" | "imageClassification" | "drawingClassification";
      createdAt: string;
    }>();
    const navigationRecorder = createVoidArgumentRecorder<string>();
    const controller = CreateHistoryController({
      loadGroups: groupsRecorder.handler,
      persistEntry: persistRecorder.handler,
      navigateToKanjiEntry: navigationRecorder.handler
    });

    const groups = await controller.getEntriesByCategory();

    expect(groupsRecorder.calls.length).toBeGreaterThan(0, "HistoryInterface never queried the persistent history.");
    expect(groups).toEqual(TEST_HISTORY_GROUPS, "HistoryInterface returned unexpected history groups.");
  });

  /**
   * Requirement: R16
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R16", "Unit", "Postcondition", "opens a kanji entry from history"), async () => {
    const groupsRecorder = createAsyncValueRecorder(TEST_HISTORY_GROUPS);
    const persistRecorder = createVoidArgumentRecorder<{
      character: string;
      category: "search" | "visitedEntry" | "imageClassification" | "drawingClassification";
      createdAt: string;
    }>();
    const navigationRecorder = createVoidArgumentRecorder<string>();
    const controller = CreateHistoryController({
      loadGroups: groupsRecorder.handler,
      persistEntry: persistRecorder.handler,
      navigateToKanjiEntry: navigationRecorder.handler
    });

    await controller.openKanjiEntry(TEST_PRIMARY_CHARACTER);

    expect(navigationRecorder.calls).toEqual([TEST_PRIMARY_CHARACTER], "HistoryInterface did not open the selected history item.");
  });

  /**
   * Requirement: R17
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R17", "Unit", "Postcondition", "stores a new persistent history entry"), async () => {
    const groupsRecorder = createAsyncValueRecorder(TEST_HISTORY_GROUPS);
    const persistRecorder = createVoidArgumentRecorder<{
      character: string;
      category: "search" | "visitedEntry" | "imageClassification" | "drawingClassification";
      createdAt: string;
    }>();
    const navigationRecorder = createVoidArgumentRecorder<string>();
    const controller = CreateHistoryController({
      loadGroups: groupsRecorder.handler,
      persistEntry: persistRecorder.handler,
      navigateToKanjiEntry: navigationRecorder.handler
    });

    await controller.saveEntry({
      character: TEST_PRIMARY_CHARACTER,
      category: "search",
      createdAt: TEST_TIMESTAMP
    });

    expect(persistRecorder.calls).toHaveLength(1, "HistoryInterface did not persist the new history entry.");
  });

  /**
   * Requirement: R18
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R18", "Unit", "Invariant", "exposes the four supported history categories"), async () => {
    const groupsRecorder = createAsyncValueRecorder(TEST_HISTORY_GROUPS);
    const persistRecorder = createVoidArgumentRecorder<{
      character: string;
      category: "search" | "visitedEntry" | "imageClassification" | "drawingClassification";
      createdAt: string;
    }>();
    const navigationRecorder = createVoidArgumentRecorder<string>();
    const controller = CreateHistoryController({
      loadGroups: groupsRecorder.handler,
      persistEntry: persistRecorder.handler,
      navigateToKanjiEntry: navigationRecorder.handler
    });

    const groups = await controller.getEntriesByCategory();

    expect(groups.map((group) => group.category)).toEqual(
      ["search", "visitedEntry", "imageClassification", "drawingClassification"],
      "HistoryInterface returned unexpected history categories."
    );
  });
});
