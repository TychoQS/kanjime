import { describe, expect, it } from "vitest";

import { CreateModelLoaderController } from "../../../../src/Features/Classification/Inference/CreateModelLoaderController";
import { createAsyncValueRecorder } from "../../../Support/DependencyFactories";
import { TEST_IMAGE } from "../../../Support/TestData";
import { buildRequirementTitle } from "../../../Support/RequirementTest";

describe("ModelLoaderInterface", () => {
  /**
   * Requirement: R1
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R1", "Unit", "Invariant", "loads the inference model once per session"), async () => {
    const initializerRecorder = createAsyncValueRecorder({
      inputWidth: TEST_IMAGE.width,
      inputHeight: TEST_IMAGE.height,
      isLoaded: true
    });
    const controller = CreateModelLoaderController({
      initializeModelRuntime: initializerRecorder.handler
    });

    await controller.loadModel();
    await controller.loadModel();

    expect(initializerRecorder.calls).toHaveLength(1, "ModelLoaderInterface initialized the model runtime an unexpected number of times.");
    expect(controller.isModelReady()).toBe(true, "ModelLoaderInterface did not report a ready model.");
    expect(controller.getModelConfiguration().inputWidth).toBe(
      TEST_IMAGE.width,
      "ModelLoaderInterface returned an unexpected input width."
    );
  });
});
