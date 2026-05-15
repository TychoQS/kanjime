import { describe, expect, it } from "vitest";

import { CreateCategoryController } from "../../../src/Features/Calligraphy/CreateCategoryController";

/**
 * Requirement: R45
 * Type: Unit
 * Condition: Invariant and Postcondition
 */
describe("CategoryInterface", () => {
  it("returns selected category kanji ordered by ascending stroke count", async () => {
    const controller = CreateCategoryController({});

    const kanji = await controller.getKanjiByCategory("jlpt-n5");

    expect(kanji.map(entry => entry.character)).toEqual(["一", "二", "三"]);
    expect(kanji.every(entry => entry.categoryId === "jlpt-n5")).toBe(true);
    expect(kanji.map(entry => entry.strokeCount)).toEqual([1, 2, 3]);
  });

  /**
   * Requirement: R47
   * Type: Unit
   * Condition: Invariant and Postcondition
   */
  it("returns one category entry per kanji without duplicates", async () => {
    const controller = CreateCategoryController({});

    const kanji = await controller.getKanjiByCategory("jlpt-n5");
    const uniqueCharacters = new Set(kanji.map(entry => entry.character));

    expect(uniqueCharacters.size).toBe(kanji.length);
  });

  /**
   * Requirement: R48
   * Type: Unit
   * Condition: Postcondition
   */
  it("starts practice for the selected kanji", async () => {
    const controller = CreateCategoryController({});

    await controller.startPractice("水");

    await expect(controller.getKanjiByCategory("jlpt-n5")).resolves.toContainEqual(
      expect.objectContaining({ character: "水" })
    );
  });

  /**
   * Requirement: R49
   * Type: Unit
   * Condition: Postcondition
   */
  it("returns from the category list to the calligraphy home", async () => {
    const controller = CreateCategoryController({});

    await expect(controller.returnToCalligraphyHome()).resolves.toBeUndefined();
  });
});
