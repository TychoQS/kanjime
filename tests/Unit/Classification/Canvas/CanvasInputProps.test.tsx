import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CanvasInputView } from "../../../../src/Features/Classification/Canvas/CanvasInputView";
import { renderWithIonic } from "../../../Support/RenderWithIonic";
import {
  TEST_CANVAS_CUSTOM_BG,
  TEST_CANVAS_CUSTOM_STROKE,
  WCAG_AAA_CONTRAST_THRESHOLD,
  TEST_CANVAS_PROPS
} from "../../../Support/TestData";
import { buildRequirementTitle } from "../../../Support/RequirementTest";
import { getContrast } from "polished";

describe("CanvasInputProps", () => {
  const defaultProps = {
    ...TEST_CANVAS_PROPS,
    onStrokeCommitted: vi.fn(),
    onClearRequested: vi.fn(),
  };

  /**
   * Requirement: R1
   * Type: Unit
   * Condition: Precondition - invalid
   */
  it(buildRequirementTitle("R1", "Unit", "Precondition", "Violation: does not render the canvas when drawing mode is inactive"), () => {
    renderWithIonic(<CanvasInputView {...defaultProps} isDrawingEnabled={false} />);
    const container = screen.queryByTestId("canvas-container");
    expect(container).not.toBeInTheDocument();
  });

  /**
   * Requirement: R1
   * Type: Unit
   * Condition: Precondition - valid
   */
  it(buildRequirementTitle("R1", "Unit", "Precondition", "renders the canvas element when drawing mode is active"), () => {
    renderWithIonic(<CanvasInputView {...defaultProps} isDrawingEnabled={true} />);
    expect(screen.getByRole("presentation", { hidden: true })).toBeInTheDocument();
  });

  /**
   * Requirement: R1
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R1", "Unit", "Invariant", "background and stroke colors remain constant in the DOM during rendering cycles"), () => {
    const customProps = { ...defaultProps, backgroundColor: TEST_CANVAS_CUSTOM_BG, strokeColor: TEST_CANVAS_CUSTOM_STROKE };
    const { rerender } = renderWithIonic(<CanvasInputView {...customProps} />);

    const canvas = screen.getByLabelText(/drawing area/i);

    expect(canvas.getAttribute("data-background")).toBe(TEST_CANVAS_CUSTOM_BG);

    rerender(<CanvasInputView {...customProps} strokes={[]} />);
    expect(canvas.getAttribute("data-background")).toBe(TEST_CANVAS_CUSTOM_BG);
  });

  /**
   * Requirement: R1
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R1", "Unit", "Postcondition", "ensures background and stroke colors applied to the DOM have sufficient contrast"), () => {
    renderWithIonic(<CanvasInputView {...defaultProps} />);
    const canvas = screen.getByLabelText(/drawing area/i);

    const bg = canvas.getAttribute("data-background");
    const stroke = canvas.getAttribute("data-stroke");

    if (!bg || !stroke) {
      throw new Error("Canvas elements must expose background and stroke via data attributes for contrast verification.");
    }

    const contrastRatio = getContrast(bg, stroke);
    expect(contrastRatio).toBeGreaterThan(WCAG_AAA_CONTRAST_THRESHOLD);
  });
});
