import { describe, expect, it } from "vitest";

import { CreateDisplayInferencesController } from "../../../../src/Features/Classification/Inference/CreateDisplayInferencesController";
import { createVoidArgumentRecorder, createVoidTupleRecorder } from "../../../Support/DependencyFactories";
import { TEST_PRIMARY_CHARACTER, TEST_SECONDARY_CHARACTER, TEST_TERTIARY_CHARACTER, TEST_PREDICTIONS, TEST_OTHER_PREDICTIONS, TEST_SUMMARIES, TEST_EXTENDED_PREDICTIONS } from "../../../Support/TestData";
import { buildRequirementTitle } from "../../../Support/RequirementTest";

describe("DisplayInferencesInterface", () => {
  /**
   * Requirement: R8
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R8", "Unit", "Precondition", "rejects an invalid image source or empty predictions"), () => {
    const navigationRecorder = createVoidArgumentRecorder<string>();
    const historyRecorder = createVoidTupleRecorder<[string, "search" | "visitedEntry" | "imageClassification" | "drawingClassification"]>();
    const controller = CreateDisplayInferencesController({
      navigateToKanjiEntry: navigationRecorder.handler,
      saveHistoryEntry: historyRecorder.handler
    });

    expect(() => controller.updateResultsFromImageSource("", TEST_PREDICTIONS)).toThrow("invalid image source");
    expect(() => controller.updateResultsFromImageSource("image-1", [])).toThrow("empty predictions");
  });

  /**
   * Requirement: R8
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R8", "Unit", "Invariant", "does not overwrite results when receiving the same source again"), () => {
    const navigationRecorder = createVoidArgumentRecorder<string>();
    const historyRecorder = createVoidTupleRecorder<[string, "search" | "visitedEntry" | "imageClassification" | "drawingClassification"]>();
    const controller = CreateDisplayInferencesController({
      navigateToKanjiEntry: navigationRecorder.handler,
      saveHistoryEntry: historyRecorder.handler
    });

    controller.updateResultsFromImageSource("image-1", TEST_PREDICTIONS);
    controller.updateResultsFromImageSource("image-1", TEST_EXTENDED_PREDICTIONS);

    expect(controller.getVisibleResults()).toEqual(TEST_SUMMARIES, "DisplayInferencesInterface overwrote results for the same source.");
  });

  /**
   * Requirement: R8
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R8", "Unit", "Postcondition", "updates results when receiving a new image source"), () => {
    const navigationRecorder = createVoidArgumentRecorder<string>();
    const historyRecorder = createVoidTupleRecorder<[string, "search" | "visitedEntry" | "imageClassification" | "drawingClassification"]>();
    const controller = CreateDisplayInferencesController({
      navigateToKanjiEntry: navigationRecorder.handler,
      saveHistoryEntry: historyRecorder.handler
    });

    controller.updateResultsFromImageSource("image-2", TEST_PREDICTIONS);

    expect(controller.getVisibleResults()).toEqual(TEST_SUMMARIES, "DisplayInferencesInterface did not update results for a new image source.");
  });

  /**
   * Requirement: R9
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R9", "Unit", "Precondition", "rejects empty drawing inference predictions"), () => {
    const navigationRecorder = createVoidArgumentRecorder<string>();
    const historyRecorder = createVoidTupleRecorder<[string, "search" | "visitedEntry" | "imageClassification" | "drawingClassification"]>();
    const controller = CreateDisplayInferencesController({
      navigateToKanjiEntry: navigationRecorder.handler,
      saveHistoryEntry: historyRecorder.handler
    });

    expect(() => controller.updateResultsFromDrawingInference([])).toThrow();
  });

  /**
   * Requirement: R9
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R9", "Unit", "Invariant", "drawing result list never exceeds five elements"), () => {
    const navigationRecorder = createVoidArgumentRecorder<string>();
    const historyRecorder = createVoidTupleRecorder<[string, "search" | "visitedEntry" | "imageClassification" | "drawingClassification"]>();
    const controller = CreateDisplayInferencesController({
      navigateToKanjiEntry: navigationRecorder.handler,
      saveHistoryEntry: historyRecorder.handler
    });

    controller.updateResultsFromDrawingInference([...TEST_EXTENDED_PREDICTIONS]);

    expect(controller.getVisibleResults()).toHaveLength(5, "DisplayInferencesInterface did not truncate the drawing result limit to exactly 5.");
  });

  /**
   * Requirement: R9
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R9", "Unit", "Postcondition", "updates the drawing list after each new inference"), () => {
    const navigationRecorder = createVoidArgumentRecorder<string>();
    const historyRecorder = createVoidTupleRecorder<[string, "search" | "visitedEntry" | "imageClassification" | "drawingClassification"]>();
    const controller = CreateDisplayInferencesController({
      navigateToKanjiEntry: navigationRecorder.handler,
      saveHistoryEntry: historyRecorder.handler
    });

    controller.updateResultsFromDrawingInference(TEST_PREDICTIONS);
    controller.updateResultsFromDrawingInference(TEST_OTHER_PREDICTIONS);

    expect(controller.getVisibleResults()).not.toEqual(TEST_SUMMARIES, "DisplayInferencesInterface did not update the drawing list after a new inference.");
  });

  /**
   * Requirement: R10
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R10", "Unit", "Precondition", "fails if model is not loaded or no inference performed"), () => {
    const controller = CreateDisplayInferencesController({
      navigateToKanjiEntry: async () => { },
      saveHistoryEntry: async () => { }
    });

    expect(() => controller.getVisibleResults()).toThrow();
  });

  /**
   * Requirement: R10
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R10", "Unit", "Invariant", "returns predictions ordered by descending confidence"), () => {
    const navigationRecorder = createVoidArgumentRecorder<string>();
    const historyRecorder = createVoidTupleRecorder<[string, "search" | "visitedEntry" | "imageClassification" | "drawingClassification"]>();
    const controller = CreateDisplayInferencesController({
      navigateToKanjiEntry: navigationRecorder.handler,
      saveHistoryEntry: historyRecorder.handler
    });
    controller.updateResultsFromDrawingInference(TEST_PREDICTIONS);
    const results = controller.getVisibleResults();

    expect(results[0]?.character).toBe(TEST_SECONDARY_CHARACTER, "DisplayInferencesInterface did not return the highest confidence prediction first.");
    expect(results[1]?.character).toBe(TEST_TERTIARY_CHARACTER, "DisplayInferencesInterface did not return the second highest confidence prediction second.");
    expect(results[2]?.character).toBe(TEST_PRIMARY_CHARACTER, "DisplayInferencesInterface did not return the third highest confidence prediction third.");


    results.forEach(result => {
      expect(result).not.toHaveProperty("confidence", "DisplayInferencesInterface exposed confidence values.");
    });
  });

  /**
   * Requirement: R10
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R10", "Unit", "Postcondition", "returns between one and five visible predictions"), () => {
    const navigationRecorder = createVoidArgumentRecorder<string>();
    const historyRecorder = createVoidTupleRecorder<[string, "search" | "visitedEntry" | "imageClassification" | "drawingClassification"]>();
    const controller = CreateDisplayInferencesController({
      navigateToKanjiEntry: navigationRecorder.handler,
      saveHistoryEntry: historyRecorder.handler
    });

    controller.updateResultsFromDrawingInference(TEST_PREDICTIONS);
    const results = controller.getVisibleResults();

    expect(results.length).toBeGreaterThan(0, "DisplayInferencesInterface returned no visible predictions.");
    expect(results.length).toBeLessThanOrEqual(5, "DisplayInferencesInterface exceeded the visible prediction limit.");
  });

  /**
   * Requirement: R11
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R11", "Unit", "Precondition", "rejects opening entry if no results are available"), () => {
    const navigationRecorder = createVoidArgumentRecorder<string>();
    const historyRecorder = createVoidTupleRecorder<[string, "search" | "visitedEntry" | "imageClassification" | "drawingClassification"]>();
    const controller = CreateDisplayInferencesController({
      navigateToKanjiEntry: navigationRecorder.handler,
      saveHistoryEntry: historyRecorder.handler
    });

    return expect(
      controller.openKanjiEntry(TEST_PRIMARY_CHARACTER),
      "DisplayInferencesInterface did not reject opening a kanji entry when no results were available."
    ).rejects.toThrow().then(() => {
      expect(navigationRecorder.calls).toHaveLength(
        0,
        "DisplayInferencesInterface attempted to navigate without visible results."
      );
      expect(historyRecorder.calls).toHaveLength(
        0,
        "DisplayInferencesInterface attempted to persist history without visible results."
      );
    });
  });

  /**
   * Requirement: R11
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R11", "Unit", "Invariant", "does not alter the visible list after navigation"), async () => {
    const navigationRecorder = createVoidArgumentRecorder<string>();
    const historyRecorder = createVoidTupleRecorder<[string, "search" | "visitedEntry" | "imageClassification" | "drawingClassification"]>();
    const controller = CreateDisplayInferencesController({
      navigateToKanjiEntry: navigationRecorder.handler,
      saveHistoryEntry: historyRecorder.handler
    });

    controller.updateResultsFromDrawingInference(TEST_PREDICTIONS);
    const visibleResultsBeforeNavigation = controller.getVisibleResults();
    await controller.openKanjiEntry(TEST_PRIMARY_CHARACTER);

    expect(controller.getVisibleResults()).toEqual(
      visibleResultsBeforeNavigation,
      "DisplayInferencesInterface altered the visible list after navigation."
    );
  });

  /**
   * Requirement: R11
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R11", "Unit", "Postcondition", "opens the selected kanji entry and records it in history"), async () => {
    const imageNavigationRecorder = createVoidArgumentRecorder<string>();
    const imageHistoryRecorder = createVoidTupleRecorder<[string, "search" | "visitedEntry" | "imageClassification" | "drawingClassification"]>();
    const imageController = CreateDisplayInferencesController({
      navigateToKanjiEntry: imageNavigationRecorder.handler,
      saveHistoryEntry: imageHistoryRecorder.handler
    });
    const drawingNavigationRecorder = createVoidArgumentRecorder<string>();
    const drawingHistoryRecorder = createVoidTupleRecorder<[string, "search" | "visitedEntry" | "imageClassification" | "drawingClassification"]>();
    const drawingController = CreateDisplayInferencesController({
      navigateToKanjiEntry: drawingNavigationRecorder.handler,
      saveHistoryEntry: drawingHistoryRecorder.handler
    });

    imageController.updateResultsFromImageSource("image-1", TEST_PREDICTIONS);
    drawingController.updateResultsFromDrawingInference(TEST_PREDICTIONS);

    await imageController.openKanjiEntry(TEST_PRIMARY_CHARACTER);
    await drawingController.openKanjiEntry(TEST_PRIMARY_CHARACTER);

    expect(imageNavigationRecorder.calls).toEqual(
      [TEST_PRIMARY_CHARACTER],
      "DisplayInferencesInterface did not navigate to the selected kanji from image classification results."
    );
    expect(imageHistoryRecorder.calls).toEqual(
      [[TEST_PRIMARY_CHARACTER, "imageClassification"]],
      "DisplayInferencesInterface did not persist the selected image classification result with the exact history category."
    );

    expect(drawingNavigationRecorder.calls).toEqual(
      [TEST_PRIMARY_CHARACTER],
      "DisplayInferencesInterface did not navigate to the selected kanji from drawing classification results."
    );
    expect(drawingHistoryRecorder.calls).toEqual(
      [[TEST_PRIMARY_CHARACTER, "drawingClassification"]],
      "DisplayInferencesInterface did not persist the selected drawing classification result with the exact history category."
    );
  });
});
