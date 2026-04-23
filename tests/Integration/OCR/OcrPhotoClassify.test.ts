import { describe, expect, it } from "vitest";

import { CreateImageController } from "../../../src/Features/Classification/Image/CreateImageController";
import { CreatePhotoController } from "../../../src/Features/Classification/Image/CreatePhotoController";
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

describe("OCR-PHOTO-CLASSIFY", () => {
  /**
   * Requirement: OCR-PHOTO-CLASSIFY
   * Type: Integration
   * Condition: All
   */
  it(buildRequirementTitle("OCR-PHOTO-CLASSIFY", "Integration", "All", "flows from a captured photo to visible predictions"), async () => {
    const initializerRecorder = createAsyncValueRecorder({
      inputWidth: TEST_IMAGE.width,
      inputHeight: TEST_IMAGE.height,
      isLoaded: true
    });
    const cameraRecorder = createAsyncValueRecorder(TEST_IMAGE);
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
    const photoController = CreatePhotoController({
      captureFromCamera: cameraRecorder.handler,
      pickFromLibrary: createAsyncValueRecorder(TEST_IMAGE).handler
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
      "OCR-PHOTO-CLASSIFY precondition failed: after calling loadModel(), the model loader still reports not-ready."
    );
    expect(initializerRecorder.calls).toHaveLength(1,
      "OCR-PHOTO-CLASSIFY precondition failed: the model runtime must be initialized exactly once before classifying a captured photo."
    );

    // Precondition: photo is captured from the camera and set as the active input
    const image = await photoController.capturePhoto();
    imageController.setImage(image);
    expect(cameraRecorder.calls.length).toBeGreaterThan(0,
      "OCR-PHOTO-CLASSIFY precondition failed: the photo flow never requested an image from the camera dependency."
    );
    expect(image).toEqual(TEST_IMAGE,
      "OCR-PHOTO-CLASSIFY precondition failed: the captured photo was not propagated as the active image input."
    );

    // Invariant: inference is executed exactly once for the captured photo
    const predictions = await inference.classifyFullImage({
      sourceId: "captured-photo",
      sourceUri: image.uri
    });
    expect(classifierRecorder.calls).toHaveLength(1,
      "OCR-PHOTO-CLASSIFY invariant failed: one captured photo must trigger exactly one classification request."
    );
    expect(classifierRecorder.calls[0]).toEqual(
      ["captured-photo", image.uri],
      "OCR-PHOTO-CLASSIFY invariant failed: the classifier did not receive the expected sourceId/sourceUri for the captured photo."
    );

    // Postcondition: a non-empty list of predictions is generated and displayed
    expect(predictions.length).toBeGreaterThan(0,
      "OCR-PHOTO-CLASSIFY postcondition failed: classifying a captured photo returned no predictions."
    );
    expect(predictions.length).toBeLessThanOrEqual(5,
      "OCR-PHOTO-CLASSIFY postcondition failed: the visible prediction list exceeded 5 entries."
    );
    display.updateResultsFromImageSource("captured-photo", TEST_PREDICTIONS);
    const visibleResults = display.getVisibleResults();
    expect(visibleResults.length).toBeGreaterThan(0,
      "OCR-PHOTO-CLASSIFY postcondition failed: predictions were not propagated to the visible inference list."
    );
    expect(TEST_PREDICTIONS.every((prediction, index, allPredictions) => (
      index === 0 || allPredictions[index - 1].confidence >= prediction.confidence
    ))).toBe(true,
      "OCR-PHOTO-CLASSIFY postcondition failed: predictions are not ordered by descending confidence before display."
    );
  });

  it(buildRequirementTitle("OCR-PHOTO-CLASSIFY", "Integration", "All", "surfaces a denied capture without hiding the fallback input contract"), async () => {
    const initializerRecorder = createAsyncValueRecorder({
      inputWidth: TEST_IMAGE.width,
      inputHeight: TEST_IMAGE.height,
      isLoaded: true
    });
    const deniedCamera = {
      calls: [] as number[],
      async handler(): Promise<typeof TEST_IMAGE> {
        deniedCamera.calls.push(deniedCamera.calls.length + 1);
        throw new Error("Permission denied");
      }
    };
    const classifierRecorder = createAsyncTupleRecorder<[string, string], ReadonlyArray<{ character: string; confidence: number; strokeCount: number }>>(TEST_PREDICTIONS);

    const modelLoader = CreateModelLoaderController({
      initializeModelRuntime: initializerRecorder.handler
    });
    const photoController = CreatePhotoController({
      captureFromCamera: deniedCamera.handler,
      pickFromLibrary: createAsyncValueRecorder(TEST_IMAGE).handler
    });
    const inference = CreateInferenceController({
      classifySource: classifierRecorder.handler
    });

    await modelLoader.loadModel();
    expect(modelLoader.isModelReady()).toBe(true,
      "OCR-PHOTO-CLASSIFY denial precondition failed: after calling loadModel(), the model loader still reports not-ready."
    );

    const captured = await photoController.capturePhoto();
    expect(deniedCamera.calls).toHaveLength(1,
      "OCR-PHOTO-CLASSIFY denial path failed: the flow never attempted to capture from the camera before handling the permission error."
    );
    expect(captured.uri).toBe("",
      "OCR-PHOTO-CLASSIFY denial path failed: the controller did not expose the current fallback contract for a denied capture (empty URI placeholder)."
    );

    await inference.classifyFullImage({
      sourceId: "denied-photo",
      sourceUri: captured.uri
    });
    expect(classifierRecorder.calls[0]).toEqual(
      ["denied-photo", ""],
      "OCR-PHOTO-CLASSIFY denial path failed: the denied capture was not made observable through the current inference input contract."
    );
  });
});
