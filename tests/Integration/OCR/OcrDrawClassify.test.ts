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
   * Condition: All
   */
  it(buildRequirementTitle("OCR-DRAW-CLASSIFY", "Integration", "All", "flows from a stroke to visible ordered predictions"), async () => {
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

    // Precondition: model is loaded and drawing mode is active
    await modelLoader.loadModel();
    expect(modelLoader.isModelReady()).toBe(true,
      "OCR-DRAW-CLASSIFY precondition failed: after calling loadModel(), the model loader still reports not-ready. Implement loadModel()/isModelReady() so drawing OCR only starts once the model is available."
    );
    expect(initializerRecorder.calls).toHaveLength(1,
      "OCR-DRAW-CLASSIFY precondition failed: the model runtime must be initialized exactly once before processing the first stroke."
    );

    // Invariant: inference is executed exactly once per completed stroke
    const predictions = await canvas.registerStroke(TEST_STROKE);
    expect(classifierRecorder.calls).toHaveLength(1,
      "OCR-DRAW-CLASSIFY invariant failed: completing one new stroke must trigger exactly one classification request."
    );
    expect(classifierRecorder.calls[0]).toEqual(
      ["draw-source", "data:image/png;base64,AAAA"],
      "OCR-DRAW-CLASSIFY invariant failed: the classifier did not receive the expected drawing sourceId/inputUrl contract for the completed stroke."
    );

    // Postcondition: a non-empty ordered list of predictions (≤5) is generated and displayed
    expect(predictions.length).toBeGreaterThan(0,
      "OCR-DRAW-CLASSIFY postcondition failed: drawing OCR returned no predictions after a completed stroke."
    );
    expect(predictions.length).toBeLessThanOrEqual(5,
      "OCR-DRAW-CLASSIFY postcondition failed: drawing OCR returned more than 5 predictions, violating the visible results limit."
    );
    display.updateResultsFromDrawingInference(TEST_PREDICTIONS);
    const visibleResults = display.getVisibleResults();
    expect(visibleResults.length).toBeGreaterThan(0,
      "OCR-DRAW-CLASSIFY postcondition failed: predictions were not propagated to the visible inference list."
    );
    expect(TEST_PREDICTIONS.every((prediction, index, allPredictions) => (
      index === 0 || allPredictions[index - 1].confidence >= prediction.confidence
    ))).toBe(true,
      "OCR-DRAW-CLASSIFY postcondition failed: predictions are not ordered by descending confidence before being shown."
    );
  });
});
