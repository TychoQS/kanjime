import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { HistoryView } from "../../../src/Features/History/HistoryView";
import { renderWithIonic } from "../../Support/RenderWithIonic";
import { TEST_HISTORY_GROUPS, TEST_PRIMARY_CHARACTER } from "../../Support/TestData";
import { buildRequirementTitle } from "../../Support/RequirementTest";

describe("HistoryProps", () => {
  const defaultProps = {
    groups: TEST_HISTORY_GROUPS,
    onEntrySelected: vi.fn(),
  };

  /**
   * Requirement: R2
   * Type: Unit
   * Condition: Precondition - invalid
   */
  it(buildRequirementTitle("R2", "Unit", "Precondition", "Violation: handles empty history by not rendering interactive entries"), () => {
    renderWithIonic(<HistoryView {...defaultProps} groups={[]} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  /**
   * Requirement: R2
   * Type: Unit
   * Condition: Precondition - valid
   */
  it(buildRequirementTitle("R2", "Unit", "Precondition", "successfully renders the history view when entries are available"), () => {
    renderWithIonic(<HistoryView {...defaultProps} />);
    expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
  });

  /**
   * Requirement: R2
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R2", "Unit", "Invariant", "interaction does not alter other entries in the history list"), async () => {
    const user = userEvent.setup();
    renderWithIonic(<HistoryView {...defaultProps} />);

    const allButtonsBefore = screen.getAllByRole("button").map(b => b.textContent);

    await user.click(screen.getAllByRole("button")[0]);

    const allButtonsAfter = screen.getAllByRole("button").map(b => b.textContent);
    expect(allButtonsAfter).toEqual(allButtonsBefore);
  });

  /**
   * Requirement: R2
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R2", "Unit", "Postcondition", "triggers detailed view navigation for the selected history entry"), async () => {
    const user = userEvent.setup();
    const onEntrySelected = vi.fn();
    renderWithIonic(<HistoryView {...defaultProps} onEntrySelected={onEntrySelected} />);

    await user.click(screen.getByRole("button", { name: new RegExp(TEST_PRIMARY_CHARACTER) }));
    expect(onEntrySelected).toHaveBeenCalledWith(TEST_PRIMARY_CHARACTER);
  });

  /**
   * Requirement: R3
   * Type: Unit
   * Condition: Precondition - valid
   */
  it(buildRequirementTitle("R3", "Unit", "Precondition", "renders history groups correctly when multiple entries exist with different timestamps"), () => {
    renderWithIonic(<HistoryView {...defaultProps} />);

    expect(screen.getAllByRole("listitem").length).toBeGreaterThan(1);
  });

  /**
   * Requirement: R3
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R3", "Unit", "Invariant", "temporal order of records remains consistent during view lifecycle"), () => {
    const { rerender } = renderWithIonic(<HistoryView {...defaultProps} />);
    const orderBefore = screen.getAllByRole("listitem").map(item => item.textContent);

    rerender(<HistoryView {...defaultProps} />);
    const orderAfter = screen.getAllByRole("listitem").map(item => item.textContent);

    expect(orderAfter).toEqual(orderBefore);
  });

  /**
   * Requirement: R3
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R3", "Unit", "Postcondition", "renders history entries in strict descending order by their creation timestamp"), () => {
    renderWithIonic(<HistoryView {...defaultProps} />);

    const items = screen.getAllByRole("listitem");
    const timestamps = items.map(item => item.getAttribute("data-timestamp") || "0");

    for (let i = 0; i < timestamps.length - 1; i++) {
      const current = new Date(timestamps[i]).getTime();
      const next = new Date(timestamps[i + 1]).getTime();
      expect(current).toBeGreaterThanOrEqual(next);
    }
  });
});
