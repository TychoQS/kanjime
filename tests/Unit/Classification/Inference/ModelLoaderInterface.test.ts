import { describe, expect, it } from "vitest";

import { CreateModelLoaderController } from "../../../../src/Features/Classification/Inference/CreateModelLoaderController";
import { createAsyncValueRecorder } from "../../../Support/DependencyFactories";
import { TEST_IMAGE } from "../../../Support/TestData";
import { buildRequirementTitle } from "../../../Support/RequirementTest";

describe("ModelLoaderInterface", () => {
  /**
   * Requirement: R1
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R1", "Unit", "Precondition", "model is not yet loaded before calling loadModel"), async () => {
    const initializerRecorder = createAsyncValueRecorder({
      inputWidth: TEST_IMAGE.width,
      inputHeight: TEST_IMAGE.height,
      isLoaded: true
    });
    const controller = CreateModelLoaderController({
      initializeModelRuntime: initializerRecorder.handler
    });

    expect(controller.isModelReady()).toBe(false,
      "ModelLoaderInterface reported a ready model before it was loaded."
    );
    expect(controller.getModelConfiguration().isLoaded).toBe(false,
      "ModelLoaderInterface reported a loaded configuration before initialization."
    );
  });

  /**
   * Requirement: R1
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R1", "Unit", "Invariant", "model is initialized at most once per session"), async () => {
    const firstRecorder = createAsyncValueRecorder({
      inputWidth: TEST_IMAGE.width,
      inputHeight: TEST_IMAGE.height,
      isLoaded: true
    });
    const controller = CreateModelLoaderController({
      initializeModelRuntime: firstRecorder.handler
    });

    await controller.loadModel();
    await controller.loadModel();
    await controller.loadModel();

    expect(firstRecorder.calls).toHaveLength(1,
      "ModelLoaderInterface initialized the model runtime more than once during a session."
    );
  });

  /**
   * Requirement: R1
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R1", "Unit", "Postcondition", "model is ready and configured after loading"), async () => {
    const initializerRecorder = createAsyncValueRecorder({
      inputWidth: TEST_IMAGE.width,
      inputHeight: TEST_IMAGE.height,
      isLoaded: true
    });
    const controller = CreateModelLoaderController({
      initializeModelRuntime: initializerRecorder.handler
    });

    await controller.loadModel();

    expect(controller.isModelReady()).toBe(true,
      "ModelLoaderInterface did not report a ready model after loading."
    );
    expect(controller.getModelConfiguration().isLoaded).toBe(true,
      "ModelLoaderInterface did not set isLoaded after loading."
    );
    expect(controller.getModelConfiguration().inputWidth).toBe(
      TEST_IMAGE.width,
      "ModelLoaderInterface returned an unexpected input width after loading."
    );
    expect(controller.getModelConfiguration().inputHeight).toBe(
      TEST_IMAGE.height,
      "ModelLoaderInterface returned an unexpected input height after loading."
    );
  });
});
