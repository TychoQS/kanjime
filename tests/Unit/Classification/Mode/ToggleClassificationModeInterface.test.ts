import { describe, expect, it } from "vitest";

import { CreateToggleClassificationModeController } from "../../../../src/Features/Classification/Mode/CreateToggleClassificationModeController";
import { createVoidArgumentRecorder } from "../../../Support/DependencyFactories";
import { buildRequirementTitle } from "../../../Support/RequirementTest";

describe("ToggleClassificationModeInterface", () => {
  /**
   * Requirement: R36
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R36", "Unit", "Postcondition", "clears the previous OCR mode state when switching"), () => {
    const clearRecorder = createVoidArgumentRecorder<"image" | "drawing">();
    const controller = CreateToggleClassificationModeController({
      clearCurrentModeState: clearRecorder.handler
    });

    controller.switchMode("drawing");

    expect(clearRecorder.calls).toEqual(["drawing"], "ToggleClassificationModeInterface did not clear the previous mode state.");
  });
});
