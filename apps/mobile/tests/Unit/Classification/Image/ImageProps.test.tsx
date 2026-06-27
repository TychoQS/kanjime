import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ImageView } from "../../../../src/Features/Classification/Image/ImageView";
import { renderWithIonic } from "../../../Support/RenderWithIonic";
import { TEST_IMAGE } from "../../../Support/TestData";
import { buildRequirementTitle } from "../../../Support/RequirementTest";

describe("ImageProps", () => {
  const defaultProps = {
    image: {
      uri: TEST_IMAGE.uri,
      width: TEST_IMAGE.width,
      height: TEST_IMAGE.height,
      altText: "Test Image"
    },
    isProcessing: false,
    onClearImage: vi.fn(),
  };

  /**
   * Requirement: R13
   * Type: Unit
   * Condition: Precondition - invalid
   */
  it(buildRequirementTitle("R13", "Unit", "Precondition", "Violation: does not render an image element if the resource is null"), () => {
    renderWithIonic(<ImageView {...defaultProps} image={null} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  /**
   * Requirement: R13
   * Type: Unit
   * Condition: Precondition - valid
   */
  it(buildRequirementTitle("R13", "Unit", "Precondition", "renders the image with the correct source when provided"), () => {
    renderWithIonic(<ImageView {...defaultProps} />);
    const img = screen.getByRole("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", TEST_IMAGE.uri);
  });

  /**
   * Requirement: R13
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R13", "Unit", "Invariant", "the image maintains its proportional scaling properties (object-fit) during the inference lifecycle"), () => {
    const { rerender } = renderWithIonic(<ImageView {...defaultProps} isProcessing={false} />);
    const img = screen.getByRole("img");

    expect(img).toHaveStyle({ objectFit: "contain" });

    rerender(<ImageView {...defaultProps} isProcessing={true} />);
    expect(img).toHaveStyle({ objectFit: "contain" });

    rerender(<ImageView {...defaultProps} isProcessing={false} />);
    expect(img).toHaveStyle({ objectFit: "contain" });
  });

  /**
   * Requirement: R13
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R13", "Unit", "Postcondition", "renders a visible, responsive image that fills the available display area proportionally"), () => {
    renderWithIonic(<ImageView {...defaultProps} />);
    const img = screen.getByRole("img");

    expect(img).toBeInTheDocument();
    expect(img).toBeVisible();
    expect(img).toHaveAttribute("src", TEST_IMAGE.uri);

    expect(img).toHaveStyle({ width: "100%", height: "100%" });
  });

  /**
   * Requirement: R16
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R16", "Unit", "Precondition", "clear button is visible when an image is loaded"), () => {
    renderWithIonic(<ImageView {...defaultProps} />);
    expect(screen.getByRole("button", { name: /clear|remove|close/i })).toBeInTheDocument();
  });

  /**
   * Requirement: R16
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R16", "Unit", "Postcondition", "image is removed from view after clear action"), async () => {
    const user = userEvent.setup();
    const onClearImage = vi.fn();

    const { rerender } = renderWithIonic(<ImageView {...defaultProps} onClearImage={onClearImage} />);

    const clearButton = screen.getByRole("button", { name: /clear|remove|close/i });
    await user.click(clearButton);

    expect(onClearImage).toHaveBeenCalled();

    rerender(<ImageView {...defaultProps} image={null} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
