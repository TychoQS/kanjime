import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CalligraphyEvaluationView } from "../../../src/Features/Calligraphy/View/CalligraphyEvaluationView";
import type { CalligraphyEvaluationProps } from "../../../src/Features/Calligraphy/Contracts/CalligraphyEvaluationProps";
import {
  TEST_CALLIGRAPHY_EVALUATION_SCORE,
  TEST_CALLIGRAPHY_EVALUATION_SUMMARY
} from "../../Support/TestData";
import {buildRequirementTitle} from "../../Support/RequirementTest";
import {renderWithIonic} from "../../Support/RenderWithIonic";

const defaultProps: CalligraphyEvaluationProps = {
  feedback: {
    score: TEST_CALLIGRAPHY_EVALUATION_SCORE,
    summary: TEST_CALLIGRAPHY_EVALUATION_SUMMARY,
    isOverlayVisible: true
  },
  onDismissRequested: vi.fn()
};

describe("CalligraphyEvaluationProps", () => {

  /**
   * Requirement: R22
   * Type: Unit
   * Condition: Precondition – valid
   */
  it(buildRequirementTitle("R22", "Unit", "Precondition", "renders evaluation overlay when feedback is available"), () => {
    renderWithIonic(<CalligraphyEvaluationView {...defaultProps} />);

    expect(screen.getByTestId("calligraphy-evaluation-overlay")).toBeVisible();
  });

  /**
   * Requirement: R22
   * Type: Unit
   * Condition: Precondition – invalid
   */
  it(buildRequirementTitle("R22", "Unit", "Precondition", "Violation: does not render evaluation overlay when isOverlayVisible is false"), () => {
    renderWithIonic(
        <CalligraphyEvaluationView
            {...defaultProps}
            feedback={{ ...defaultProps.feedback, isOverlayVisible: false }}
        />
    );

    expect(screen.queryByTestId("calligraphy-evaluation-overlay")).not.toBeVisible();
  });

  /**
   * Requirement: R22
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R22", "Unit", "Invariant", "feedback overlay remains visible over the practice screen"), () => {
    renderWithIonic(<CalligraphyEvaluationView {...defaultProps} />);

    const overlay = screen.getByTestId("calligraphy-evaluation-overlay");

    expect(overlay).toBeVisible();
    expect(screen.getByTestId("calligraphy-practice-screen")).toBeInTheDocument();
    expect(overlay).not.toEqual(screen.getByTestId("calligraphy-practice-screen"));
  });

  /**
   * Requirement: R22
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R22", "Unit", "Postcondition", "shows score and summary as understandable visual feedback"), () => {
    renderWithIonic(<CalligraphyEvaluationView {...defaultProps} />);

    const overlay = screen.getByTestId("calligraphy-evaluation-overlay");

    expect(overlay).toBeVisible();
    expect(screen.getByText(String(TEST_CALLIGRAPHY_EVALUATION_SCORE))).toBeVisible();
    expect(screen.getByText(TEST_CALLIGRAPHY_EVALUATION_SUMMARY)).toBeVisible();
  });
});
