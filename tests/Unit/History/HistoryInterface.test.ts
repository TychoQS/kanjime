import { describe, expect, it } from "vitest";

import { CreateHistoryController } from "../../../src/Features/History/CreateHistoryController";
import { createAsyncValueRecorder, createVoidArgumentRecorder } from "../../Support/DependencyFactories";
import { TEST_HISTORY_GROUPS, TEST_PRIMARY_CHARACTER, TEST_TERTIARY_CHARACTER, TEST_TIMESTAMP } from "../../Support/TestData";
import { buildRequirementTitle } from "../../Support/RequirementTest";

describe("HistoryInterface", () => {
  /**
 * Requirement: R15
 * Type: Unit
 * Condition: Invariant
 */
  it(buildRequirementTitle("R15", "Unit", "Invariant", "does not trigger persistence or navigation when retrieving history groups"), async () => {
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

    await controller.getEntriesByCategory();

    expect(persistRecorder.calls).toHaveLength(
      0,
      "HistoryInterface unexpectedly attempted to persist entries while retrieving grouped history."
    );

    expect(navigationRecorder.calls).toHaveLength(
      0,
      "HistoryInterface unexpectedly triggered navigation while retrieving grouped history."
    );
  });

  /**
   * Requirement: R15
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R15", "Unit", "Postcondition", "returns the stored history entries grouped by category"), async () => {
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

    expect(groups).toEqual(
      TEST_HISTORY_GROUPS,
      "HistoryInterface did not return the stored history entries grouped by category."
    );
  });

  /**
 * Requirement: R16
 * Type: Unit
 * Condition: Precondition
 */
  it(buildRequirementTitle("R16", "Unit", "Precondition", "rejects opening a kanji entry when history is empty"), async () => {
    const groupsRecorder = createAsyncValueRecorder([]);
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

    await expect(
      controller.openKanjiEntry(TEST_PRIMARY_CHARACTER),
      "HistoryInterface did not reject opening a history entry when history was empty."
    ).rejects.toThrow();

    expect(navigationRecorder.calls).toHaveLength(
      0,
      "HistoryInterface attempted to navigate to a history entry when no history entries were available."
    );
  });

  /**
   * Requirement: R16
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R16", "Unit", "Precondition", "accepts opening a kanji entry when history is not empty"), async () => {
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

    await expect(controller.openKanjiEntry(TEST_PRIMARY_CHARACTER)).resolves.not.toThrow();
  });

  /**
   * Requirement: R16
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R16", "Unit", "Invariant", "does not modify stored history when opening a kanji entry"), async () => {
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

    expect(persistRecorder.calls).toHaveLength(
      0,
      "HistoryInterface unexpectedly modified stored history when opening a history entry."
    );
  });

  /**
   * Requirement: R16
   * Type: Unit
   * Condition: Postcondition
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

    expect(navigationRecorder.calls).toEqual(
      [TEST_PRIMARY_CHARACTER],
      "HistoryInterface did not open the selected history item."
    );

  });

  /**
 * Requirement: R17
 * Type: Unit
 * Condition: Precondition
 */
  it(buildRequirementTitle("R17", "Unit", "Precondition", "rejects saving a history entry when the character is invalid"), async () => {
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

    await expect(
      controller.saveEntry({
        character: "",
        category: "search",
        createdAt: TEST_TIMESTAMP
      }),
      "HistoryInterface did not reject saving a history entry with an invalid character."
    ).rejects.toThrow();

    expect(persistRecorder.calls).toHaveLength(
      0,
      "HistoryInterface attempted to persist a history entry with an invalid character."
    );
  });

  /**
   * Requirement: R17
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R17", "Unit", "Precondition", "rejects saving a history entry when the category is invalid"), async () => {
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

    await expect(
      controller.saveEntry({
        character: TEST_PRIMARY_CHARACTER,
        category: "invalidCategory" as unknown as "search" | "visitedEntry" | "imageClassification" | "drawingClassification",
        createdAt: TEST_TIMESTAMP
      }),
      "HistoryInterface did not reject saving a history entry with an invalid category."
    ).rejects.toThrow();

    expect(persistRecorder.calls).toHaveLength(
      0,
      "HistoryInterface attempted to persist a history entry with an invalid category."
    );
  });

  /**
   * Requirement: R17
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R17", "Unit", "Precondition", "accepts saving a history entry when parameters are valid"), async () => {
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

    const newEntry = {
      character: "新",
      category: "search" as const,
      createdAt: TEST_TIMESTAMP
    };

    await expect(controller.saveEntry(newEntry)).resolves.not.toThrow();
  });

  /**
   * Requirement: R17
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R17", "Unit", "Invariant", "does not persist duplicated history entries"), async () => {
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

    await expect(
      controller.saveEntry({
        character: TEST_PRIMARY_CHARACTER,
        category: "search",
        createdAt: TEST_TIMESTAMP
      }),
      "HistoryInterface did not reject saving a duplicated history entry."
    ).rejects.toThrow();

    expect(persistRecorder.calls).toHaveLength(
      0,
      "HistoryInterface attempted to persist a duplicated history entry."
    );
  });



  /**
   * Requirement: R17
   * Type: Unit
   * Condition: Postcondition
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

    const newEntry = {
      character: TEST_TERTIARY_CHARACTER,
      category: "search" as const,
      createdAt: TEST_TIMESTAMP
    };

    await controller.saveEntry(newEntry);

    expect(persistRecorder.calls).toEqual(
      [newEntry],
      "HistoryInterface did not persist the new history entry correctly."
    );
  });

  /**
 * Requirement: R18
 * Type: Unit
 * Condition: Invariant
 */
  it(buildRequirementTitle("R18", "Unit", "Invariant", "exposes only the four supported history categories"), async () => {
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

  /**
   * Requirement: R18
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R18", "Unit", "Postcondition", "returns history entries grouped by category"), async () => {
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

    expect(groups).toEqual(
      TEST_HISTORY_GROUPS,
      "HistoryInterface did not return history entries grouped by category."
    );
  });

  /**
   * Requirement: R41
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R41", "Unit", "Precondition", "the user performs an action that generates a new record (search, visit, or classification from image or drawing)"), async () => {
    const controller = CreateHistoryController({
      loadGroups: createAsyncValueRecorder(TEST_HISTORY_GROUPS).handler,
      persistEntry: createVoidArgumentRecorder().handler,
      navigateToKanjiEntry: createVoidArgumentRecorder().handler
    });

    let notificationCount = 0;
    controller.subscribe(() => {
      notificationCount++;
    });

    await controller.getEntriesByCategory();
    expect(notificationCount).toBe(0, "HistoryInterface incorrectly updated the view on a read operation.");

    await controller.openKanjiEntry(TEST_PRIMARY_CHARACTER);
    expect(notificationCount).toBe(0, "HistoryInterface incorrectly updated the view on a read operation.");

    const categories = ["search", "visitedEntry", "imageClassification", "drawingClassification"] as const;

    for (const category of categories) {
      await controller.saveEntry({
        character: `新-${category}`,
        category,
        createdAt: TEST_TIMESTAMP
      });
    }

    expect(notificationCount).toBe(4, "HistoryInterface did not update the view when actions generated new records across all categories.");
  });

  /**
   * Requirement: R41
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R41", "Unit", "Invariant", "the history information is persistent and does not form part of the volatile state"), async () => {
    const persistRecorder = createVoidArgumentRecorder<{ character: string; category: any; createdAt: string }>();
    const controller = CreateHistoryController({
      loadGroups: createAsyncValueRecorder(TEST_HISTORY_GROUPS).handler,
      persistEntry: persistRecorder.handler,
      navigateToKanjiEntry: createVoidArgumentRecorder().handler
    });

    let persistedDuringNotification = 0;

    controller.subscribe(() => {
      persistedDuringNotification = persistRecorder.calls.length;
    });

    const categories = ["search", "visitedEntry", "imageClassification", "drawingClassification"] as const;

    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      await controller.saveEntry({
        character: `新-${category}`,
        category,
        createdAt: TEST_TIMESTAMP
      });

      expect(persistedDuringNotification).toBe(
        i + 1,
        `HistoryInterface notified listeners of an update for category ${category} before or without persisting the data, treating it as volatile state.`
      );
    }
  });

  /**
   * Requirement: R41
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R41", "Unit", "Postcondition", "the history shows the new updated data immediately without having to restart the application"), async () => {
    const controller = CreateHistoryController({
      loadGroups: createAsyncValueRecorder(TEST_HISTORY_GROUPS).handler,
      persistEntry: createVoidArgumentRecorder().handler,
      navigateToKanjiEntry: createVoidArgumentRecorder().handler
    });

    let notificationCount = 0;
    controller.subscribe(() => {
      notificationCount++;
    });

    const categories = ["search", "visitedEntry", "imageClassification", "drawingClassification"] as const;

    for (const category of categories) {
      await controller.saveEntry({
        character: `新-${category}`,
        category,
        createdAt: TEST_TIMESTAMP
      });
    }

    expect(notificationCount).toBe(4, "The history did not trigger immediate updates for all categories.");

    const finalGroups = await controller.getEntriesByCategory();

    for (const category of categories) {
      const group = finalGroups.find(g => g.category === category);
      const containsNewEntry = group?.entries.some(e => e.character === `新-${category}`);
      expect(containsNewEntry).toBe(true, `The history did not contain the updated data for category ${category} immediately after the action.`);
    }
  });
});
