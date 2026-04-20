import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { HistoryView } from "../../../src/Features/History/HistoryView";
import { renderWithIonic } from "../../Support/RenderWithIonic";
import { TEST_HISTORY_GROUPS, TEST_PRIMARY_CHARACTER } from "../../Support/TestData";
import { buildRequirementTitle } from "../../Support/RequirementTest";

describe("HistoryProps", () => {
  /**
   * Requirement: R2
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R2", "Unit", "Postcondition", "opens a history item without altering the others"), async () => {
    const user = userEvent.setup();
    const selectedCharacters: string[] = [];

    renderWithIonic(
      <HistoryView
        groups={TEST_HISTORY_GROUPS}
        onEntrySelected={(character) => {
          selectedCharacters.push(character);
        }}
      />
    );

    await user.click(screen.getByRole("button", { name: TEST_PRIMARY_CHARACTER }));

    expect(selectedCharacters).toEqual([TEST_PRIMARY_CHARACTER], "HistoryProps did not forward the selected history row.");
  });

  /**
   * Requirement: R3
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R3", "Unit", "Postcondition", "renders history entries from newest to oldest"), () => {
    renderWithIonic(
      <HistoryView
        groups={TEST_HISTORY_GROUPS}
        onEntrySelected={() => undefined}
      />
    );

    const orderedTimestamps = screen.getAllByText(/2026-04-20T/).map((node) => node.textContent);

    expect(orderedTimestamps[0]).toBe(TEST_HISTORY_GROUPS[0].entries[0].createdAt);
  });
});
