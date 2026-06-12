import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CategoryView } from "../../../src/Features/Calligraphy/View/CategoryView";
import { renderWithIonic } from "../../Support/RenderWithIonic";
import { buildRequirementTitle } from "../../Support/RequirementTest";
import {
  TEST_CALLIGRAPHY_CATEGORY_ID,
  TEST_CALLIGRAPHY_JLPT_GROUPING,
  TEST_PRIMARY_CHARACTER,
  TEST_SECONDARY_CHARACTER
} from "../../Support/TestData";

describe("CategoryProps requirements", () => {
  const baseProps = {
    categoryId: TEST_CALLIGRAPHY_CATEGORY_ID,
    searchTerm: "",
    visibleKanji: [
      {
        character: TEST_PRIMARY_CHARACTER,
        categoryId: TEST_CALLIGRAPHY_CATEGORY_ID,
        grouping: TEST_CALLIGRAPHY_JLPT_GROUPING,
        strokeCount: 4
      },
      {
        character: TEST_SECONDARY_CHARACTER,
        categoryId: TEST_CALLIGRAPHY_CATEGORY_ID,
        grouping: TEST_CALLIGRAPHY_JLPT_GROUPING,
        strokeCount: 5
      }
    ],
    onBackRequested: vi.fn(),
    onKanjiSelected: vi.fn(),
    onSearchTermChanged: vi.fn()
  } as const;

  /**
   * Requirement R29 - Precondition:
   * the category screen should expose the search field while the category is open.
   */
  it(buildRequirementTitle("R29", "Unit", "Precondition", "the category screen exposes the calligraphy search field"), () => {
    renderWithIonic(<CategoryView {...baseProps} />);

    expect(
      screen.queryByRole("searchbox"),
      "R29 precondition should expose a visible and accessible search field on the category kanji screen."
    ).not.toBeNull();
  });

  /**
   * Requirement R29 - Invariant:
   * the search field should remain visible before and after a filtering attempt.
   */
  it(buildRequirementTitle("R29", "Unit", "Invariant", "the category search field remains visible after filtering"), () => {
    const { rerender } = renderWithIonic(<CategoryView {...baseProps} />);

    rerender(
      <CategoryView
        {...baseProps}
        searchTerm={TEST_PRIMARY_CHARACTER}
        visibleKanji={[baseProps.visibleKanji[0]]}
      />
    );

    expect(
      screen.queryByRole("searchbox"),
      "R29 invariant should keep the category search field visible after applying a filter."
    ).not.toBeNull();
  });

  /**
   * Requirement R29 - Postcondition:
   * the user should identify the search field without additional navigation.
   */
  it(buildRequirementTitle("R29", "Unit", "Postcondition", "the category search field is visible without extra navigation"), () => {
    renderWithIonic(<CategoryView {...baseProps} />);

    expect(
      screen.queryByLabelText(/search/i),
      "R29 postcondition should make the category search field discoverable without opening extra menus or screens."
    ).not.toBeNull();
  });
});
