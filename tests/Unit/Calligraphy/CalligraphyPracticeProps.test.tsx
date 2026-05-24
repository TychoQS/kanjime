import { cleanup, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CalligraphyPracticeView } from "../../../src/Features/Calligraphy/View/CalligraphyPracticeView";
import type { CalligraphyPracticeProps } from "../../../src/Features/Calligraphy/Contracts/CalligraphyPracticeProps";
import {
  TEST_CALLIGRAPHY_BACK_LABEL,
  TEST_CALLIGRAPHY_CLEAR_LABEL,
  TEST_CALLIGRAPHY_TARGET_CHARACTER,
  TEST_CALLIGRAPHY_VALIDATE_LABEL, TEST_SECOND_STROKE, TEST_STROKE
} from "../../Support/TestData";
import { buildRequirementTitle } from "../../Support/RequirementTest";
import { renderWithIonic } from "../../Support/RenderWithIonic";

const PROPS: CalligraphyPracticeProps = {
  targetCharacter: TEST_CALLIGRAPHY_TARGET_CHARACTER,
  strokes: [],
  canReset: false,
  canValidate: false,
  onBackRequested: () => undefined,
  onResetRequested: () => undefined,
  onValidateRequested: () => undefined
};


describe("CalligraphyPracticeProps", () => {

  /**
   * Requirement: R19
   * Type: Unit
   * Condition: Precondition – valid
   */
  it(buildRequirementTitle("R19", "Unit", "Precondition", "renders the practice screen when a target character is provided"), () => {
    renderWithIonic(<CalligraphyPracticeView {...PROPS} />);

    expect(screen.getByTestId("calligraphy-practice-screen")).toBeInTheDocument("CalligraphyPracticeView should render the practice screen when a target character is provided.");
  });

  /**
   * Requirement: R19
   * Type: Unit
   * Condition: Precondition – invalid
   */
  it(buildRequirementTitle("R19", "Unit", "Precondition", "Violation: does render the practice screen when target character is empty"), () => {
    renderWithIonic(
      <CalligraphyPracticeView {...PROPS} targetCharacter="" />
    );

    expect(screen.queryByTestId("calligraphy-practice-screen")).not.toBeInTheDocument("CalligraphyPracticeView should not render the practice screen when the target character is empty.");
  });

  /**
   * Requirement: R19
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R19", "Unit", "Invariant", "writing canvas remains visible throughout the practice"), () => {
    renderWithIonic(<CalligraphyPracticeView {...PROPS} />);

    expect(screen.getByTestId("calligraphy-practice-canvas"), "CalligraphyPracticeView should render the writing canvas.").toBeVisible();
  });

  /**
   * Requirement: R19
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R19", "Unit", "Postcondition", "writing canvas is rendered as the main visual element of the practice"), () => {
    renderWithIonic(<CalligraphyPracticeView {...PROPS} />);

    expect(screen.getByTestId("calligraphy-practice-canvas"), "CalligraphyPracticeView should render the writing canvas.").toBeVisible();
    expect(screen.getByTestId("calligraphy-practice-screen")).toBeInTheDocument("CalligraphyPracticeView should render the practice screen when a target character is provided.");
  });

  /**
   * Requirement: R20
   * Type: Unit
   * Condition: Precondition – valid
   */
  it(buildRequirementTitle("R20", "Unit", "Precondition", "renders the practice screen when a target character is provided"), () => {
    renderWithIonic(<CalligraphyPracticeView {...PROPS} />);

    expect(screen.getByTestId("calligraphy-practice-screen"), "CalligraphyPracticeView should render the practice screen when a target character is provided.").toBeInTheDocument();
  });

  /**
   * Requirement: R20
   * Type: Unit
   * Condition: Precondition – invalid
   */
  it(buildRequirementTitle("R20", "Unit", "Precondition", "Violation: does not render the practice screen when target character is empty"), () => {
    renderWithIonic(
      <CalligraphyPracticeView {...PROPS} targetCharacter="" />
    );

    expect(screen.queryByTestId("calligraphy-practice-screen"), "CalligraphyPracticeView should not render the practice screen when the target character is empty.").not.toBeInTheDocument();
  });

  /**
   * Requirement: R20
   * Type: Unit
   * Condition: Invariant and Postcondition
   */
  it(buildRequirementTitle("R20", "Unit", "Invariant", "target kanji is never shown regardless of stroke count"), () => {
    renderWithIonic(<CalligraphyPracticeView {...PROPS} strokes={[]} />);
    expect(screen.queryByText(TEST_CALLIGRAPHY_TARGET_CHARACTER), "CalligraphyPracticeView should not render the target kanji.").not.toBeInTheDocument();

    cleanup();

    renderWithIonic(<CalligraphyPracticeView {...PROPS} strokes={[TEST_STROKE, TEST_SECOND_STROKE]} />);
    expect(screen.queryByText(TEST_CALLIGRAPHY_TARGET_CHARACTER), "CalligraphyPracticeView should not render the target kanji.").not.toBeInTheDocument();
  });

  /**
   * Requirement: R21
   * Type: Unit
   * Condition: Precondition – valid
   */
  it(buildRequirementTitle("R21", "Unit", "Precondition", "renders the practice screen when a target character is provided"), () => {
    renderWithIonic(<CalligraphyPracticeView {...PROPS} />);

    expect(screen.getByTestId("calligraphy-practice-screen"), "CalligraphyPracticeView should render the practice screen when a target character is provided.").toBeInTheDocument();
  });

  /**
   * Requirement: R21
   * Type: Unit
   * Condition: Precondition – invalid
   */
  it(buildRequirementTitle("R21", "Unit", "Precondition", "Violation: does not render the practice screen when target character is empty"), () => {
    renderWithIonic(
      <CalligraphyPracticeView {...PROPS} targetCharacter="" />
    );

    expect(screen.queryByTestId("calligraphy-practice-screen"), "CalligraphyPracticeView should not render the practice screen when the target character is empty.").not.toBeInTheDocument();
  });

  /**
   * Requirement: R21
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R21", "Unit", "Invariant", "only the canvas and essential controls are present during practice"), () => {
    renderWithIonic(<CalligraphyPracticeView {...PROPS} />);

    const practiceScreen = screen.getByTestId("calligraphy-practice-screen");
    const interactiveElements = practiceScreen.querySelectorAll("button, input, select, textarea, a, canvas");
    expect(interactiveElements, "CalligraphyPracticeView should render only the canvas and essential controls during practice.").toHaveLength(4);
  });

  /**
   * Requirement: R21
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R21", "Unit", "Postcondition", "only back, clear and validate actions are shown"), () => {
    renderWithIonic(<CalligraphyPracticeView {...PROPS} />);

    expect(screen.getByRole("button", { name: TEST_CALLIGRAPHY_BACK_LABEL }), "CalligraphyPracticeView should show the back action").toBeVisible();
    expect(screen.getByRole("button", { name: TEST_CALLIGRAPHY_CLEAR_LABEL }), "CalligraphyPracticeView should show the clear action").toBeVisible();
    expect(screen.getByRole("button", { name: TEST_CALLIGRAPHY_VALIDATE_LABEL }), "CalligraphyPracticeView should show the validate action").toBeVisible();
    expect(screen.getAllByRole("button"), "CalligraphyPracticeView should show only three actions").toHaveLength(3);
  });

  /**
   * Requirement: R23
   * Type: Unit
   * Condition: Precondition – valid
   */
  it(buildRequirementTitle("R23", "Unit", "Precondition", "renders the practice screen when a target character is provided"), () => {
    renderWithIonic(<CalligraphyPracticeView {...PROPS} />);

    expect(screen.getByTestId("calligraphy-practice-screen"), "CalligraphyPracticeView should render the practice screen when a target character is provided.").toBeInTheDocument();
  });

  /**
   * Requirement: R23
   * Type: Unit
   * Condition: Precondition – invalid
   */
  it(buildRequirementTitle("R23", "Unit", "Precondition", "Violation: does not render the practice screen when target character is empty"), () => {
    renderWithIonic(
      <CalligraphyPracticeView {...PROPS} targetCharacter="" />
    );

    expect(screen.queryByTestId("calligraphy-practice-screen"), "CalligraphyPracticeView should not render the practice screen when the target character is empty.").not.toBeInTheDocument();
  });

  /**
   * Requirement: R23
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R23", "Unit", "Postcondition", "practice controls are shown grouped at the top of the screen"), () => {
    renderWithIonic(<CalligraphyPracticeView {...PROPS} />);

    const topControls = screen.getByTestId("calligraphy-practice-top-controls");

    expect(topControls, "CalligraphyPracticeView should show the top controls").toBeVisible();
    expect(topControls, "CalligraphyPracticeView should show the back action").toContainElement(screen.getByRole("button", { name: TEST_CALLIGRAPHY_BACK_LABEL }));
    expect(topControls, "CalligraphyPracticeView should show the clear action").toContainElement(screen.getByRole("button", { name: TEST_CALLIGRAPHY_CLEAR_LABEL }));
    expect(topControls, "CalligraphyPracticeView should show the validate action").toContainElement(screen.getByRole("button", { name: TEST_CALLIGRAPHY_VALIDATE_LABEL }));
  });
});
