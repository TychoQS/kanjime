import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CalligraphyView } from "../../../src/Features/Calligraphy/View/CalligraphyView";
import type { CalligraphyProps } from "../../../src/Features/Calligraphy/Contracts/CalligraphyProps";

const PROPS: CalligraphyProps = {
  activeGrouping: "jlpt",
  categories: [
    {
      id: "jlpt-n5",
      grouping: "jlpt",
      label: "JLPT N5",
      order: 1,
      isResidual: false,
      kanjiCount: 3
    }
  ],
  onGroupingSelected: () => undefined,
  onCategorySelected: () => undefined
};

/**
 * R17 Inv/Post: The active JLPT or Joyo grouping is visually identified.
 */
describe("CalligraphyProps", () => {
  it("renders the active grouping as visible to the user", () => {
    render(<CalligraphyView {...PROPS} />);

    expect(screen.getByRole("button", { name: "JLPT" })).toHaveAttribute("aria-pressed", "true");
  });

  /**
   * R18 Inv/Post: Categories are ordered, grouped, and navigable.
   */
  it("renders ordered navigable categories for the selected grouping", () => {
    render(<CalligraphyView {...PROPS} />);

    expect(screen.getByRole("button", { name: "JLPT N5" })).toBeVisible();
  });
});
