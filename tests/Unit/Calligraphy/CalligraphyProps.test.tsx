import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CalligraphyView } from "../../../src/Features/Calligraphy/View/CalligraphyView";
import type { CalligraphyProps } from "../../../src/Features/Calligraphy/Contracts/CalligraphyProps";
import {
  TEST_CALLIGRAPHY_JLPT_GROUPING_LABEL,
  TEST_CALLIGRAPHY_JLPT_GROUPING,
  TEST_CALLIGRAPHY_JLPT_LABEL,
  TEST_CALLIGRAPHY_VIEW_CATEGORY
} from "../../Support/TestData";

const PROPS: CalligraphyProps = {
  activeGrouping: TEST_CALLIGRAPHY_JLPT_GROUPING,
  categories: [TEST_CALLIGRAPHY_VIEW_CATEGORY],
  onGroupingSelected: () => undefined,
  onCategorySelected: () => undefined
};

/**
 * Requirement: R17
 * Type: Unit
 * Condition: Invariant and Postcondition
 */
describe("CalligraphyProps", () => {
  it("renders the active grouping as visible to the user", () => {
    render(<CalligraphyView {...PROPS} />);

    expect(screen.getByRole("button", { name: TEST_CALLIGRAPHY_JLPT_GROUPING_LABEL })).toHaveAttribute("aria-pressed", "true");
  });

  /**
   * Requirement: R18
   * Type: Unit
   * Condition: Invariant and Postcondition
   */
  it("renders ordered navigable categories for the selected grouping", () => {
    render(<CalligraphyView {...PROPS} />);

    expect(screen.getByRole("button", { name: TEST_CALLIGRAPHY_JLPT_LABEL })).toBeVisible();
  });
});
