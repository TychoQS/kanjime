import { describe, expect, it } from "vitest";

import { CreateInferenceController } from "../../../../src/Features/Classification/Inference/CreateInferenceController";
import { createAsyncTupleRecorder } from "../../../Support/DependencyFactories";
import { TEST_CROP, TEST_IMAGE, TEST_PREDICTIONS, TEST_STROKE, TEST_CANVAS_DATA_URL, MODEL_INPUT_SIZE, TEST_MODEL_PREDICTIONS, TEST_RESOLVED_STROKE_COUNTS, TEST_ENRICHED_PREDICTIONS } from "../../../Support/TestData";
import { buildRequirementTitle } from "../../../Support/RequirementTest";

describe("InferenceInterface", () => {
  /**
 * Requirement: R22
 * Type: Unit
 * Condition: Invariant
 */
  it(buildRequirementTitle("R22", "Unit", "Invariant", "new crop replaces the previous one as active source"), async () => {
    const classifierRecorder = createAsyncTupleRecorder<[string, string], ReadonlyArray<{ character: string; confidence: number; strokeCount: number }>>(TEST_PREDICTIONS);
    const controller = CreateInferenceController({
      classifySource: classifierRecorder.handler
    });

    await controller.classifyCrop({
      sourceId: "crop-1",
      sourceUri: TEST_IMAGE.uri,
      crop: TEST_CROP
    });

    await controller.classifyCrop({
      sourceId: "crop-2",
      sourceUri: TEST_IMAGE.uri,
      crop: TEST_CROP
    });

    expect(controller.hasProcessedSource("crop-2")).toBe(true,
      "InferenceInterface did not mark the new crop as the active source."
    );
    expect(controller.hasProcessedSource("crop-1")).toBe(false,
      "InferenceInterface did not replace the previous crop source."
    );
  });

  /**
   * Requirement: R22
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R22", "Unit", "Postcondition", "returns predictions after classifying a crop"), async () => {
    const classifierRecorder = createAsyncTupleRecorder<[string, string], ReadonlyArray<{ character: string; confidence: number; strokeCount: number }>>(TEST_PREDICTIONS);
    const controller = CreateInferenceController({
      classifySource: classifierRecorder.handler
    });

    const predictions = await controller.classifyCrop({
      sourceId: "crop-1",
      sourceUri: TEST_IMAGE.uri,
      crop: TEST_CROP
    });

    expect(predictions.length).toBeGreaterThan(0,
      "InferenceInterface returned no predictions after classifying a crop."
    );

    expect(classifierRecorder.calls).toHaveLength(1,
      "InferenceInterface did not call the classifier after classifying a crop."
    );

  });

  /**
 * Requirement: R23
 * Type: Unit
 * Condition: Precondition - valid
 */
  it(buildRequirementTitle("R23", "Unit", "Precondition", "accepts input when at least one stroke exists"), async () => {
    const controller = CreateInferenceController({
      classifySource: createAsyncTupleRecorder<[string, string], ReadonlyArray<{ character: string; confidence: number; strokeCount: number }>>(TEST_PREDICTIONS).handler
    });

    await expect(controller.preprocessDrawingForModel({
      canvasDataUrl: TEST_CANVAS_DATA_URL,
      strokeCount: 1,
      modelInputWidth: MODEL_INPUT_SIZE,
      modelInputHeight: MODEL_INPUT_SIZE
    })).resolves.toBeDefined();
  });

  /**
   * Requirement: R23
   * Type: Unit
   * Condition: Precondition - invalid
   */
  it(buildRequirementTitle("R23", "Unit", "Precondition", "rejects input when no strokes exist"), async () => {
    const controller = CreateInferenceController({
      classifySource: createAsyncTupleRecorder<[string, string], ReadonlyArray<{ character: string; confidence: number; strokeCount: number }>>(TEST_PREDICTIONS).handler
    });

    await expect(controller.preprocessDrawingForModel({
      canvasDataUrl: TEST_CANVAS_DATA_URL,
      strokeCount: 0,
      modelInputWidth: MODEL_INPUT_SIZE,
      modelInputHeight: MODEL_INPUT_SIZE
    })).rejects.toThrow(
      "InferenceInterface accepted a drawing input with no strokes."
    );
  });

  /**
   * Requirement: R23
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R23", "Unit", "Invariant", "output dimensions match model input dimensions"), async () => {
    const controller = CreateInferenceController({
      classifySource: createAsyncTupleRecorder<[string, string], ReadonlyArray<{ character: string; confidence: number; strokeCount: number }>>(TEST_PREDICTIONS).handler
    });

    const imageData = await controller.preprocessDrawingForModel({
      canvasDataUrl: TEST_CANVAS_DATA_URL,
      strokeCount: 1,
      modelInputWidth: MODEL_INPUT_SIZE,
      modelInputHeight: MODEL_INPUT_SIZE
    });

    expect(imageData.width).toBe(MODEL_INPUT_SIZE,
      "InferenceInterface returned an image with unexpected width."
    );
    expect(imageData.height).toBe(MODEL_INPUT_SIZE,
      "InferenceInterface returned an image with unexpected height."
    );
  });

  /**
   * Requirement: R23
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R23", "Unit", "Postcondition", "output has black background and white strokes"), async () => {
    const controller = CreateInferenceController({
      classifySource: createAsyncTupleRecorder<[string, string], ReadonlyArray<{ character: string; confidence: number; strokeCount: number }>>(TEST_PREDICTIONS).handler
    });

    const imageData = await controller.preprocessDrawingForModel({
      canvasDataUrl: TEST_CANVAS_DATA_URL,
      strokeCount: 1,
      modelInputWidth: MODEL_INPUT_SIZE,
      modelInputHeight: MODEL_INPUT_SIZE
    });

    const isBinarized = [...imageData.data].every(value => value === 0 || value === 255);
    expect(isBinarized).toBe(true,
      "InferenceInterface did not return a binarized image with black background and white strokes."
    );
  });

  /**
   * Requirement: R24
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R24", "Unit", "Precondition", "rejects empty sourceUri for preprocessing"), async () => {
    const controller = CreateInferenceController({
      classifySource: createAsyncTupleRecorder<[string, string], ReadonlyArray<{ character: string; confidence: number; strokeCount: number }>>(TEST_PREDICTIONS).handler
    });
    await expect(controller.preprocessImageForModel({
      sourceUri: "",
      modelInputWidth: MODEL_INPUT_SIZE,
      modelInputHeight: MODEL_INPUT_SIZE
    })).rejects.toThrow("InferenceInterface rejected an empty sourceUri for preprocessing.");
  });

  /**
   * Requirement: R24
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R24", "Unit", "Invariant", "output dimensions match model input dimensions"), async () => {
    const classifierRecorder = createAsyncTupleRecorder<[string, string], ReadonlyArray<{ character: string; confidence: number; strokeCount: number }>>(TEST_PREDICTIONS);
    const controller = CreateInferenceController({
      classifySource: classifierRecorder.handler
    });

    const imageData = await controller.preprocessImageForModel({
      sourceUri: TEST_IMAGE.uri,
      crop: TEST_CROP,
      modelInputWidth: MODEL_INPUT_SIZE,
      modelInputHeight: MODEL_INPUT_SIZE
    });

    expect(imageData.width).toBe(MODEL_INPUT_SIZE,
      "InferenceInterface returned an image with unexpected width."
    );
    expect(imageData.height).toBe(MODEL_INPUT_SIZE,
      "InferenceInterface returned an image with unexpected height."
    );
  });

  /**
   * Requirement: R24
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R24", "Unit", "Postcondition", "output is binarized before inference"), async () => {
    const classifierRecorder = createAsyncTupleRecorder<[string, string], ReadonlyArray<{ character: string; confidence: number; strokeCount: number }>>(TEST_PREDICTIONS);
    const controller = CreateInferenceController({
      classifySource: classifierRecorder.handler
    });

    const imageData = await controller.preprocessImageForModel({
      sourceUri: TEST_IMAGE.uri,
      crop: TEST_CROP,
      modelInputWidth: MODEL_INPUT_SIZE,
      modelInputHeight: MODEL_INPUT_SIZE
    });

    const isBinarized = [...imageData.data].every(value => value === 0 || value === 255);
    expect(isBinarized).toBe(true,
      "InferenceInterface did not return a binarized image before inference."
    );
  });

  /**
     * Requirement: R25
     * Type: Unit
     * Condition: Precondition
     */
  it(buildRequirementTitle("R25", "Unit", "Precondition", "rejects empty sourceId or inputUrl"), async () => {
    const controller = CreateInferenceController({
      classifySource: createAsyncTupleRecorder<[string, string], ReadonlyArray<{ character: string; confidence: number; strokeCount: number }>>(TEST_PREDICTIONS).handler
    });
    await expect(controller.classifyInput({
      sourceId: "",
      inputUrl: "file:///test.png"
    })).rejects.toThrow("InferenceInterface rejected an empty sourceId.");
    await expect(controller.classifyInput({
      sourceId: "test-1",
      inputUrl: ""
    })).rejects.toThrow("InferenceInterface rejected an empty inputUrl.");
  });

  /**
 * Requirement: R25
 * Type: Unit
 * Condition: Invariant
 */
  it(buildRequirementTitle("R25", "Unit", "Invariant", "does not execute duplicate inferences for the same source"), async () => {
    const classifierRecorder = createAsyncTupleRecorder<[string, string], ReadonlyArray<{ character: string; confidence: number; strokeCount: number }>>(TEST_PREDICTIONS);
    const controller = CreateInferenceController({
      classifySource: classifierRecorder.handler
    });

    await controller.classifyInput({
      sourceId: "source-1",
      inputUrl: TEST_IMAGE.uri,
      strokeCount: 1
    });

    await controller.classifyInput({
      sourceId: "source-1",
      inputUrl: TEST_IMAGE.uri,
      strokeCount: 1
    });

    expect(classifierRecorder.calls).toHaveLength(1,
      "InferenceInterface executed a duplicate inference for the same source."
    );
  });

  /**
   * Requirement: R25
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R25", "Unit", "Postcondition", "executes exactly one inference per new source"), async () => {
    const classifierRecorder = createAsyncTupleRecorder<[string, string], ReadonlyArray<{ character: string; confidence: number; strokeCount: number }>>(TEST_PREDICTIONS);
    const controller = CreateInferenceController({
      classifySource: classifierRecorder.handler
    });

    await controller.classifyInput({
      sourceId: "source-1",
      inputUrl: TEST_IMAGE.uri,
      strokeCount: 1
    });

    expect(classifierRecorder.calls).toHaveLength(1,
      "InferenceInterface did not execute exactly one inference for a new source."
    );
  });

  /**
 * Requirement: R26
 * Type: Unit
 * Condition: Invariant
 */
  it(buildRequirementTitle("R26", "Unit", "Invariant", "classification does not use any crop"), async () => {
    const classifierRecorder = createAsyncTupleRecorder<[string, string], ReadonlyArray<{ character: string; confidence: number; strokeCount: number }>>(TEST_PREDICTIONS);
    const controller = CreateInferenceController({
      classifySource: classifierRecorder.handler
    });

    await controller.classifyFullImage({
      sourceId: "full-image-1",
      sourceUri: TEST_IMAGE.uri
    });

    const [_sourceId, inputUrl] = classifierRecorder.calls[0];
    expect(inputUrl).toBe(TEST_IMAGE.uri,
      "InferenceInterface used a crop instead of the full image as input."
    );
  });

  /**
   * Requirement: R26
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R26", "Unit", "Postcondition", "classifies the full image and tracks the source"), async () => {
    const classifierRecorder = createAsyncTupleRecorder<[string, string], ReadonlyArray<{ character: string; confidence: number; strokeCount: number }>>(TEST_PREDICTIONS);
    const controller = CreateInferenceController({
      classifySource: classifierRecorder.handler
    });

    const predictions = await controller.classifyFullImage({
      sourceId: "full-image-1",
      sourceUri: TEST_IMAGE.uri
    });

    expect(predictions.length).toBeGreaterThan(0,
      "InferenceInterface returned no predictions after classifying the full image."
    );
    expect(controller.hasProcessedSource("full-image-1")).toBe(true,
      "InferenceInterface did not track the processed full image source."
    );
  });

  /**
   * Requirement: R40
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R40", "Unit", "Precondition", "returns predictions after drawing inference"), async () => {
    const classifierRecorder = createAsyncTupleRecorder<[string, string], ReadonlyArray<{ character: string; confidence: number; strokeCount: number }>>(TEST_MODEL_PREDICTIONS);
    const resolveStrokeCount = (character: string): Promise<number> => Promise.resolve(TEST_RESOLVED_STROKE_COUNTS[character] ?? 0);

    const controller = CreateInferenceController({
      classifySource: classifierRecorder.handler,
      resolveStrokeCount
    });

    const predictions = await controller.classifyInput({
      sourceId: "drawing-1",
      inputUrl: "drawing://canvas",
      strokeCount: 1
    });

    expect(predictions.length).toBeGreaterThan(0,
      "InferenceInterface did not return predictions after inference."
    );
  });

  /**
   * Requirement: R40
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R40", "Unit", "Invariant", "predicted characters are not modified by enrichment"), async () => {
    const classifierRecorder = createAsyncTupleRecorder<[string, string], ReadonlyArray<{ character: string; confidence: number; strokeCount: number }>>(TEST_MODEL_PREDICTIONS);
    const resolveStrokeCount = (character: string): Promise<number> => Promise.resolve(TEST_RESOLVED_STROKE_COUNTS[character] ?? 0);

    const controller = CreateInferenceController({
      classifySource: classifierRecorder.handler,
      resolveStrokeCount
    });

    const predictions = await controller.classifyInput({
      sourceId: "drawing-2",
      inputUrl: "drawing://canvas",
      strokeCount: 2
    });

    const inputCharacters = TEST_MODEL_PREDICTIONS.map(p => p.character);
    const outputCharacters = predictions.map(p => p.character);

    expect(outputCharacters).toEqual(inputCharacters,
      "InferenceInterface modified the predicted characters during enrichment."
    );
  });

  /**
   * Requirement: R40
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R40", "Unit", "Postcondition", "predictions contain correct strokeCount from kanji data"), async () => {
    const classifierRecorder = createAsyncTupleRecorder<[string, string], ReadonlyArray<{ character: string; confidence: number; strokeCount: number }>>(TEST_MODEL_PREDICTIONS);
    const resolveStrokeCount = (character: string): Promise<number> => Promise.resolve(TEST_RESOLVED_STROKE_COUNTS[character] ?? 0);

    const controller = CreateInferenceController({
      classifySource: classifierRecorder.handler,
      resolveStrokeCount
    });

    const predictions = await controller.classifyInput({
      sourceId: "drawing-3",
      inputUrl: "drawing://canvas",
      strokeCount: 3
    });

    expect(predictions).toEqual(TEST_ENRICHED_PREDICTIONS,
      "InferenceInterface did not enrich predictions with correct strokeCount from kanji data."
    );
  });
});
