import { describe, expect, it } from "vitest";

import { CreateImageController } from "../../../src/Features/Classification/Image/CreateImageController";
import { CreatePhotoController } from "../../../src/Features/Classification/Image/CreatePhotoController";
import { CreateDisplayInferencesController } from "../../../src/Features/Classification/Inference/CreateDisplayInferencesController";
import { CreateInferenceController } from "../../../src/Features/Classification/Inference/CreateInferenceController";
import {
  createAsyncTupleRecorder,
  createAsyncValueRecorder,
  createVoidArgumentRecorder,
  createVoidTupleRecorder
} from "../../Support/DependencyFactories";
import { TEST_IMAGE, TEST_PREDICTIONS } from "../../Support/TestData";
import { buildRequirementTitle } from "../../Support/RequirementTest";

describe("OCR-PHOTO-CLASSIFY", () => {
  /**
   * Requirement: OCR-PHOTO-CLASSIFY
   * Type: Integration
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("OCR-PHOTO-CLASSIFY", "Integration", "Postcondition", "flows from a captured photo to visible predictions"), async () => {
    const cameraRecorder = createAsyncValueRecorder(TEST_IMAGE);
    const libraryRecorder = createAsyncValueRecorder(TEST_IMAGE);
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

    const photoController = CreatePhotoController({
      captureFromCamera: cameraRecorder.handler,
      pickFromLibrary: libraryRecorder.handler
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

    const image = await photoController.capturePhoto();
    imageController.setImage(image);
    const predictions = await inference.classifyFullImage({
      sourceId: "captured-photo",
      sourceUri: image.uri
    });
    display.updateResultsFromImageSource("captured-photo", TEST_PREDICTIONS);

    expect(cameraRecorder.calls.length).toBeGreaterThan(0, "OCR photo flow never requested a camera image.");
    expect(image).toEqual(TEST_IMAGE, "OCR photo flow did not propagate the captured photo.");
    expect(predictions.length).toBeGreaterThan(0, "OCR photo flow produced no predictions.");
    expect(display.getVisibleResults().length).toBeGreaterThan(0, "OCR photo flow did not expose visible results.");
  });
});
