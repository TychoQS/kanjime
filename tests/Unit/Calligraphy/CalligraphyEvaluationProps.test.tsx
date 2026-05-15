import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CalligraphyEvaluationView } from "../../../src/Features/Calligraphy/View/CalligraphyEvaluationView";
import type { CalligraphyEvaluationProps } from "../../../src/Features/Calligraphy/Contracts/CalligraphyEvaluationProps";

const PROPS: CalligraphyEvaluationProps = {
  feedback: {
    score: 82,
    summary: "The attempt is recognizable.",
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
    expect(screen.getByText("82")).toBeVisible();
    expect(screen.getByText("The attempt is recognizable.")).toBeVisible();
  });
});
