import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CalligraphyPracticeView } from "../../../src/Features/Calligraphy/View/CalligraphyPracticeView";
import type { CalligraphyPracticeProps } from "../../../src/Features/Calligraphy/Contracts/CalligraphyPracticeProps";

const PROPS: CalligraphyPracticeProps = {
  targetCharacter: "水",
  strokes: [],
  canReset: false,
  canValidate: false,
  onBackRequested: () => undefined,
  onResetRequested: () => undefined,
  onValidateRequested: () => undefined
};

/**
 * Requirement: R19
 * Type: Unit
 * Condition: Invariant and Postcondition
 */
describe("CalligraphyPracticeProps", () => {
  it("renders the canvas as the primary practice element", () => {
    render(<CalligraphyPracticeView {...PROPS} />);

    expect(screen.getByTestId("calligraphy-practice-canvas")).toBeVisible();
  });

  /**
   * Requirement: R20
   * Type: Unit
   * Condition: Invariant and Postcondition
   */
  it("does not render the target kanji as a visual aid", () => {
    render(<CalligraphyPracticeView {...PROPS} />);

    expect(screen.queryByText("水")).not.toBeInTheDocument();
  });

  /**
   * Requirement: R21/R23
   * Type: Unit
   * Condition: Invariant and Postcondition
   */
  it("renders only back reset and validate controls in the top control group", () => {
    render(<CalligraphyPracticeView {...PROPS} />);

    expect(screen.getByTestId("calligraphy-practice-top-controls")).toBeVisible();
    expect(screen.getByRole("button", { name: "Back" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Clear" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Validate" })).toBeVisible();
  });
});
