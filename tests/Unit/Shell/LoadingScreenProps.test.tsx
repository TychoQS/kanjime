import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LoadingScreenView } from "../../../src/Features/Shell/LoadingScreenView";
import { renderWithIonic } from "../../Support/RenderWithIonic";
import { buildRequirementTitle } from "../../Support/RequirementTest";

describe("LoadingScreenProps", () => {
  const defaultProps = {
    isVisible: true,
    message: "Loading...",
    blocksInteraction: true,
  };

  /**
   * Requirement: R7
   * Type: Unit
   * Condition: Precondition - invalid
   */
  it(buildRequirementTitle("R7", "Unit", "Precondition", "Violation: does not render when no active process is ongoing"), () => {
    renderWithIonic(<LoadingScreenView {...defaultProps} isVisible={false} />);
    expect(screen.queryByTestId("loading-screen-view")).not.toBeInTheDocument();
  });

  /**
   * Requirement: R7
   * Type: Unit
   * Condition: Precondition - valid
   */
  it(buildRequirementTitle("R7", "Unit", "Precondition", "successfully renders when an active blocking process is detected"), () => {
    renderWithIonic(<LoadingScreenView {...defaultProps} />);
    expect(screen.getByTestId("loading-screen-view")).toBeInTheDocument();
    expect(screen.getByText(defaultProps.message)).toBeInTheDocument();
  });

  /**
   * Requirement: R7
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R7", "Unit", "Invariant", "user interaction is strictly blocked while the loading screen is visible"), () => {
    renderWithIonic(<LoadingScreenView {...defaultProps} blocksInteraction={true} />);
    const overlay = screen.getByTestId("loading-screen-view");

    expect(overlay).toHaveAttribute("aria-busy", "true");
  });

  /**
   * Requirement: R7
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R7", "Unit", "Postcondition", "renders a visible and accessible loading indicator for the user"), () => {
    renderWithIonic(<LoadingScreenView {...defaultProps} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });
});
