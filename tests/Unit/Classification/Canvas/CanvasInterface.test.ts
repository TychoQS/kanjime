import { describe, expect, it } from "vitest";

import { CreateCanvasController } from "../../../../src/Features/Classification/Canvas/CreateCanvasController";
import { createAsyncArgumentRecorder } from "../../../Support/DependencyFactories";
import { TEST_PREDICTIONS, TEST_STROKE } from "../../../Support/TestData";
import { buildRequirementTitle } from "../../../Support/RequirementTest";

describe("CanvasInterface", () => {
  /**
   * Requirement: R3
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R3", "Unit", "Postcondition", "clears a canvas with existing strokes"), async () => {
    const inferenceRecorder = createAsyncArgumentRecorder(TEST_PREDICTIONS.map(({ character, strokeCount }) => ({ character, strokeCount })));
    const controller = CreateCanvasController({
      requestDrawingInference: inferenceRecorder.handler
    });

    await controller.registerStroke(TEST_STROKE);
    controller.clearCanvas();

    expect(controller.getStrokeHistory().length).toBeGreaterThan(0, "CanvasInterface did not retain the pre-clear stroke.");
    expect(controller.getStrokeHistory()).toHaveLength(0, "CanvasInterface did not clear the stroke history.");
  });

  /**
   * Requirement: R4
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R4", "Unit", "Invariant", "clears canvas state without firing inference"), async () => {
    const inferenceRecorder = createAsyncArgumentRecorder(TEST_PREDICTIONS.map(({ character, strokeCount }) => ({ character, strokeCount })));
    const controller = CreateCanvasController({
      requestDrawingInference: inferenceRecorder.handler
    });

    await controller.registerStroke(TEST_STROKE);
    controller.clearCanvas();

    expect(inferenceRecorder.calls).toHaveLength(1, "CanvasInterface triggered an unexpected number of inference calls.");
    expect(controller.getStrokeHistory()).toHaveLength(0, "CanvasInterface kept residual drawing state after clearing.");
  });

  /**
   * Requirement: R5
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R5", "Unit", "Postcondition", "stores each stroke in the history"), async () => {
    const inferenceRecorder = createAsyncArgumentRecorder(TEST_PREDICTIONS.map(({ character, strokeCount }) => ({ character, strokeCount })));
    const controller = CreateCanvasController({
      requestDrawingInference: inferenceRecorder.handler
    });

    await controller.registerStroke(TEST_STROKE);

    expect(controller.getStrokeHistory()).toHaveLength(1, "CanvasInterface did not append the new stroke to history.");
    expect(controller.getStrokeHistory()[0]).toEqual(TEST_STROKE, "CanvasInterface stored an unexpected stroke payload.");
  });

  /**
   * Requirement: R6
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R6", "Unit", "Invariant", "filters predictions with the stroke-count rule"), async () => {
    const inferenceRecorder = createAsyncArgumentRecorder(TEST_PREDICTIONS.map(({ character, strokeCount }) => ({ character, strokeCount })));
    const controller = CreateCanvasController({
      requestDrawingInference: inferenceRecorder.handler
    });

    const predictions = await controller.registerStroke(TEST_STROKE);

    expect(predictions.length).toBeGreaterThan(0, "CanvasInterface returned no filtered predictions.");
    expect(predictions.length).toBeLessThanOrEqual(5, "CanvasInterface exceeded the visible prediction limit.");
    expect(
      predictions.every((prediction) => Math.abs(prediction.strokeCount - TEST_STROKE.points.length) <= 1)
    ).toBe(true, "CanvasInterface produced predictions outside the stroke-count tolerance.");
  });

  /**
   * Requirement: R7
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R7", "Unit", "Postcondition", "runs exactly one inference per completed stroke"), async () => {
    const inferenceRecorder = createAsyncArgumentRecorder(TEST_PREDICTIONS.map(({ character, strokeCount }) => ({ character, strokeCount })));
    const controller = CreateCanvasController({
      requestDrawingInference: inferenceRecorder.handler
    });

    await controller.registerStroke(TEST_STROKE);

    expect(inferenceRecorder.calls).toHaveLength(1, "CanvasInterface did not schedule exactly one inference.");
    expect(controller.getStrokeHistory()).toHaveLength(1, "CanvasInterface did not keep the stroke that triggered inference.");
  });
});
