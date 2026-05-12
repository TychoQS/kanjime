import { screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CropOverlayView } from "../../../../src/Features/Classification/Image/CropOverlayView";
import { renderWithIonic } from "../../../Support/RenderWithIonic";
import { TEST_CROP } from "../../../Support/TestData";
import { buildRequirementTitle } from "../../../Support/RequirementTest";

describe("CropProps", () => {
  const defaultProps = {
    imageWidth: 1000,
    imageHeight: 1000,
    activeCrop: TEST_CROP,
    isVisible: true,
    onCropChanged: vi.fn(),
  };

  /**
   * Requirement: R14
   * Type: Unit
   * Condition: Precondition - invalid
   */
  it(buildRequirementTitle("R14", "Unit", "Precondition", "Violation: does not render any overlay when visibility is false"), () => {
    renderWithIonic(<CropOverlayView {...defaultProps} isVisible={false} />);
    expect(screen.queryByTestId("crop-overlay-view")).not.toBeInTheDocument();
  });

  /**
   * Requirement: R14
   * Type: Unit
   * Condition: Precondition - valid
   */
  it(buildRequirementTitle("R14", "Unit", "Precondition", "renders the crop overlay when visible and data is valid"), () => {
    renderWithIonic(<CropOverlayView {...defaultProps} />);
    const overlay = screen.getByTestId("crop-overlay-view");
    expect(overlay).toBeInTheDocument();
    expect(overlay).toBeVisible();
  });

  /**
   * Requirement: R14
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R14", "Unit", "Invariant", "uniqueness: only one active crop overlay exists at a time"), () => {
    const { rerender } = renderWithIonic(<CropOverlayView {...defaultProps} />);
    expect(screen.getAllByTestId("crop-overlay-view")).toHaveLength(1);

    const newCrop = { ...TEST_CROP, x: 50, y: 50 };
    rerender(<CropOverlayView {...defaultProps} activeCrop={newCrop} />);

    expect(screen.getAllByTestId("crop-overlay-view")).toHaveLength(1);
  });

  /**
   * Requirement: R14
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R14", "Unit", "Postcondition", "the active crop is visually rendered over the image and matches current coordinates"), () => {
    const activeCrop = { x: 10, y: 10, width: 20, height: 20 };
    renderWithIonic(<CropOverlayView {...defaultProps} activeCrop={activeCrop} />);

    const overlay = screen.getByTestId("crop-overlay-view");
    
    expect(overlay).toBeVisible();
    const cropBox = within(overlay).getByTestId("active-crop-box");
    expect(cropBox).toBeInTheDocument();
    expect(cropBox).toBeVisible();

    expect(overlay).toHaveAttribute("data-crop-x", "10");
    expect(overlay).toHaveAttribute("data-crop-y", "10");
  });
});
