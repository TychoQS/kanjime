import {cleanup, screen} from "@testing-library/react";
import { describe, expect, it } from "vitest";
import userEvent from "@testing-library/user-event";
import { CalligraphyView } from "../../../src/Features/Calligraphy/View/CalligraphyView";
import type { CalligraphyProps } from "../../../src/Features/Calligraphy/Contracts/CalligraphyProps";
import {
  TEST_CALLIGRAPHY_JLPT_GROUPING_LABEL,
  TEST_CALLIGRAPHY_JLPT_GROUPING,
  TEST_CALLIGRAPHY_VIEW_CATEGORY, TEST_CALLIGRAPHY_JOYO_GROUPING_LABEL, TEST_CALLIGRAPHY_JOYO_GROUPING,
  TEST_CALLIGRAPHY_VISIBLE_JLPT_CATEGORIES, TEST_CALLIGRAPHY_VISIBLE_JOYO_CATEGORIES
} from "../../Support/TestData";
import { buildRequirementTitle } from "../../Support/RequirementTest";
import {renderWithIonic} from "../../Support/RenderWithIonic";


const defaultProps: CalligraphyProps = {
  activeGrouping: TEST_CALLIGRAPHY_JLPT_GROUPING,
  categories: [TEST_CALLIGRAPHY_VIEW_CATEGORY],
  onGroupingSelected: vi.fn(),
  onCategorySelected: vi.fn()
};

