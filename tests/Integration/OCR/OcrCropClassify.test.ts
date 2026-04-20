import { describe, expect, it } from "vitest";

import { CreateImageController } from "../../../src/Features/Classification/Image/CreateImageController";
import { CreateDisplayInferencesController } from "../../../src/Features/Classification/Inference/CreateDisplayInferencesController";
import { CreateInferenceController } from "../../../src/Features/Classification/Inference/CreateInferenceController";
import {
  createAsyncTupleRecorder,
  createVoidArgumentRecorder,
  createVoidTupleRecorder
} from "../../Support/DependencyFactories";
import { TEST_CROP, TEST_IMAGE, TEST_PREDICTIONS } from "../../Support/TestData";
import { buildRequirementTitle } from "../../Support/RequirementTest";

describe("OCR-CROP-CLASSIFY", () => {
  /**
   * Requirement: OCR-CROP-CLASSIFY
   * Type: Integration
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("OCR-CROP-CLASSIFY", "Integration", "Postcondition", "flows from a crop selection to visible predictions"), async () => {
    const classifierRecorder = createAsyncTupleRecorder<[string, string], ReadonlyArray<{ character: string; confidence: number; strokeCount: number }>>(TEST_PREDICTIONS);
    const imageSelectionRecorder = createVoidArgumentRecorder<typeof TEST_IMAGE>();
    const cropSelectionRecorder = createVoidArgumentRecorder<typeof TEST_CROP>();
    const navigationRecorder = createVoidArgumentRecorder<string>();
    const historyRecorder = createVoidTupleRecorder<[string, "search" | "visitedEntry" | "imageClassification" | "drawingClassification"]>();

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

    imageController.setImage(TEST_IMAGE);
    imageController.setActiveCrop(TEST_CROP);
    const predictions = await inference.classifyCrop({
      sourceId: "crop-source",
      sourceUri: TEST_IMAGE.uri,
      crop: TEST_CROP
    });
    display.updateResultsFromImageSource("crop-source", TEST_PREDICTIONS);

    expect(imageController.getImageState().crop).toEqual(TEST_CROP, "OCR crop flow did not keep the active crop.");
    expect(predictions.length).toBeGreaterThan(0, "OCR crop flow produced no predictions.");
    expect(classifierRecorder.calls).toHaveLength(1, "OCR crop flow did not classify exactly once.");
    expect(display.getVisibleResults().length).toBeGreaterThan(0, "OCR crop flow did not expose visible results.");
  });
});
