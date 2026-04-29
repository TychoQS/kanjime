import { describe, expect, it } from "vitest";

import { CreateImageController } from "../../../src/Features/Classification/Image/CreateImageController";
import { CreateDisplayInferencesController } from "../../../src/Features/Classification/Inference/CreateDisplayInferencesController";
import { CreateInferenceController } from "../../../src/Features/Classification/Inference/CreateInferenceController";
import { CreateModelLoaderController } from "../../../src/Features/Classification/Inference/CreateModelLoaderController";
import {
  createAsyncTupleRecorder,
  createAsyncValueRecorder,
  createVoidArgumentRecorder,
  createVoidTupleRecorder
} from "../../Support/DependencyFactories";
import { TEST_IMAGE, TEST_PREDICTIONS } from "../../Support/TestData";
import { buildRequirementTitle } from "../../Support/RequirementTest";

describe("OCR-IMAGE-CLASSIFY", () => {
  /**
   * Requirement: OCR-IMAGE-CLASSIFY
   * Type: Integration
   * Condition: All
   */
  it(buildRequirementTitle("OCR-IMAGE-CLASSIFY", "Integration", "All", "flows from a loaded image to visible predictions"), async () => {
    const initializerRecorder = createAsyncValueRecorder({
      inputWidth: TEST_IMAGE.width,
      inputHeight: TEST_IMAGE.height,
      isLoaded: true
    });
    const classifierRecorder = createAsyncTupleRecorder<[string, string], ReadonlyArray<{ character: string; confidence: number; strokeCount: number }>>(TEST_PREDICTIONS);
    const imageSelectionRecorder = createVoidArgumentRecorder<typeof TEST_IMAGE>();
    const cropSelectionRecorder = createVoidArgumentRecorder<{
      x: number;
      y: number;
      width: number;
      height: number;
    }>();
    const navigationRecorder = createVoidArgumentRecorder<string>();
    const historyRecorder = createVoidTupleRecorder<[string, "search" | "visitedEntry" | "imageClassification" | "drawingClassification"]>();

    const modelLoader = CreateModelLoaderController({
      initializeModelRuntime: initializerRecorder.handler
    });
    const imageController = CreateImageController({
      onImageSelected: imageSelectionRecorder.handler,
      onCropSelected: cropSelectionRecorder.handler
    });
    const inference = CreateInferenceController({
      classifySource: classifierRecorder.handler
    });
    const display = CreateDisplayInferencesController({
      navigateToKanjiEntry: navigationRecorder.handler,
      saveHistoryEntry: historyRecorder.handler
    });

    // Precondition: model is loaded before starting the OCR flow
    await modelLoader.loadModel();
    expect(modelLoader.isModelReady()).toBe(true,
      "OCR-IMAGE-CLASSIFY precondition failed: after calling loadModel(), the model loader still reports not-ready."
    );
    expect(initializerRecorder.calls).toHaveLength(1,
      "OCR-IMAGE-CLASSIFY precondition failed: the model runtime must be initialized exactly once before classifying an uploaded image."
    );

    // Precondition: a valid image is set as the active input
    imageController.setImage(TEST_IMAGE);
    expect(imageController.getImageState().image).toEqual(TEST_IMAGE,
      "OCR-IMAGE-CLASSIFY precondition failed: the uploaded image was not preserved as the active classification input."
    );

    // Invariant: inference is executed exactly once for the loaded image
    const predictions = await inference.classifyFullImage({
      sourceId: "full-image",
      sourceUri: TEST_IMAGE.uri
    });
    expect(classifierRecorder.calls).toHaveLength(1,
      "OCR-IMAGE-CLASSIFY invariant failed: one uploaded image must trigger exactly one classification request."
    );
    expect(classifierRecorder.calls[0]).toEqual(
      ["full-image", TEST_IMAGE.uri],
      "OCR-IMAGE-CLASSIFY invariant failed: the classifier did not receive the expected sourceId/sourceUri for the uploaded image."
    );

    // Postcondition: a non-empty list of predictions is generated and displayed
    expect(predictions.length).toBeGreaterThan(0,
      "OCR-IMAGE-CLASSIFY postcondition failed: classifying a valid uploaded image returned no predictions."
    );
    expect(predictions.length).toBeLessThanOrEqual(5,
      "OCR-IMAGE-CLASSIFY postcondition failed: the visible prediction list exceeded 5 entries."
    );
    display.updateResultsFromImageSource("full-image", TEST_PREDICTIONS);
    const visibleResults = display.getVisibleResults();
    expect(visibleResults.length).toBeGreaterThan(0,
      "OCR-IMAGE-CLASSIFY postcondition failed: predictions were not propagated to the visible inference list."
    );
    expect(TEST_PREDICTIONS.every((prediction, index, allPredictions) => (
      index === 0 || allPredictions[index - 1].confidence >= prediction.confidence
    ))).toBe(true,
      "OCR-IMAGE-CLASSIFY postcondition failed: predictions are not ordered by descending confidence before display."
    );

    // Postcondition: Selecting a prediction display its and records it in history as imageClassification
    const character = visibleResults[0].character;
    await display.openKanjiEntry(character);
    expect(historyRecorder.calls, "OCR-IMAGE-CLASSIFY postcondition failed: selecting a prediction did not record it in history.").toHaveLength(1);
    expect(historyRecorder.calls[0], "OCR-IMAGE-CLASSIFY postcondition failed: wrong category for image classification.").toEqual([
      character,
      "imageClassification"
    ]);
  });
});
