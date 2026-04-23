import { describe, expect, it } from "vitest";

import { CreateClassificationController } from "../../../../src/Features/Classification/Mode/CreateClassificationController";
import { createVoidArgumentRecorder } from "../../../Support/DependencyFactories";
import { buildRequirementTitle } from "../../../Support/RequirementTest";

describe("ClassificationInterface", () => {

  /**
   * Requirement: R39
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R39", "Unit", "Invariant", "only one mode can be active at a time"), () => {
    const modeRecorder = createVoidArgumentRecorder<"image" | "drawing">();
    const controller = CreateClassificationController({
      onModeChanged: modeRecorder.handler
    });

    controller.activateMode("image");
    controller.activateMode("drawing");

    expect(controller.getActiveMode()).toBe("drawing",
      "ClassificationInterface did not set the new mode as active."
    );
    expect(controller.getActiveMode()).not.toBe("image",
      "ClassificationInterface kept the previous mode active simultaneously."
    );
  });

  /**
   * Requirement: R39
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R39", "Unit", "Postcondition", "keeps only the selected classification mode active"), () => {
    const modeRecorder = createVoidArgumentRecorder<"image" | "drawing">();
    const controller = CreateClassificationController({
      onModeChanged: modeRecorder.handler
    });

    controller.activateMode("drawing");

    expect(modeRecorder.calls).toEqual(["drawing"], "ClassificationInterface did not forward the requested mode change.");
    expect(controller.getActiveMode()).toBe("drawing", "ClassificationInterface kept an unexpected active mode.");
  });
});
