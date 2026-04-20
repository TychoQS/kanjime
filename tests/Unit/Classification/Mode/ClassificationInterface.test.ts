import { describe, expect, it } from "vitest";

import { CreateClassificationController } from "../../../../src/Features/Classification/Mode/CreateClassificationController";
import { createVoidArgumentRecorder } from "../../../Support/DependencyFactories";
import { buildRequirementTitle } from "../../../Support/RequirementTest";

describe("ClassificationInterface", () => {
  /**
   * Requirement: R39
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
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
