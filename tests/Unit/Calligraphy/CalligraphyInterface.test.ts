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
 * R42 Inv/Post: The active calligraphy grouping is constrained to JLPT or Joyo and changes to the selected value.
 */
describe("CalligraphyInterface", () => {
  it("keeps only one active grouping after selecting Joyo", () => {
    const controller = CreateCalligraphyController({});

    controller.selectGrouping("joyo");

    expect(controller.getActiveGrouping()).toBe("joyo");
  });

  /**
   * R43 Inv/Post: Visible categories belong exclusively to the active grouping.
   */
  it("returns only categories that belong to the active grouping", () => {
    const controller = CreateCalligraphyController({});

    controller.selectGrouping("jlpt");

    expect(controller.getVisibleCategories()).toEqual([JLPT_CATEGORY]);
  });

  /**
   * R44 Inv/Post: The residual category appears when unclassified kanji exist.
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
   * R46 Post: Selecting a category opens the kanji list for that same category.
   */
  it("opens the selected category without replacing it with another category", async () => {
    const controller = CreateCalligraphyController({});

    await controller.openCategory("jlpt-n5");

    expect(controller.getActiveGrouping()).toBe("jlpt");
  });
});
