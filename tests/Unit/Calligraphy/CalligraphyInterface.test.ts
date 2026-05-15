import { describe, expect, it } from "vitest";

import { CreateCalligraphyController } from "../../../src/Features/Calligraphy/CreateCalligraphyController";
import {
  TEST_CALLIGRAPHY_CATEGORY_CHARACTERS,
  TEST_CALLIGRAPHY_INVALID_GROUPING,
  TEST_CALLIGRAPHY_JLPT_GROUPING, TEST_CALLIGRAPHY_JOYO_GROUPING, TEST_CALLIGRAPHY_VISIBLE_JLPT_CATEGORIES, TEST_CALLIGRAPHY_VISIBLE_JOYO_CATEGORIES
} from "../../Support/TestData";

import {buildRequirementTitle} from "../../Support/RequirementTest";
import {createAsyncValueRecorder} from "../../Support/DependencyFactories";

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

      getCategoryCharacters: async () => {
        return TEST_CALLIGRAPHY_CATEGORY_CHARACTERS;
      }
    });
    expect(() => {
      controller.selectGrouping(TEST_CALLIGRAPHY_INVALID_GROUPING as any);
    }).toThrow();
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

      getCategoryCharacters: async () => {
        return TEST_CALLIGRAPHY_CATEGORY_CHARACTERS;
      }
    });

    controller.selectGrouping(TEST_CALLIGRAPHY_JOYO_GROUPING);
    expect(controller.getActiveGrouping()).toBe(TEST_CALLIGRAPHY_JOYO_GROUPING);

    controller.selectGrouping(TEST_CALLIGRAPHY_JLPT_GROUPING);
    expect(controller.getActiveGrouping()).toBe(TEST_CALLIGRAPHY_JLPT_GROUPING);
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

      getCategoryCharacters: async () => {
        return TEST_CALLIGRAPHY_CATEGORY_CHARACTERS;
      }
    });

    controller.selectGrouping(TEST_CALLIGRAPHY_JLPT_GROUPING);

    expect(
        controller.getVisibleCategories().every(
            (category) => category.grouping === TEST_CALLIGRAPHY_JLPT_GROUPING
        )
    ).toBe(true);

    controller.selectGrouping(TEST_CALLIGRAPHY_JOYO_GROUPING);

    expect(
        controller.getVisibleCategories().every(
            (category) => category.grouping === TEST_CALLIGRAPHY_JOYO_GROUPING
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

      getCategoryCharacters: async () => {
        return TEST_CALLIGRAPHY_CATEGORY_CHARACTERS;
      }
    });

    controller.selectGrouping(TEST_CALLIGRAPHY_JLPT_GROUPING);

    expect(controller.getVisibleCategories()).toEqual(
        TEST_CALLIGRAPHY_VISIBLE_JLPT_CATEGORIES
    );

    controller.selectGrouping(TEST_CALLIGRAPHY_JOYO_GROUPING);

    expect(controller.getVisibleCategories()).toEqual(
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

      getCategoryCharacters: async () => {
        return TEST_CALLIGRAPHY_CATEGORY_CHARACTERS;
      }
    });

    controller.selectGrouping(TEST_CALLIGRAPHY_JLPT_GROUPING);

    expect(
        controller.getVisibleCategories().some((category) => category.isResidual)
    ).toBe(false);

    controller.selectGrouping(TEST_CALLIGRAPHY_JOYO_GROUPING);

    expect(
        controller.getVisibleCategories().some((category) => category.isResidual)
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

      getCategoryCharacters: async () => {
        return TEST_CALLIGRAPHY_CATEGORY_CHARACTERS;
      }
    });

    controller.selectGrouping(TEST_CALLIGRAPHY_JOYO_GROUPING);

    expect(controller.getVisibleCategories()).toEqual(
        TEST_CALLIGRAPHY_VISIBLE_JOYO_CATEGORIES
    );

    controller.selectGrouping(TEST_CALLIGRAPHY_JLPT_GROUPING);

    expect(controller.getVisibleCategories()).toEqual(
        TEST_CALLIGRAPHY_VISIBLE_JLPT_CATEGORIES
    );
  });

  /**
   * Requirement: R46
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R46", "Unit", "Postcondition", "requests kanjis for every selected category"), async () => {
    const visibleCategories = [
      ...TEST_CALLIGRAPHY_VISIBLE_JLPT_CATEGORIES,
      ...TEST_CALLIGRAPHY_VISIBLE_JOYO_CATEGORIES
    ];

    const categoriesRecorder = createAsyncValueRecorder(
        visibleCategories
    );

    const categoryCharactersRecorder = createAsyncValueRecorder(
        TEST_CALLIGRAPHY_CATEGORY_CHARACTERS
    );

    const controller = CreateCalligraphyController({
      getCategories: categoriesRecorder.handler,
      getCategoryCharacters: categoryCharactersRecorder.handler
    });

    for (const category of visibleCategories) {
      await controller.openCategory(category.id);
    }

    expect(categoryCharactersRecorder.calls.length).toBe(
        visibleCategories.length,
        "CalligraphyInterface did not request kanjis for every selected category."
    );

    expect(categoryCharactersRecorder.calls).toEqual(
        visibleCategories.map((category) => category.id),
        "CalligraphyInterface did not request kanjis using the expected category ids."
    );
  });
});
