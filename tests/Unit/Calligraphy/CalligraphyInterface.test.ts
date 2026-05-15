import { describe, expect, it } from "vitest";

import { CreateCalligraphyController } from "../../../src/Features/Calligraphy/CreateCalligraphyController";
import {
  TEST_CALLIGRAPHY_CATEGORY,
  TEST_CALLIGRAPHY_CATEGORY_ID,
  TEST_CALLIGRAPHY_JLPT_GROUPING,
  TEST_CALLIGRAPHY_JOYO_GROUPING,
  TEST_CALLIGRAPHY_RESIDUAL_CATEGORY
} from "../../Support/TestData";

/**
 * Requirement: R42
 * Type: Unit
 * Condition: Invariant and Postcondition
 */
describe("CalligraphyInterface", () => {
  it("keeps only one active grouping after selecting Joyo", () => {
    const controller = CreateCalligraphyController({});

    controller.selectGrouping(TEST_CALLIGRAPHY_JOYO_GROUPING);

    expect(controller.getActiveGrouping()).toBe(TEST_CALLIGRAPHY_JOYO_GROUPING);
  });

  /**
   * Requirement: R43
   * Type: Unit
   * Condition: Invariant and Postcondition
   */
  it("returns only categories that belong to the active grouping", () => {
    const controller = CreateCalligraphyController({});

    controller.selectGrouping(TEST_CALLIGRAPHY_JLPT_GROUPING);

    expect(controller.getVisibleCategories()).toEqual([TEST_CALLIGRAPHY_CATEGORY]);
  });

  /**
   * Requirement: R44
   * Type: Unit
   * Condition: Invariant and Postcondition
   */
  it("includes a residual category together with regular categories when required", () => {
    const controller = CreateCalligraphyController({});

    controller.selectGrouping(TEST_CALLIGRAPHY_JOYO_GROUPING);

    expect(controller.getVisibleCategories()).toContainEqual(TEST_CALLIGRAPHY_RESIDUAL_CATEGORY);
  });

  /**
   * Requirement: R46
   * Type: Unit
   * Condition: Postcondition
   */
  it("opens the selected category without replacing it with another category", async () => {
    const controller = CreateCalligraphyController({});

    await controller.openCategory(TEST_CALLIGRAPHY_CATEGORY_ID);

    expect(controller.getActiveGrouping()).toBe(TEST_CALLIGRAPHY_JLPT_GROUPING);
  });
});
