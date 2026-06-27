import { describe, expect, it } from "vitest";

import { CreateToggleClassificationModeController } from "../../../../src/Features/Classification/Mode/CreateToggleClassificationModeController";
import { createVoidArgumentRecorder } from "../../../Support/DependencyFactories";
import { buildRequirementTitle } from "../../../Support/RequirementTest";

describe("ToggleClassificationModeInterface", () => {
  /**
 * Requirement: R36
 * Type: Unit
 * Condition: Precondition - valid
 */
  it(buildRequirementTitle("R36", "Unit", "Precondition", "accepts a valid mode to switch to"), () => {
    const clearRecorder = createVoidArgumentRecorder<"image" | "drawing">();
    const controller = CreateToggleClassificationModeController({
      clearCurrentModeState: clearRecorder.handler
    });

    expect(() => controller.switchMode("drawing")).not.toThrow(
      "ToggleClassificationModeInterface rejected a valid mode."
    );
  });

  /**
   * Requirement: R36
   * Type: Unit
   * Condition: Precondition - invalid
   */
  it(buildRequirementTitle("R36", "Unit", "Precondition", "rejects an invalid mode"), () => {
    const clearRecorder = createVoidArgumentRecorder<"image" | "drawing">();
    const controller = CreateToggleClassificationModeController({
      clearCurrentModeState: clearRecorder.handler
    });

    expect(() => controller.switchMode("invalid" as any)).toThrow(
      "ToggleClassificationModeInterface accepted an invalid mode."
    );
  });

  it(buildRequirementTitle("R36", "Unit", "Postcondition", "correctly toggles and clears states in both directions"), () => {
    const clearRecorder = createVoidArgumentRecorder<"image" | "drawing">();
    const controller = CreateToggleClassificationModeController({
      clearCurrentModeState: clearRecorder.handler
    });

    controller.switchMode("drawing");
    expect(clearRecorder.calls).toEqual(["image"],
      "Failed to clear 'image' state when switching to 'drawing'."
    );

    clearRecorder.calls.length = 0;
    controller.switchMode("image");
    expect(clearRecorder.calls).toEqual(["drawing"],
      "Failed to clear 'drawing' state when switching back to 'image'."
    );
  });

});
