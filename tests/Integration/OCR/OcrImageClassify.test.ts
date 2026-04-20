import { describe, expect, it } from "vitest";

import { CreateImageController } from "../../../src/Features/Classification/Image/CreateImageController";
import { CreateDisplayInferencesController } from "../../../src/Features/Classification/Inference/CreateDisplayInferencesController";
import { CreateInferenceController } from "../../../src/Features/Classification/Inference/CreateInferenceController";
import {
  createAsyncTupleRecorder,
  createVoidArgumentRecorder,
  createVoidTupleRecorder
} from "../../Support/DependencyFactories";
import { TEST_IMAGE, TEST_PREDICTIONS } from "../../Support/TestData";
import { buildRequirementTitle } from "../../Support/RequirementTest";

describe("OCR-IMAGE-CLASSIFY", () => {
  /**
   * Requirement: OCR-IMAGE-CLASSIFY
   * Type: Integration
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("OCR-IMAGE-CLASSIFY", "Integration", "Postcondition", "flows from a loaded image to visible predictions"), async () => {
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
    const predictions = await inference.classifyFullImage({
      sourceId: "full-image",
      sourceUri: TEST_IMAGE.uri
    });
    display.updateResultsFromImageSource("full-image", TEST_PREDICTIONS);

    expect(imageController.getImageState().image).toEqual(TEST_IMAGE, "OCR image flow did not keep the loaded image.");
    expect(predictions.length).toBeGreaterThan(0, "OCR image flow produced no predictions.");
    expect(classifierRecorder.calls).toHaveLength(1, "OCR image flow did not classify exactly once.");
    expect(display.getVisibleResults().length).toBeGreaterThan(0, "OCR image flow did not expose visible results.");
  });
});
