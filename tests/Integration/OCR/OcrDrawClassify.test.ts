import { describe, expect, it } from "vitest";

import { CreateCanvasController } from "../../../src/Features/Classification/Canvas/CreateCanvasController";
import { CreateDisplayInferencesController } from "../../../src/Features/Classification/Inference/CreateDisplayInferencesController";
import { CreateInferenceController } from "../../../src/Features/Classification/Inference/CreateInferenceController";
import { CreateModelLoaderController } from "../../../src/Features/Classification/Inference/CreateModelLoaderController";
import {
  createAsyncTupleRecorder,
  createAsyncValueRecorder,
  createVoidArgumentRecorder,
  createVoidTupleRecorder
} from "../../Support/DependencyFactories";
import { TEST_IMAGE, TEST_PREDICTIONS, TEST_STROKE } from "../../Support/TestData";
import { buildRequirementTitle } from "../../Support/RequirementTest";

describe("OCR-DRAW-CLASSIFY", () => {
  /**
   * Requirement: OCR-DRAW-CLASSIFY
   * Type: Integration
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("OCR-DRAW-CLASSIFY", "Integration", "Postcondition", "flows from a stroke to visible ordered predictions"), async () => {
    const initializerRecorder = createAsyncValueRecorder({
      inputWidth: TEST_IMAGE.width,
      inputHeight: TEST_IMAGE.height,
      isLoaded: true
    });
    const classifierRecorder = createAsyncTupleRecorder<[string, string], ReadonlyArray<{ character: string; confidence: number; strokeCount: number }>>(TEST_PREDICTIONS);
    const navigationRecorder = createVoidArgumentRecorder<string>();
    const historyRecorder = createVoidTupleRecorder<[string, "search" | "visitedEntry" | "imageClassification" | "drawingClassification"]>();

    const modelLoader = CreateModelLoaderController({
      initializeModelRuntime: initializerRecorder.handler
    });
    const inference = CreateInferenceController({
      classifySource: classifierRecorder.handler
    });
    const canvas = CreateCanvasController({
      requestDrawingInference: async () => {
        return (await inference.classifyInput({
          sourceId: "draw-source",
          inputUrl: "data:image/png;base64,AAAA",
          strokeCount: TEST_STROKE.points.length
        })).map(({ character, strokeCount }) => ({ character, strokeCount }));
      }
    });
    const display = CreateDisplayInferencesController({
      navigateToKanjiEntry: navigationRecorder.handler,
      saveHistoryEntry: historyRecorder.handler
    });

    await modelLoader.loadModel();
    const predictions = await canvas.registerStroke(TEST_STROKE);
    display.updateResultsFromDrawingInference(TEST_PREDICTIONS);

    expect(modelLoader.isModelReady()).toBe(true, "OCR draw flow did not expose a ready model state.");
    expect(predictions.length).toBeGreaterThan(0, "OCR draw flow produced no predictions from the completed stroke.");
    expect(classifierRecorder.calls).toHaveLength(1, "OCR draw flow did not classify the stroke exactly once.");
    expect(display.getVisibleResults().length).toBeGreaterThan(0, "OCR draw flow did not expose visible predictions.");
  });
});