describe("CalligraphyProps", () => {
  /**
   * Requirement: R17
   * Type: Unit
   * Condition: Precondition - invalid
   */
  it(buildRequirementTitle("R17", "Unit", "Precondition", "Violation: does not mark any grouping as active when active grouping is invalid"), () => {
    renderWithIonic(
        <CalligraphyView
            {...defaultProps}
            activeGrouping={"invalid-grouping" as never}
        />
    );

    expect(
        screen.getByRole("button", { name: TEST_CALLIGRAPHY_JLPT_GROUPING_LABEL })
    ).not.toHaveAttribute("aria-current", "page");

    expect(
        screen.getByRole("button", { name: TEST_CALLIGRAPHY_JOYO_GROUPING_LABEL })
    ).not.toHaveAttribute("aria-current", "page");
  });

  /**
   * Requirement: R17
   * Type: Unit
   * Condition: Precondition - valid
   */
  it(buildRequirementTitle("R17", "Unit", "Precondition", "successfully renders JLPT and Joyo grouping selectors"), () => {
    renderWithIonic(<CalligraphyView {...defaultProps} />);

    expect(
        screen.getByRole("button", { name: TEST_CALLIGRAPHY_JLPT_GROUPING_LABEL })
    ).toBeVisible();

    expect(
        screen.getByRole("button", { name: TEST_CALLIGRAPHY_JOYO_GROUPING_LABEL })
    ).toBeVisible();
  });

  /**
   * Requirement: R17
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R17", "Unit", "Invariant", "only one grouping can be visually active at a time"), () => {
    renderWithIonic(<CalligraphyView {...defaultProps} />);

    const groupingButtons = [
      screen.getByRole("button", { name: TEST_CALLIGRAPHY_JLPT_GROUPING_LABEL }),
      screen.getByRole("button", { name: TEST_CALLIGRAPHY_JOYO_GROUPING_LABEL })
    ];

    const activeGroupingButtons = groupingButtons.filter(
        (button) => button.getAttribute("aria-current") === "page"
    );

    expect(activeGroupingButtons).toHaveLength(
        1,
        "CalligraphyProps did not keep exactly one grouping visually active."
    );
  });

  /**
   * Requirement: R17
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R17", "Unit", "Invariant", "exactly one grouping remains visually active"), () => {
    renderWithIonic(<CalligraphyView {...defaultProps} />);

    const jlptButton = screen.getByRole("button", {
      name: TEST_CALLIGRAPHY_JLPT_GROUPING_LABEL
    });

    const joyoButton = screen.getByRole("button", {
      name: TEST_CALLIGRAPHY_JOYO_GROUPING_LABEL
    });

    expect(
        jlptButton,
        "CalligraphyProps did not keep JLPT visually marked as active."
    ).toHaveAttribute("aria-current", "page");

    expect(
        joyoButton,
        "CalligraphyProps incorrectly marked Joyo as active."
    ).not.toHaveAttribute("aria-current", "page");

    const activeGroupingButtons = [jlptButton, joyoButton].filter(
        (button) => button.getAttribute("aria-current") === "page"
    );

    expect(
        activeGroupingButtons,
        "CalligraphyProps did not keep exactly one grouping visually active."
    ).toHaveLength(1);
  });

  /**
   * Requirement: R17
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R17", "Unit", "Postcondition", "triggers grouping selection when the user selects another grouping"), async () => {
    const user = userEvent.setup();
    const onGroupingSelected = vi.fn();

    renderWithIonic(
        <CalligraphyView
            {...defaultProps}
            onGroupingSelected={onGroupingSelected}
        />
    );

    await user.click(
        screen.getByRole("button", { name: TEST_CALLIGRAPHY_JOYO_GROUPING_LABEL })
    );

    expect(onGroupingSelected).toHaveBeenCalledTimes(1);
    expect(onGroupingSelected).toHaveBeenCalledWith(
        TEST_CALLIGRAPHY_JOYO_GROUPING
    );
  });

  /**
   * Requirement: R18
   * Type: Unit
   * Condition: Precondition – valid
   */
  it(buildRequirementTitle("R18", "Unit", "Precondition", "renders all JLPT and Joyo categories including residual"), () => {
    renderWithIonic(
        <CalligraphyView
            {...defaultProps}
            activeGrouping={TEST_CALLIGRAPHY_JLPT_GROUPING}
            categories={TEST_CALLIGRAPHY_VISIBLE_JLPT_CATEGORIES}
        />
    );

    for (const category of TEST_CALLIGRAPHY_VISIBLE_JLPT_CATEGORIES) {
      expect(screen.getByRole("button", { name: category.label })).toBeVisible();
    }

    cleanup();

    renderWithIonic(
        <CalligraphyView
            {...defaultProps}
            activeGrouping={TEST_CALLIGRAPHY_JOYO_GROUPING}
            categories={TEST_CALLIGRAPHY_VISIBLE_JOYO_CATEGORIES}
        />
    );

    for (const category of TEST_CALLIGRAPHY_VISIBLE_JOYO_CATEGORIES) {
      expect(screen.getByRole("button", { name: category.label })).toBeVisible();
    }
  });

  /**
   * Requirement: R18
   * Type: Unit
   * Condition: Precondition – invalid
   */
  it(buildRequirementTitle("R18", "Unit", "Precondition", "Violation: renders no category buttons when categories list is empty"), () => {
    renderWithIonic(
        <CalligraphyView {...defaultProps} categories={[]} />
    );

    for (const category of [
      ...TEST_CALLIGRAPHY_VISIBLE_JLPT_CATEGORIES,
      ...TEST_CALLIGRAPHY_VISIBLE_JOYO_CATEGORIES,
    ]) {
      expect(screen.queryByRole("button", { name: category.label })).not.toBeInTheDocument();
    }
  });

  /**
   * Requirement: R18
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R18", "Unit", "Invariant", "JLPT and Joyo categories remain grouped by their active grouping"), () => {
    renderWithIonic(
        <CalligraphyView
            {...defaultProps}
            activeGrouping={TEST_CALLIGRAPHY_JLPT_GROUPING}
            categories={TEST_CALLIGRAPHY_VISIBLE_JLPT_CATEGORIES}
        />
    );

    for (const category of TEST_CALLIGRAPHY_VISIBLE_JLPT_CATEGORIES) {
      expect(screen.getByRole("button", { name: category.label })).toBeVisible();
    }

    for (const category of TEST_CALLIGRAPHY_VISIBLE_JOYO_CATEGORIES) {
      expect(screen.queryByRole("button", { name: category.label })).not.toBeInTheDocument();
    }

    cleanup();

    renderWithIonic(
        <CalligraphyView
            {...defaultProps}
            activeGrouping={TEST_CALLIGRAPHY_JOYO_GROUPING}
            categories={TEST_CALLIGRAPHY_VISIBLE_JOYO_CATEGORIES}
        />
    );

    for (const category of TEST_CALLIGRAPHY_VISIBLE_JOYO_CATEGORIES) {
      expect(screen.getByRole("button", { name: category.label })).toBeVisible();
    }

    for (const category of TEST_CALLIGRAPHY_VISIBLE_JLPT_CATEGORIES) {
      expect(screen.queryByRole("button", { name: category.label })).not.toBeInTheDocument();
    }
  });


  /**
   * Requirement: R18
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R18", "Unit", "Postcondition", "presents JLPT and Joyo categories in order and triggers onCategorySelected for each including residual"), async () => {
    const user = userEvent.setup();
    const onCategorySelected = vi.fn();

    renderWithIonic(
        <CalligraphyView
            {...defaultProps}
            activeGrouping={TEST_CALLIGRAPHY_JLPT_GROUPING}
            categories={TEST_CALLIGRAPHY_VISIBLE_JLPT_CATEGORIES}
            onCategorySelected={onCategorySelected}
        />
    );

    const jlptButtons = [...TEST_CALLIGRAPHY_VISIBLE_JLPT_CATEGORIES]
        .sort((a, b) => a.order - b.order)
        .map(c => screen.getByRole("button", { name: c.label }));

    for (let i = 0; i < jlptButtons.length - 1; i++) {
      expect(
          jlptButtons[i].compareDocumentPosition(jlptButtons[i + 1]) & Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
    }

    for (const category of TEST_CALLIGRAPHY_VISIBLE_JLPT_CATEGORIES) {
      await user.click(screen.getByRole("button", { name: category.label }));
      expect(onCategorySelected).toHaveBeenLastCalledWith(category.id);
    }

    expect(onCategorySelected).toHaveBeenCalledTimes(TEST_CALLIGRAPHY_VISIBLE_JLPT_CATEGORIES.length);

    cleanup();
    onCategorySelected.mockClear();

    renderWithIonic(
        <CalligraphyView
            {...defaultProps}
            activeGrouping={TEST_CALLIGRAPHY_JOYO_GROUPING}
            categories={TEST_CALLIGRAPHY_VISIBLE_JOYO_CATEGORIES}
            onCategorySelected={onCategorySelected}
        />
    );

    const joyoButtons = [...TEST_CALLIGRAPHY_VISIBLE_JOYO_CATEGORIES]
        .sort((a, b) => a.order - b.order)
        .map(c => screen.getByRole("button", { name: c.label }));

    for (let i = 0; i < joyoButtons.length - 1; i++) {
      expect(
          joyoButtons[i].compareDocumentPosition(joyoButtons[i + 1]) & Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
    }

    for (const category of TEST_CALLIGRAPHY_VISIBLE_JOYO_CATEGORIES) {
      await user.click(screen.getByRole("button", { name: category.label }));
      expect(onCategorySelected).toHaveBeenLastCalledWith(category.id);
    }

    expect(onCategorySelected).toHaveBeenCalledTimes(TEST_CALLIGRAPHY_VISIBLE_JOYO_CATEGORIES.length);
  });
});