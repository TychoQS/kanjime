import { describe, expect, it } from "vitest";

import { CreateCanvasController } from "../../../../src/Features/Classification/Canvas/CreateCanvasController";
import { createAsyncArgumentRecorder } from "../../../Support/DependencyFactories";
import { TEST_PREDICTIONS, TEST_STROKE, TEST_EXTENDED_PREDICTIONS } from "../../../Support/TestData";
import { buildRequirementTitle } from "../../../Support/RequirementTest";

describe("CanvasInterface", () => {
  /**
   * Requirement: R3
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R3", "Unit", "Precondition", "canvas has at least one stroke"), async () => {
    const inferenceRecorder = createAsyncArgumentRecorder(TEST_PREDICTIONS.map(({ character, strokeCount, confidence }) => ({ character, strokeCount, confidence })));
    const controller = CreateCanvasController({
      requestDrawingInference: inferenceRecorder.handler
    });
    expect(() => {
      controller.clearCanvas();
    }).toThrow();
  });

  /**
   * Requirement: R3
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R3", "Unit", "Postcondition", "clears the stroke history when canvas has data"), async () => {
    const inferenceRecorder = createAsyncArgumentRecorder(TEST_PREDICTIONS.map(({ character, strokeCount, confidence }) => ({ character, strokeCount, confidence })));
    const controller = CreateCanvasController({
      requestDrawingInference: inferenceRecorder.handler
    });

    await controller.registerStroke(TEST_STROKE);
    controller.clearCanvas();

    expect(controller.getStrokeHistory()).toHaveLength(0, "CanvasInterface did not clear the stroke history.");
  });

  /**
   * Requirement: R4
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R4", "Unit", "Precondition", "canvas is not empty before clearing"), async () => {
    const inferenceRecorder = createAsyncArgumentRecorder(TEST_PREDICTIONS.map(({ character, strokeCount, confidence }) => ({ character, strokeCount, confidence })));
    const controller = CreateCanvasController({
      requestDrawingInference: inferenceRecorder.handler
    });

    await controller.registerStroke(TEST_STROKE);

    expect(() => {
      controller.clearCanvas();
    }).not.toThrow();
  });

  /**
   * Requirement: R4
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R4", "Unit", "Invariant", "clears canvas state without firing inference"), async () => {
    const inferenceRecorder = createAsyncArgumentRecorder(TEST_PREDICTIONS.map(({ character, strokeCount, confidence }) => ({ character, strokeCount, confidence })));
    const controller = CreateCanvasController({
      requestDrawingInference: inferenceRecorder.handler
    });

    await controller.registerStroke(TEST_STROKE);
    controller.clearCanvas();

    expect(inferenceRecorder.calls).toHaveLength(1, "CanvasInterface triggered an unexpected number of inference calls.");
  });

  /**
   * Requirement: R4
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R4", "Unit", "Postcondition", "stroke history is empty after clearing"), async () => {
    const inferenceRecorder = createAsyncArgumentRecorder(TEST_PREDICTIONS.map(({ character, strokeCount, confidence }) => ({ character, strokeCount, confidence })));
    const controller = CreateCanvasController({
      requestDrawingInference: inferenceRecorder.handler
    });

    await controller.registerStroke(TEST_STROKE);
    controller.clearCanvas();

    expect(controller.getStrokeHistory()).toHaveLength(0, "CanvasInterface kept residual drawing state after clearing.");
  });

  /**
     * Requirement: R5
     * Type: Unit
     * Condition: Precondition
     */
  it(buildRequirementTitle("R5", "Unit", "Precondition", "at least one stroke is registered in the canvas"), async () => {
    const inferenceRecorder = createAsyncArgumentRecorder(TEST_PREDICTIONS.map(({ character, strokeCount, confidence }) => ({ character, strokeCount, confidence })));
    const controller = CreateCanvasController({
      requestDrawingInference: inferenceRecorder.handler
    });

    await controller.registerStroke(TEST_STROKE);

    expect(controller.getStrokeHistory().length).toBeGreaterThan(0, "CanvasInterface did not register the stroke.");
  });

  /**
   * Requirement: R5
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R5", "Unit", "Invariant", "history only contains valid stroke objects and maintains insertion order"), async () => {
    const inferenceRecorder = createAsyncArgumentRecorder(TEST_PREDICTIONS.map(({ character, strokeCount, confidence }) => ({ character, strokeCount, confidence })));
    const controller = CreateCanvasController({
      requestDrawingInference: inferenceRecorder.handler
    });

    const secondStroke = { ...TEST_STROKE, points: [...TEST_STROKE.points, { x: 10, y: 10 }] };

    await controller.registerStroke(TEST_STROKE);
    await controller.registerStroke(secondStroke);

    const history = controller.getStrokeHistory();
    expect(history).toHaveLength(2, "CanvasInterface did not maintain the correct number of strokes.");
    expect(history[0]).toEqual(TEST_STROKE, "CanvasInterface altered the first stroke or failed to maintain order.");
    expect(history[1]).toEqual(secondStroke, "CanvasInterface altered the second stroke or failed to maintain order.");
  });

  /**
   * Requirement: R5
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R5", "Unit", "Postcondition", "stroke is correctly appended to the history"), async () => {
    const inferenceRecorder = createAsyncArgumentRecorder(TEST_PREDICTIONS.map(({ character, strokeCount, confidence }) => ({ character, strokeCount, confidence })));
    const controller = CreateCanvasController({
      requestDrawingInference: inferenceRecorder.handler
    });

    await controller.registerStroke(TEST_STROKE);

    expect(controller.getStrokeHistory()).toHaveLength(1, "CanvasInterface did not append the new stroke to history.");
  });
  /**
    * Requirement: R6
    * Type: Unit
    * Condition: Precondition
    */
  it(buildRequirementTitle("R6", "Unit", "Precondition", "returns at least one filtered prediction"), async () => {
    const inferenceRecorder = createAsyncArgumentRecorder([...TEST_EXTENDED_PREDICTIONS]);
    const controller = CreateCanvasController({
      requestDrawingInference: inferenceRecorder.handler
    });

    const predictions = await controller.registerStroke(TEST_STROKE);

    expect(predictions.length).toBeGreaterThan(0, "CanvasInterface returned no filtered predictions.");
  });

  /**
   * Requirement: R6
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R6", "Unit", "Invariant", "prediction list does not exceed five elements"), async () => {
    const inferenceRecorder = createAsyncArgumentRecorder([...TEST_EXTENDED_PREDICTIONS]);
    const controller = CreateCanvasController({
      requestDrawingInference: inferenceRecorder.handler
    });

    const predictions = await controller.registerStroke(TEST_STROKE);

    expect(predictions.length).toBeLessThanOrEqual(5, "CanvasInterface exceeded the visible prediction limit.");
  });

  /**
   * Requirement: R6
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R6", "Unit", "Postcondition", "filters predictions with the stroke-count rule"), async () => {
    const inferenceRecorder = createAsyncArgumentRecorder([...TEST_EXTENDED_PREDICTIONS]);
    const controller = CreateCanvasController({
      requestDrawingInference: inferenceRecorder.handler
    });

    const predictions = await controller.registerStroke(TEST_STROKE);
    const currentStrokeCount = controller.getStrokeHistory().length;

    expect(
      predictions.every((prediction) => Math.abs(prediction.strokeCount - currentStrokeCount) <= 1)
    ).toBe(true, "CanvasInterface produced predictions outside the stroke-count tolerance.");

    expect(predictions).toHaveLength(5, "CanvasInterface did not truncate the array to exactly 5 elements.");
  });

  /**
   * Requirement: R7
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R7", "Unit", "Precondition", "registers the stroke in history"), async () => {
    const inferenceRecorder = createAsyncArgumentRecorder(TEST_PREDICTIONS.map(({ character, strokeCount, confidence }) => ({ character, strokeCount, confidence })));
    const controller = CreateCanvasController({
      requestDrawingInference: inferenceRecorder.handler
    });

    await controller.registerStroke(TEST_STROKE);

    expect(controller.getStrokeHistory()).toHaveLength(1, "CanvasInterface did not keep the stroke that triggered inference.");
  });

  /**
   * Requirement: R7
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R7", "Unit", "Invariant", "does not execute inference without strokes"), async () => {
    const inferenceRecorder = createAsyncArgumentRecorder(TEST_PREDICTIONS.map(({ character, strokeCount, confidence }) => ({ character, strokeCount, confidence })));
    const controller = CreateCanvasController({
      requestDrawingInference: inferenceRecorder.handler
    });

    expect(inferenceRecorder.calls).toHaveLength(0, "CanvasInterface triggered inference without any strokes.");
  });

  /**
   * Requirement: R7
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R7", "Unit", "Postcondition", "runs exactly one inference per completed stroke"), async () => {
    const inferenceRecorder = createAsyncArgumentRecorder(TEST_PREDICTIONS.map(({ character, strokeCount, confidence }) => ({ character, strokeCount, confidence })));
    const controller = CreateCanvasController({
      requestDrawingInference: inferenceRecorder.handler
    });

    const secondStroke = { ...TEST_STROKE, points: [...TEST_STROKE.points, { x: 10, y: 10 }] };

    await controller.registerStroke(TEST_STROKE);
    expect(inferenceRecorder.calls).toHaveLength(1, "CanvasInterface did not schedule exactly one inference per stroke.");
    await controller.registerStroke(secondStroke);
    expect(inferenceRecorder.calls).toHaveLength(2, "CanvasInterface did not schedule exactly one inference per stroke.");
  });
});
