import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { InferenceListView } from "../../../../src/Features/Classification/Inference/InferenceListView";
import { renderWithIonic } from "../../../Support/RenderWithIonic";
import { TEST_SUMMARIES } from "../../../Support/TestData";
import { buildRequirementTitle } from "../../../Support/RequirementTest";

describe("InferenceListProps", () => {
  const mockResults = TEST_SUMMARIES.map((summary, index) => ({
    ...summary,
    isSelected: index === 0,
  }));

  const defaultProps = {
    results: mockResults,
    onResultSelected: vi.fn(),
  };

  /**
   * Requirement: R4
   * Type: Unit
   * Condition: Precondition - invalid
   */
  it(buildRequirementTitle("R4", "Unit", "Precondition", "Violation: handles empty results list by not rendering interactive items"), () => {
    renderWithIonic(<InferenceListView {...defaultProps} results={[]} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  /**
   * Requirement: R4
   * Type: Unit
   * Condition: Precondition - valid
   */
  it(buildRequirementTitle("R4", "Unit", "Precondition", "renders the list with all predicted characters and readings"), () => {
    renderWithIonic(<InferenceListView {...defaultProps} />);

    mockResults.forEach(result => {
      expect(screen.getByRole("button", { name: new RegExp(result.character) })).toBeInTheDocument();
    });
  });

  /**
   * Requirement: R4
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R4", "Unit", "Invariant", "result list order and data remain immutable after user interaction"), async () => {
    const user = userEvent.setup();
    renderWithIonic(<InferenceListView {...defaultProps} />);

    const buttonsBefore = screen.getAllByRole("button").map(b => b.textContent);

    await user.click(screen.getAllByRole("button")[0]);

    const buttonsAfter = screen.getAllByRole("button").map(b => b.textContent);
    expect(buttonsAfter).toEqual(buttonsBefore);
  });

  /**
   * Requirement: R4
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R4", "Unit", "Invariant", "minimalism: does not display numeric confidence values in the UI per Inference Results rule"), () => {
    renderWithIonic(<InferenceListView {...defaultProps} />);

    const bodyText = document.body.textContent || "";

    expect(bodyText).not.toMatch(/\d+\.\d+/);
    expect(bodyText).not.toMatch(/\d+%/);
  });

  /**
   * Requirement: R4
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R4", "Unit", "Postcondition", "correctly notifies the system of the selected character for detailed view"), async () => {
    const user = userEvent.setup();
    const onResultSelected = vi.fn();
    renderWithIonic(<InferenceListView {...defaultProps} onResultSelected={onResultSelected} />);

    const firstChar = mockResults[0].character;
    await user.click(screen.getByRole("button", { name: new RegExp(firstChar) }));

    expect(onResultSelected).toHaveBeenCalledWith(firstChar);
  });
});
