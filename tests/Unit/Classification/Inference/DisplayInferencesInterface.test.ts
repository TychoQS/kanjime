import { describe, expect, it } from "vitest";

import { CreateDisplayInferencesController } from "../../../../src/Features/Classification/Inference/CreateDisplayInferencesController";
import { createVoidArgumentRecorder, createVoidTupleRecorder } from "../../../Support/DependencyFactories";
import { TEST_PRIMARY_CHARACTER, TEST_PREDICTIONS, TEST_SUMMARIES } from "../../../Support/TestData";
import { buildRequirementTitle } from "../../../Support/RequirementTest";

describe("DisplayInferencesInterface", () => {
  /**
   * Requirement: R8
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R8", "Unit", "Postcondition", "updates results once per image source"), () => {
    const navigationRecorder = createVoidArgumentRecorder<string>();
    const historyRecorder = createVoidTupleRecorder<[string, "search" | "visitedEntry" | "imageClassification" | "drawingClassification"]>();
    const controller = CreateDisplayInferencesController({
      navigateToKanjiEntry: navigationRecorder.handler,
      saveHistoryEntry: historyRecorder.handler
    });

    controller.updateResultsFromImageSource("image-1", TEST_PREDICTIONS);

    expect(controller.getVisibleResults()).toEqual(TEST_SUMMARIES, "DisplayInferencesInterface did not expose the image results.");
  });

  /**
   * Requirement: R9
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R9", "Unit", "Postcondition", "refreshes drawing suggestions after each inference"), () => {
    const navigationRecorder = createVoidArgumentRecorder<string>();
    const historyRecorder = createVoidTupleRecorder<[string, "search" | "visitedEntry" | "imageClassification" | "drawingClassification"]>();
    const controller = CreateDisplayInferencesController({
      navigateToKanjiEntry: navigationRecorder.handler,
      saveHistoryEntry: historyRecorder.handler
    });

    controller.updateResultsFromDrawingInference(TEST_PREDICTIONS);

    expect(controller.getVisibleResults().length).toBeGreaterThan(0, "DisplayInferencesInterface did not refresh the drawing list.");
    expect(controller.getVisibleResults().length).toBeLessThanOrEqual(5, "DisplayInferencesInterface exceeded the drawing result limit.");
  });

  /**
   * Requirement: R10
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R10", "Unit", "Invariant", "returns ordered visible predictions without confidences"), () => {
    const navigationRecorder = createVoidArgumentRecorder<string>();
    const historyRecorder = createVoidTupleRecorder<[string, "search" | "visitedEntry" | "imageClassification" | "drawingClassification"]>();
    const controller = CreateDisplayInferencesController({
      navigateToKanjiEntry: navigationRecorder.handler,
      saveHistoryEntry: historyRecorder.handler
    });

    controller.updateResultsFromDrawingInference(TEST_PREDICTIONS);
    const results = controller.getVisibleResults();

    expect(results).toHaveLength(3);
    expect(results[0]?.character).toBe(TEST_PRIMARY_CHARACTER, "DisplayInferencesInterface returned an unexpected first candidate.");
  });

  /**
   * Requirement: R11
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R11", "Unit", "Postcondition", "opens the selected kanji entry without mutating results"), async () => {
    const navigationRecorder = createVoidArgumentRecorder<string>();
    const historyRecorder = createVoidTupleRecorder<[string, "search" | "visitedEntry" | "imageClassification" | "drawingClassification"]>();
    const controller = CreateDisplayInferencesController({
      navigateToKanjiEntry: navigationRecorder.handler,
      saveHistoryEntry: historyRecorder.handler
    });

    controller.updateResultsFromDrawingInference(TEST_PREDICTIONS);
    await controller.openKanjiEntry(TEST_PRIMARY_CHARACTER);

    expect(navigationRecorder.calls).toEqual([TEST_PRIMARY_CHARACTER], "DisplayInferencesInterface did not navigate to the selected kanji.");
    expect(historyRecorder.calls).toHaveLength(1, "DisplayInferencesInterface did not record the opened result in history.");
    expect(controller.getVisibleResults()).toEqual(TEST_SUMMARIES, "DisplayInferencesInterface changed the visible list after navigation.");
  });
});
