import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CalligraphyEvaluationView } from "../../../src/Features/Calligraphy/View/CalligraphyEvaluationView";
import { renderWithIonic } from "../../Support/RenderWithIonic";
import { buildRequirementTitle } from "../../Support/RequirementTest";
import {
  TEST_CALLIGRAPHY_EVALUATION_FEEDBACK,
  TEST_CALLIGRAPHY_EVALUATION_METRICS,
  TEST_CALLIGRAPHY_VISUAL_COMPARISON
} from "../../Support/TestData";

describe("CalligraphyEvaluationProps requirements", () => {
  const baseProps = {
    feedback: TEST_CALLIGRAPHY_EVALUATION_FEEDBACK,
    comparison: TEST_CALLIGRAPHY_VISUAL_COMPARISON,
    metrics: TEST_CALLIGRAPHY_EVALUATION_METRICS,
    onDismissRequested: vi.fn()
  } as const;

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
