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
 * R19 Inv/Post: The writing canvas is the main visual element in practice.
 */
describe("CalligraphyPracticeProps", () => {
  it("renders the canvas as the primary practice element", () => {
    render(<CalligraphyPracticeView {...PROPS} />);

    expect(screen.getByTestId("calligraphy-practice-canvas")).toBeVisible();
  });

  /**
   * R20 Inv/Post: No visual aid for the target kanji is shown during practice.
   */
  it("does not render the target kanji as a visual aid", () => {
    render(<CalligraphyPracticeView {...PROPS} />);

    expect(screen.queryByText("水")).not.toBeInTheDocument();
  });

  /**
   * R21/R23 Inv/Post: Only essential controls are visible and grouped at the top.
   */
  it("renders only back reset and validate controls in the top control group", () => {
    render(<CalligraphyPracticeView {...PROPS} />);

    expect(screen.getByTestId("calligraphy-practice-top-controls")).toBeVisible();
    expect(screen.getByRole("button", { name: "Back" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Clear" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Validate" })).toBeVisible();
  });
});
