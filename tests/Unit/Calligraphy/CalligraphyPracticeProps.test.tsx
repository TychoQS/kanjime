import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CalligraphyPracticeView } from "../../../src/Features/Calligraphy/View/CalligraphyPracticeView";
import type { CalligraphyPracticeProps } from "../../../src/Features/Calligraphy/Contracts/CalligraphyPracticeProps";
import {
  TEST_CALLIGRAPHY_BACK_LABEL,
  TEST_CALLIGRAPHY_CLEAR_LABEL,
  TEST_CALLIGRAPHY_TARGET_CHARACTER,
  TEST_CALLIGRAPHY_VALIDATE_LABEL
} from "../../Support/TestData";

const PROPS: CalligraphyPracticeProps = {
  targetCharacter: TEST_CALLIGRAPHY_TARGET_CHARACTER,
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

    expect(screen.queryByText(TEST_CALLIGRAPHY_TARGET_CHARACTER)).not.toBeInTheDocument();
  });

  /**
   * Requirement: R21/R23
   * Type: Unit
   * Condition: Invariant and Postcondition
   */
  it("renders only back reset and validate controls in the top control group", () => {
    render(<CalligraphyPracticeView {...PROPS} />);

    expect(screen.getByTestId("calligraphy-practice-top-controls")).toBeVisible();
    expect(screen.getByRole("button", { name: TEST_CALLIGRAPHY_BACK_LABEL })).toBeVisible();
    expect(screen.getByRole("button", { name: TEST_CALLIGRAPHY_CLEAR_LABEL })).toBeVisible();
    expect(screen.getByRole("button", { name: TEST_CALLIGRAPHY_VALIDATE_LABEL })).toBeVisible();
  });
});
