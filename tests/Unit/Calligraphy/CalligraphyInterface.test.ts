import { describe, expect, it } from "vitest";

import { CreateCalligraphyController } from "../../../src/Features/Calligraphy/CreateCalligraphyController";
import {
  TEST_CALLIGRAPHY_INVALID_GROUPING,
  TEST_CALLIGRAPHY_JLPT_GROUPING, TEST_CALLIGRAPHY_JOYO_GROUPING, TEST_CALLIGRAPHY_VISIBLE_JLPT_CATEGORIES, TEST_CALLIGRAPHY_VISIBLE_JOYO_CATEGORIES
} from "../../Support/TestData";

import { buildRequirementTitle } from "../../Support/RequirementTest";
import { createAsyncValueRecorder } from "../../Support/DependencyFactories";

describe("CalligraphyInterface", () => {

  /**
   * Requirement: R42
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R42", "Unit", "Invariant", "not allowed grouping is selected"), () => {
    const controller = CreateCalligraphyController({
      getCategories: async () => {
        return [
          ...TEST_CALLIGRAPHY_VISIBLE_JLPT_CATEGORIES,
          ...TEST_CALLIGRAPHY_VISIBLE_JOYO_CATEGORIES
        ];
      },
      navigateToCategory: async () => undefined
    });
    expect(() => {
      controller.selectGrouping(TEST_CALLIGRAPHY_INVALID_GROUPING as any);
    }, "CalligraphyInterface accepted an unsupported grouping.").toThrow();
  });

  /**
   * Requirement: R42
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R42", "Unit", "Postcondition", "active grouping changes to the selected value"), () => {
    const controller = CreateCalligraphyController({
      getCategories: async () => {
        return [
          ...TEST_CALLIGRAPHY_VISIBLE_JLPT_CATEGORIES,
          ...TEST_CALLIGRAPHY_VISIBLE_JOYO_CATEGORIES
        ];
      },
      navigateToCategory: async () => undefined
    });

    controller.selectGrouping(TEST_CALLIGRAPHY_JOYO_GROUPING);
    expect(controller.getActiveGrouping(), "CalligraphyInterface did not update the active grouping to Joyo.").toBe(TEST_CALLIGRAPHY_JOYO_GROUPING);

    controller.selectGrouping(TEST_CALLIGRAPHY_JLPT_GROUPING);
    expect(controller.getActiveGrouping(), "CalligraphyInterface did not update the active grouping to JLPT.").toBe(TEST_CALLIGRAPHY_JLPT_GROUPING);
  });

  /**
   * Requirement: R43
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R43", "Unit", "Invariant", "visible categories belong exclusively to the active grouping"), async () => {
    const controller = CreateCalligraphyController({
      getCategories: async () => [
        ...TEST_CALLIGRAPHY_VISIBLE_JLPT_CATEGORIES,
        ...TEST_CALLIGRAPHY_VISIBLE_JOYO_CATEGORIES
      ],
      navigateToCategory: async () => undefined
    });

    controller.selectGrouping(TEST_CALLIGRAPHY_JLPT_GROUPING);

    expect(
      controller.getVisibleCategories().every(
        (category) => category.grouping === TEST_CALLIGRAPHY_JLPT_GROUPING,
        "CalligraphyInterface did not show only JLPT categories for the selected grouping."
      )
    ).toBe(true);

    controller.selectGrouping(TEST_CALLIGRAPHY_JOYO_GROUPING);

    expect(
      controller.getVisibleCategories().every(
        (category) => category.grouping === TEST_CALLIGRAPHY_JOYO_GROUPING,
        "CalligraphyInterface did not show only Joyo categories for the selected grouping."
      )
    ).toBe(true);
  });

  /**
   * Requirement: R43
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R43", "Unit", "Postcondition", "shows categories for the selected grouping"), async () => {
    const controller = CreateCalligraphyController({
      getCategories: async () => [
        ...TEST_CALLIGRAPHY_VISIBLE_JLPT_CATEGORIES,
        ...TEST_CALLIGRAPHY_VISIBLE_JOYO_CATEGORIES
      ],
      navigateToCategory: async () => undefined
    });

    controller.selectGrouping(TEST_CALLIGRAPHY_JLPT_GROUPING);

    expect(controller.getVisibleCategories(), "CalligraphyInterface did not show JLPT categories for the selected grouping.").toEqual(
      TEST_CALLIGRAPHY_VISIBLE_JLPT_CATEGORIES
    );

    controller.selectGrouping(TEST_CALLIGRAPHY_JOYO_GROUPING);

    expect(controller.getVisibleCategories(), "CalligraphyInterface did not show Joyo categories for the selected grouping.").toEqual(
      TEST_CALLIGRAPHY_VISIBLE_JOYO_CATEGORIES
    );
  });

  /**
   * Requirement: R44
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R44", "Unit", "Invariant", "residual category appears only when unclassified kanjis exist"), async () => {
    const controller = CreateCalligraphyController({
      getCategories: async () => [
        ...TEST_CALLIGRAPHY_VISIBLE_JLPT_CATEGORIES.filter((category) => !category.isResidual),
        ...TEST_CALLIGRAPHY_VISIBLE_JOYO_CATEGORIES.filter((category) => !category.isResidual)
      ],
      navigateToCategory: async () => undefined
    });

    controller.selectGrouping(TEST_CALLIGRAPHY_JLPT_GROUPING);

    expect(
      controller.getVisibleCategories().some((category) => category.isResidual),
      "CalligraphyInterface display residual category for JLPT grouping when no unclassified kanjis exist."
    ).toBe(false);

    controller.selectGrouping(TEST_CALLIGRAPHY_JOYO_GROUPING);

    expect(
      controller.getVisibleCategories().some((category) => category.isResidual),
      "CalligraphyInterface display residual category for Joyo grouping when no unclassified kanjis exist."
    ).toBe(false);
  });

  /**
   * Requirement: R44
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R44", "Unit", "Postcondition", "shows the residual category together with regular categories"), async () => {
    const controller = CreateCalligraphyController({
      getCategories: async () => [
        ...TEST_CALLIGRAPHY_VISIBLE_JLPT_CATEGORIES,
        ...TEST_CALLIGRAPHY_VISIBLE_JOYO_CATEGORIES
      ],
      navigateToCategory: async () => undefined
    });

    controller.selectGrouping(TEST_CALLIGRAPHY_JOYO_GROUPING);

    expect(controller.getVisibleCategories(), "CalligraphyInterface did not show Joyo categories for the selected grouping when unclassified kanjis exist.").toEqual(
      TEST_CALLIGRAPHY_VISIBLE_JOYO_CATEGORIES
    );

    controller.selectGrouping(TEST_CALLIGRAPHY_JLPT_GROUPING);

    expect(controller.getVisibleCategories(), "CalligraphyInterface did not show JLPT categories for the selected grouping when unclassified kanjis exist.").toEqual(
      TEST_CALLIGRAPHY_VISIBLE_JLPT_CATEGORIES
    );
  });

  /**
   * Requirement: R46
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R46", "Unit", "Postcondition", "navigates to every selected category"), async () => {
    const visibleCategories = [
      ...TEST_CALLIGRAPHY_VISIBLE_JLPT_CATEGORIES,
      ...TEST_CALLIGRAPHY_VISIBLE_JOYO_CATEGORIES
    ];

    const navigateToCategoryRecorder = createAsyncValueRecorder(undefined);

    const controller = CreateCalligraphyController({
      getCategories: async () => visibleCategories,
      navigateToCategory: navigateToCategoryRecorder.handler
    });

    for (const category of visibleCategories) {
      await controller.openCategory(category.id);
    }

    expect(navigateToCategoryRecorder.calls.length).toBe(
      visibleCategories.length,
      "CalligraphyInterface did not navigate for every selected category."
    );

    expect(navigateToCategoryRecorder.calls).toEqual(
      visibleCategories.map((category) => category.id),
      "CalligraphyInterface did not navigate using the expected category ids."
    );
  });
});
