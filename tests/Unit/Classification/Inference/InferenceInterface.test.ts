import { describe, expect, it } from "vitest";

import { CreateInferenceController } from "../../../../src/Features/Classification/Inference/CreateInferenceController";
import { createAsyncTupleRecorder } from "../../../Support/DependencyFactories";
import { TEST_CROP, TEST_IMAGE, TEST_PREDICTIONS, TEST_STROKE } from "../../../Support/TestData";
import { buildRequirementTitle } from "../../../Support/RequirementTest";

describe("InferenceInterface", () => {
  /**
   * Requirement: R22
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R22", "Unit", "Postcondition", "classifies a crop as a new independent source"), async () => {
    const classifierRecorder = createAsyncTupleRecorder<[string, string], ReadonlyArray<{ character: string; confidence: number; strokeCount: number }>>(TEST_PREDICTIONS);
    const controller = CreateInferenceController({
      classifySource: classifierRecorder.handler
    });

    const predictions = await controller.classifyCrop({
      sourceId: "crop-1",
      sourceUri: TEST_IMAGE.uri,
      crop: TEST_CROP
    });

    expect(predictions.length).toBeGreaterThan(0, "InferenceInterface returned no crop predictions.");
    expect(controller.hasProcessedSource("crop-1")).toBe(true, "InferenceInterface did not mark the crop source as processed.");
  });

  /**
   * Requirement: R23
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R23", "Unit", "Postcondition", "preprocesses drawing input into the model format"), async () => {
    const classifierRecorder = createAsyncTupleRecorder<[string, string], ReadonlyArray<{ character: string; confidence: number; strokeCount: number }>>(TEST_PREDICTIONS);
    const controller = CreateInferenceController({
      classifySource: classifierRecorder.handler
    });

    const imageData = await controller.preprocessDrawingForModel({
      canvasDataUrl: "data:image/png;base64,AAAA",
      strokeCount: TEST_STROKE.points.length,
      modelInputWidth: TEST_IMAGE.width,
      modelInputHeight: TEST_IMAGE.height
    });

    expect(imageData.width).toBe(TEST_IMAGE.width, "InferenceInterface returned an unexpected drawing width.");
    expect(imageData.height).toBe(TEST_IMAGE.height, "InferenceInterface returned an unexpected drawing height.");
    expect(imageData.data[0]).toBe(0, "InferenceInterface did not keep the drawing background in the expected format.");
  });

  /**
   * Requirement: R24
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R24", "Unit", "Postcondition", "preprocesses uploaded images into a binarized input"), async () => {
    const classifierRecorder = createAsyncTupleRecorder<[string, string], ReadonlyArray<{ character: string; confidence: number; strokeCount: number }>>(TEST_PREDICTIONS);
    const controller = CreateInferenceController({
      classifySource: classifierRecorder.handler
    });

    const imageData = await controller.preprocessImageForModel({
      sourceUri: TEST_IMAGE.uri,
      crop: TEST_CROP,
      modelInputWidth: TEST_IMAGE.width,
      modelInputHeight: TEST_IMAGE.height
    });

    expect(imageData.width).toBe(TEST_IMAGE.width, "InferenceInterface returned an unexpected image width.");
    expect(imageData.height).toBe(TEST_IMAGE.height, "InferenceInterface returned an unexpected image height.");
    expect([...imageData.data].every((value) => value === 0 || value === 255)).toBe(
      true,
      "InferenceInterface did not keep the image in a binarized representation."
    );
  });

  /**
   * Requirement: R25
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R25", "Unit", "Invariant", "executes exactly one classification per new source"), async () => {
    const classifierRecorder = createAsyncTupleRecorder<[string, string], ReadonlyArray<{ character: string; confidence: number; strokeCount: number }>>(TEST_PREDICTIONS);
    const controller = CreateInferenceController({
      classifySource: classifierRecorder.handler
    });

    const predictions = await controller.classifyInput({
      sourceId: "source-1",
      inputUrl: TEST_IMAGE.uri,
      strokeCount: TEST_STROKE.points.length
    });

    expect(classifierRecorder.calls).toHaveLength(1, "InferenceInterface did not call the classifier exactly once.");
    expect(predictions.length).toBe(TEST_PREDICTIONS.length, "InferenceInterface returned an unexpected prediction count.");
  });

  /**
   * Requirement: R26
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R26", "Unit", "Postcondition", "classifies the full image when no crop exists"), async () => {
    const classifierRecorder = createAsyncTupleRecorder<[string, string], ReadonlyArray<{ character: string; confidence: number; strokeCount: number }>>(TEST_PREDICTIONS);
    const controller = CreateInferenceController({
      classifySource: classifierRecorder.handler
    });

    const predictions = await controller.classifyFullImage({
      sourceId: "full-image-1",
      sourceUri: TEST_IMAGE.uri
    });

    expect(predictions.length).toBeGreaterThan(0, "InferenceInterface returned no full-image predictions.");
    expect(controller.hasProcessedSource("full-image-1")).toBe(true, "InferenceInterface did not track the processed full image.");
  });
});
