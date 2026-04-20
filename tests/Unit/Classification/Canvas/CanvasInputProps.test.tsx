import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CanvasInputView } from "../../../../src/Features/Classification/Canvas/CanvasInputView";
import { renderWithIonic } from "../../../Support/RenderWithIonic";
import { TEST_STROKE } from "../../../Support/TestData";
import { buildRequirementTitle } from "../../../Support/RequirementTest";

describe("CanvasInputProps", () => {
  /**
   * Requirement: R1
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R1", "Unit", "Invariant", "renders distinguishable drawing content"), () => {
    renderWithIonic(
      <CanvasInputView
        backgroundColor="#000000"
        strokeColor="#ffffff"
        isDrawingEnabled={true}
        strokes={[TEST_STROKE]}
        onStrokeCommitted={() => undefined}
        onClearRequested={() => undefined}
      />
    );

    expect(screen.getByText("#000000")).toBeInTheDocument();
    expect(screen.getByText("#ffffff")).toBeInTheDocument();
  });
});
