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
import { TEST_CROP, TEST_IMAGE, TEST_OTHER_PREDICTIONS, TEST_PREDICTIONS, TEST_MOCK_RESOLVE_SUMMARY } from "../../Support/TestData";
import { buildRequirementTitle } from "../../Support/RequirementTest";

describe("OCR-CROP-CLASSIFY", () => {
  /**
   * Requirement: OCR-CROP-CLASSIFY
   * Type: Integration
   * Condition: All
   */
  it(buildRequirementTitle("OCR-CROP-CLASSIFY", "Integration", "All", "flows from a crop selection to visible predictions"), async () => {
    const initializerRecorder = createAsyncValueRecorder({
      inputWidth: TEST_IMAGE.width,
      inputHeight: TEST_IMAGE.height,
      isLoaded: true
    });
    const classifierRecorder = createAsyncTupleRecorder<[string, string], ReadonlyArray<{ character: string; confidence: number; strokeCount: number }>>(TEST_PREDICTIONS);
    const imageSelectionRecorder = createVoidArgumentRecorder<typeof TEST_IMAGE>();
    const cropSelectionRecorder = createVoidArgumentRecorder<typeof TEST_CROP>();
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
      saveHistoryEntry: historyRecorder.handler,
      resolveSummary: TEST_MOCK_RESOLVE_SUMMARY
    });

    // Precondition: model is loaded, image is set, and a valid crop is defined
    await modelLoader.loadModel();
    expect(modelLoader.isModelReady()).toBe(true,
      "OCR-CROP-CLASSIFY precondition failed: after calling loadModel(), the model loader still reports not-ready."
    );
    expect(initializerRecorder.calls).toHaveLength(1,
      "OCR-CROP-CLASSIFY precondition failed: the model runtime must be initialized exactly once before crop classification."
    );
    imageController.setImage(TEST_IMAGE);
    imageController.setActiveCrop(TEST_CROP);
    expect(imageController.getImageState().crop).toEqual(TEST_CROP,
      "OCR-CROP-CLASSIFY precondition failed: the first valid crop was not preserved as the active input."
    );

    // Invariant: the active crop replaces the previous one and inference runs exactly once per valid crop
    const secondCrop = { ...TEST_CROP, x: TEST_CROP.x + 20, y: TEST_CROP.y + 20 };
    const firstPredictions = await inference.classifyCrop({
      sourceId: "crop-source-1",
      sourceUri: TEST_IMAGE.uri,
      crop: TEST_CROP
    });
    imageController.setActiveCrop(secondCrop);
    const secondPredictions = await inference.classifyCrop({
      sourceId: "crop-source-2",
      sourceUri: TEST_IMAGE.uri,
      crop: secondCrop
    });
    expect(imageController.getImageState().crop).toEqual(secondCrop,
      "OCR-CROP-CLASSIFY invariant failed: selecting a second valid crop must replace the previous active crop."
    );
    expect(classifierRecorder.calls).toHaveLength(2,
      "OCR-CROP-CLASSIFY invariant failed: each valid crop must trigger exactly one classification request."
    );
    expect(classifierRecorder.calls[0]).toEqual(
      ["crop-source-1", TEST_IMAGE.uri],
      "OCR-CROP-CLASSIFY invariant failed: the classifier did not receive the expected sourceId/sourceUri for the first crop."
    );
    expect(classifierRecorder.calls[1]).toEqual(
      ["crop-source-2", TEST_IMAGE.uri],
      "OCR-CROP-CLASSIFY invariant failed: the classifier did not receive the expected sourceId/sourceUri for the second crop."
    );

    // Postcondition: a non-empty ordered list of predictions (≤5) is generated and displayed
    expect(firstPredictions.length).toBeGreaterThan(0,
      "OCR-CROP-CLASSIFY postcondition failed: the first valid crop produced no predictions."
    );
    expect(secondPredictions.length).toBeGreaterThan(0,
      "OCR-CROP-CLASSIFY postcondition failed: the replacement crop produced no predictions."
    );
    expect(secondPredictions.length).toBeLessThanOrEqual(5,
      "OCR-CROP-CLASSIFY postcondition failed: the visible prediction list for the replacement crop exceeded 5 entries."
    );
    display.updateResultsFromImageSource("crop-source-1", TEST_PREDICTIONS);
    const initialVisibleResults = display.getVisibleResults();
    display.updateResultsFromImageSource("crop-source-2", TEST_OTHER_PREDICTIONS);
    const replacementVisibleResults = display.getVisibleResults();
    expect(initialVisibleResults.length).toBeGreaterThan(0,
      "OCR-CROP-CLASSIFY postcondition failed: the first crop predictions were not propagated to the visible inference list."
    );
    expect(replacementVisibleResults.length).toBeGreaterThan(0,
      "OCR-CROP-CLASSIFY postcondition failed: the replacement crop predictions were not propagated to the visible inference list."
    );
    expect(replacementVisibleResults).not.toEqual(initialVisibleResults,
      "OCR-CROP-CLASSIFY postcondition failed: displaying the second crop did not replace the first crop results."
    );
    expect(TEST_PREDICTIONS.every((prediction, index, allPredictions) => (
      index === 0 || allPredictions[index - 1].confidence >= prediction.confidence
    ))).toBe(true,
      "OCR-CROP-CLASSIFY postcondition failed: the first crop predictions are not ordered by descending confidence."
    );

    // Postcondition: Selecting a prediction display its and records it in history as imageClassification
    const character = replacementVisibleResults[0].character;
    await display.openKanjiEntry(character);
    expect(historyRecorder.calls, "OCR-CROP-CLASSIFY postcondition failed: selecting a prediction did not record it in history.").toHaveLength(1);
    expect(historyRecorder.calls[0], "OCR-CROP-CLASSIFY postcondition failed: wrong category for crop classification.").toEqual([
      character,
      "imageClassification"
    ]);
  });
});
