import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CalligraphyEvaluationView } from "../../../src/Features/Calligraphy/View/CalligraphyEvaluationView";
import type { CalligraphyEvaluationProps } from "../../../src/Features/Calligraphy/Contracts/CalligraphyEvaluationProps";
import {
  TEST_CALLIGRAPHY_EVALUATION_FEEDBACK, TEST_CALLIGRAPHY_EVALUATION_METRICS,
  TEST_CALLIGRAPHY_EVALUATION_SCORE,
  TEST_CALLIGRAPHY_EVALUATION_SUMMARY, TEST_CALLIGRAPHY_VISUAL_COMPARISON
} from "../../Support/TestData";
import { buildRequirementTitle } from "../../Support/RequirementTest";
import { renderWithIonic } from "../../Support/RenderWithIonic";

const defaultProps: CalligraphyEvaluationProps = {
  feedback: {
    score: TEST_CALLIGRAPHY_EVALUATION_SCORE,
    summary: TEST_CALLIGRAPHY_EVALUATION_SUMMARY,
    isOverlayVisible: true
  },
  onDismissRequested: vi.fn()
};

describe("CalligraphyEvaluationProps", () => {

  const baseProps = {
    feedback: TEST_CALLIGRAPHY_EVALUATION_FEEDBACK,
    comparison: TEST_CALLIGRAPHY_VISUAL_COMPARISON,
    metrics: TEST_CALLIGRAPHY_EVALUATION_METRICS,
    onDismissRequested: vi.fn()
  } as const;

  /**
   * Requirement: R22
   * Type: Unit
   * Condition: Precondition – valid
   */
  it(buildRequirementTitle("R22", "Unit", "Precondition", "renders evaluation overlay when feedback is available"), () => {
    renderWithIonic(<CalligraphyEvaluationView {...defaultProps} />);

    expect(screen.getByTestId("calligraphy-evaluation-overlay"), "CalligraphyEvaluationView didn't render the evaluation overlay.").toBeVisible();
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

    expect(screen.queryByTestId("calligraphy-evaluation-overlay"), "CalligraphyEvaluationView didn't hide the evaluation overlay.").not.toBeVisible();
  });

  /**
   * Requirement: R22
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R22", "Unit", "Invariant", "feedback overlay remains visible over the practice screen"), () => {
    renderWithIonic(<CalligraphyEvaluationView {...defaultProps} />);

    const overlay = screen.getByTestId("calligraphy-evaluation-overlay");

    expect(overlay, "CalligraphyEvaluationView didn't render the evaluation overlay.").toBeVisible();
    expect(screen.getByTestId("calligraphy-practice-screen"), "CalligraphyEvaluationView didn't render the evaluation overlay over the practice screen.").toBeInTheDocument();
    expect(overlay, "CalligraphyEvaluationView didn't render the evaluation overlay over the practice screen.").not.toEqual(screen.getByTestId("calligraphy-practice-screen"));
  });

  /**
   * Requirement: R22
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R22", "Unit", "Postcondition", "shows score and summary as understandable visual feedback"), () => {
    renderWithIonic(<CalligraphyEvaluationView {...defaultProps} />);

    const overlay = screen.getByTestId("calligraphy-evaluation-overlay");

    expect(overlay, "CalligraphyEvaluationView didn't render the evaluation overlay.").toBeVisible();
    expect(screen.getByText(String(TEST_CALLIGRAPHY_EVALUATION_SCORE)), "CalligraphyEvaluationView didn't show the evaluation score.").toBeVisible();
    expect(screen.getByText(TEST_CALLIGRAPHY_EVALUATION_SUMMARY), "CalligraphyEvaluationView didn't show the evaluation summary.").toBeVisible();
  });

  /**
   * Requirement R30 - Precondition (valid):
   * an evaluation with reference, attempt, and metrics should render the comparison block.
   */
  it(buildRequirementTitle("R30", "Unit", "Precondition", "evaluation props render the top comparison block"), () => {
    renderWithIonic(<CalligraphyEvaluationView {...baseProps} />);

    expect(
        screen.queryByTestId("calligraphy-visual-comparison"),
        "R30 valid precondition should render a visual comparison block when comparison data and metrics exist."
    ).not.toBeNull();
  });

  /**
   * Requirement R30 - Precondition (invalid):
   * missing comparison data should prevent the evaluation props from being considered complete.
   */
  it(buildRequirementTitle("R30", "Unit", "Precondition", "missing comparison data is rejected"), () => {
    expect(
        () => renderWithIonic(<CalligraphyEvaluationView {...baseProps} comparison={null} />),
        "R30 invalid precondition should reject evaluation props that omit the comparison block data."
    ).toThrow("comparison");
  });

  /**
   * Requirement R30 - Invariant:
   * the comparison block should stay above the metrics block.
   */
  it(buildRequirementTitle("R30", "Unit", "Invariant", "the comparison block stays above the metric breakdown"), () => {
    renderWithIonic(<CalligraphyEvaluationView {...baseProps} />);

    const comparisonBlock = screen.queryByTestId("calligraphy-visual-comparison");
    const metricBlock = screen.queryByTestId("calligraphy-metric-list");

    expect(
        comparisonBlock,
        "R30 invariant should render the visual comparison block."
    ).not.toBeNull();
    expect(
        metricBlock,
        "R30 invariant should render the evaluation metric breakdown."
    ).not.toBeNull();
    expect(
        Boolean(
            comparisonBlock &&
            metricBlock &&
            comparisonBlock.compareDocumentPosition(metricBlock) & Node.DOCUMENT_POSITION_FOLLOWING
        ),
        "R30 invariant should keep the comparison block above the metric breakdown."
    ).toBe(true);
  });

  /**
   * Requirement R30 - Postcondition:
   * the user should see the comparison and the metric breakdown simultaneously.
   */
  it(buildRequirementTitle("R30", "Unit", "Postcondition", "the user sees the comparison and the metric breakdown together"), () => {
    renderWithIonic(<CalligraphyEvaluationView {...baseProps} />);

    expect(
        screen.queryByTestId("calligraphy-reference-visual"),
        "R30 postcondition should show the rendered reference visual."
    ).not.toBeNull();
    expect(
        screen.queryByTestId("calligraphy-attempt-visual"),
        "R30 postcondition should show the rendered attempt visual."
    ).not.toBeNull();
    expect(
        screen.queryByTestId("calligraphy-metric-list"),
        "R30 postcondition should show the evaluation metric breakdown together with the comparison."
    ).not.toBeNull();
  });

});
