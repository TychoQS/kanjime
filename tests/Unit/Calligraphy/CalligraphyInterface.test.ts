import { describe, expect, it } from "vitest";

import { CreateCalligraphyController } from "../../../src/Features/Calligraphy/CreateCalligraphyController";
import type { CalligraphyCategory } from "../../../src/Shared/DomainTypes";

const JLPT_CATEGORY: CalligraphyCategory = {
  id: "jlpt-n5",
  grouping: "jlpt",
  label: "JLPT N5",
  order: 1,
  isResidual: false,
  kanjiCount: 2
};

/**
 * Requirement: R42
 * Type: Unit
 * Condition: Invariant and Postcondition
 */
describe("CalligraphyInterface", () => {
  it("keeps only one active grouping after selecting Joyo", () => {
    const controller = CreateCalligraphyController({});

    controller.selectGrouping("joyo");

    expect(controller.getActiveGrouping()).toBe("joyo");
  });

  /**
   * Requirement: R43
   * Type: Unit
   * Condition: Invariant and Postcondition
   */
  it("returns only categories that belong to the active grouping", () => {
    const controller = CreateCalligraphyController({});

    controller.selectGrouping("jlpt");

    expect(controller.getVisibleCategories()).toEqual([JLPT_CATEGORY]);
  });

  /**
   * Requirement: R44
   * Type: Unit
   * Condition: Invariant and Postcondition
   */
  it("includes a residual category together with regular categories when required", () => {
    const controller = CreateCalligraphyController({});

    controller.selectGrouping("joyo");

    expect(controller.getVisibleCategories()).toContainEqual({
      id: "joyo-unclassified",
      grouping: "joyo",
      label: "Unclassified",
      order: 999,
      isResidual: true,
      kanjiCount: 1
    });
  });

  /**
   * Requirement: R46
   * Type: Unit
   * Condition: Postcondition
   */
  it("opens the selected category without replacing it with another category", async () => {
    const controller = CreateCalligraphyController({});

    await controller.openCategory("jlpt-n5");

    expect(controller.getActiveGrouping()).toBe("jlpt");
  });
});
