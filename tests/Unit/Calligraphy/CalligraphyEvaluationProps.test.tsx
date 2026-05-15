import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CalligraphyEvaluationView } from "../../../src/Features/Calligraphy/View/CalligraphyEvaluationView";
import type { CalligraphyEvaluationProps } from "../../../src/Features/Calligraphy/Contracts/CalligraphyEvaluationProps";
import {
  TEST_CALLIGRAPHY_EVALUATION_SCORE,
  TEST_CALLIGRAPHY_EVALUATION_SUMMARY
} from "../../Support/TestData";

const PROPS: CalligraphyEvaluationProps = {
  feedback: {
    score: TEST_CALLIGRAPHY_EVALUATION_SCORE,
    summary: TEST_CALLIGRAPHY_EVALUATION_SUMMARY,
    isOverlayVisible: true
  },
  onDismissRequested: () => undefined
};

/**
 * Requirement: R22
 * Type: Unit
 * Condition: Invariant and Postcondition
 */
describe("CalligraphyEvaluationProps", () => {
  it("renders evaluation feedback as an overlay with score and summary", () => {
    render(<CalligraphyEvaluationView {...PROPS} />);

    expect(screen.getByTestId("calligraphy-evaluation-overlay")).toBeVisible();
    expect(screen.getByText(String(TEST_CALLIGRAPHY_EVALUATION_SCORE))).toBeVisible();
    expect(screen.getByText(TEST_CALLIGRAPHY_EVALUATION_SUMMARY)).toBeVisible();
  });
});
