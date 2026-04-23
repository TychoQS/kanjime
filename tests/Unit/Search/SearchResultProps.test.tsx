import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SearchResultView } from "../../../src/Features/Search/SearchResultView";
import { renderWithIonic } from "../../Support/RenderWithIonic";
import { TEST_KANJI_INFO } from "../../Support/TestData";
import { buildRequirementTitle } from "../../Support/RequirementTest";

describe("SearchResultProps", () => {
  const defaultProps = {
    ...TEST_KANJI_INFO,
    onSelected: vi.fn(),
  };

  /**
   * Requirement: R11
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R11", "Unit", "Precondition", "exists a valid selected search result with non-empty identification"), () => {
    const onSelected = vi.fn();
    renderWithIonic(<SearchResultView {...defaultProps} onSelected={onSelected} />);

    expect(screen.getByTestId("search-result-view")).toBeInTheDocument();
    expect(screen.getByText(TEST_KANJI_INFO.character)).toBeInTheDocument();
  });

  /**
   * Requirement: R11
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R11", "Unit", "Invariant", "the result list entry remains intact and immutable after selection interaction"), async () => {
    const user = userEvent.setup();
    renderWithIonic(<SearchResultView {...defaultProps} />);

    const view = screen.getByTestId("search-result-view");
    const contentBefore = view.innerHTML;

    await user.click(view);

    const contentAfter = view.innerHTML;
    expect(contentAfter).toBe(contentBefore, "The search result UI was modified after selection.");
  });

  /**
   * Requirement: R11
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R11", "Unit", "Postcondition", "triggers navigation by notifying the correct kanji identifier to the controller"), async () => {
    const user = userEvent.setup();
    const onSelected = vi.fn();
    renderWithIonic(<SearchResultView {...defaultProps} onSelected={onSelected} />);

    const view = screen.getByTestId("search-result-view");
    await user.click(view);

    expect(onSelected).toHaveBeenCalledWith(
      TEST_KANJI_INFO.character,
      "SearchResult did not notify the correct identifier for navigation."
    );
  });

  /**
   * Requirement: R12
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R12", "Unit", "Precondition", "exists a valid search term providing character, readings and levels"), () => {
    renderWithIonic(<SearchResultView {...defaultProps} />);

    expect(screen.getByText(TEST_KANJI_INFO.character)).toBeInTheDocument();
  });

  /**
   * Requirement: R12
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R12", "Unit", "Invariant", "structural homogeneity: all result items keep the same visual hierarchy across different data"), () => {
    const { rerender } = renderWithIonic(<SearchResultView {...defaultProps} />);

    const getStructure = () => {
      const headings = screen.getAllByRole("heading").map(el => el.tagName);
      const lists = screen.getAllByRole("list").map(el => el.tagName);
      const items = screen.getAllByRole("listitem").map(el => el.tagName);
      return [...headings, ...lists, ...items];
    };
    const structureBefore = getStructure();

    rerender(<SearchResultView {...defaultProps} character="二" mainReadings={["ni"]} levels={["N5"]} />);
    const structureAfter = getStructure();

    expect(structureAfter).toEqual(structureBefore, "Structural homogeneity violated: UI hierarchy changed with data.");
  });

  /**
   * Requirement: R12
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R12", "Unit", "Postcondition", "each result item explicitly displays character, main readings and associated levels"), () => {
    renderWithIonic(<SearchResultView {...defaultProps} />);

    const view = screen.getByTestId("search-result-view");

    expect(within(view).getByText(TEST_KANJI_INFO.character)).toBeInTheDocument();

    TEST_KANJI_INFO.mainReadings.forEach(reading => {
      expect(within(view).getByText(reading)).toBeInTheDocument();
    });

    TEST_KANJI_INFO.levels.forEach(level => {
      expect(within(view).getByText(level)).toBeInTheDocument();
    });
  });
});
