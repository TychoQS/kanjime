import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { KanjiEntryView } from "../../../src/Features/Kanji/KanjiEntryView";
import { renderWithIonic } from "../../Support/RenderWithIonic";
import { TEST_KANJI_DETAILS } from "../../Support/TestData";
import { buildRequirementTitle } from "../../Support/RequirementTest";

describe("KanjiEntryProps", () => {
  const defaultProps = {
    character: TEST_KANJI_DETAILS.character,
    meanings: TEST_KANJI_DETAILS.meanings ?? [],
    primaryReadings: [...(TEST_KANJI_DETAILS.kunyomi ?? []), ...(TEST_KANJI_DETAILS.onyomi ?? [])],
    levels: [TEST_KANJI_DETAILS.jlptLevel ?? "", TEST_KANJI_DETAILS.joyoLevel ?? ""],
    canCopy: true,
    canGoBack: true,
    onCopyRequested: vi.fn(),
    onBackRequested: vi.fn(),
  };

  /**
   * Requirement: R5
   * Type: Unit
   * Condition: Precondition - invalid
   */
  it(buildRequirementTitle("R5", "Unit", "Precondition", "Violation: does not render copy mechanism when kanji entry is not properly loaded"), () => {
    renderWithIonic(<KanjiEntryView {...defaultProps} character="" />);
    expect(screen.queryByRole("button", { name: /copy/i })).not.toBeInTheDocument();
  });

  /**
   * Requirement: R5
   * Type: Unit
   * Condition: Precondition - valid
   */
  it(buildRequirementTitle("R5", "Unit", "Precondition", "renders the kanji entry with a visible copy mechanism"), () => {
    renderWithIonic(<KanjiEntryView {...defaultProps} />);

    expect(screen.getByText(TEST_KANJI_DETAILS.character)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /copy/i })).toBeInTheDocument();
  });

  /**
   * Requirement: R5
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R5", "Unit", "Invariant", "application state remains intact after copying the character"), async () => {
    const user = userEvent.setup();
    renderWithIonic(<KanjiEntryView {...defaultProps} />);
    const characterBefore = screen.getByText(TEST_KANJI_DETAILS.character).textContent;
    await user.click(screen.getByRole("button", { name: /copy/i }));
    expect(screen.getByText(TEST_KANJI_DETAILS.character).textContent).toBe(characterBefore);
  });

  /**
   * Requirement: R5
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R5", "Unit", "Postcondition", "triggers the character copy action for the current kanji"), async () => {
    const user = userEvent.setup();
    const onCopyRequested = vi.fn();
    renderWithIonic(<KanjiEntryView {...defaultProps} onCopyRequested={onCopyRequested} />);
    await user.click(screen.getByRole("button", { name: /copy/i }));
    expect(onCopyRequested).toHaveBeenCalledWith(TEST_KANJI_DETAILS.character);
  });

  /**
   * Requirement: R6
   * Type: Unit
   * Condition: Precondition - invalid
   */
  it(buildRequirementTitle("R6", "Unit", "Precondition", "Violation: back mechanism is disabled or hidden if navigation context is missing"), () => {
    renderWithIonic(<KanjiEntryView {...defaultProps} canGoBack={false} />);
    expect(screen.queryByRole("button", { name: /back/i })).not.toBeInTheDocument();
  });

  /**
   * Requirement: R6
   * Type: Unit
   * Condition: Precondition - valid
   */
  it(buildRequirementTitle("R6", "Unit", "Precondition", "renders the kanji entry with a visible back mechanism"), () => {
    renderWithIonic(<KanjiEntryView {...defaultProps} />);
    expect(screen.getByRole("button", { name: /back/i })).toBeInTheDocument();
  });

  /**
   * Requirement: R6
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R6", "Unit", "Invariant", "previous state is not modified when back navigation is requested"), async () => {
    const user = userEvent.setup();
    renderWithIonic(<KanjiEntryView {...defaultProps} />);
    const characterBefore = screen.getByText(TEST_KANJI_DETAILS.character).textContent;
    await user.click(screen.getByRole("button", { name: /back/i }));
    expect(screen.getByText(TEST_KANJI_DETAILS.character).textContent).toBe(characterBefore);
  });

  /**
   * Requirement: R6
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R6", "Unit", "Postcondition", "returns to the previous screen when the back mechanism is triggered"), async () => {
    const user = userEvent.setup();
    const onBackRequested = vi.fn();
    renderWithIonic(<KanjiEntryView {...defaultProps} onBackRequested={onBackRequested} />);
    await user.click(screen.getByRole("button", { name: /back/i }));
    expect(onBackRequested).toHaveBeenCalled();
  });
});
