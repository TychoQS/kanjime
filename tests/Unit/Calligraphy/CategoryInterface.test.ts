import { describe, expect, it } from "vitest";

import { CreateCategoryController } from "../../../src/Features/Calligraphy/CreateCategoryController";
import {
  TEST_CALLIGRAPHY_CATEGORY_CHARACTERS,
  TEST_CALLIGRAPHY_CATEGORY_ID,
  TEST_CALLIGRAPHY_CATEGORY_STROKE_COUNTS,
  TEST_CALLIGRAPHY_TARGET_CHARACTER
} from "../../Support/TestData";

/**
 * Requirement: R45
 * Type: Unit
 * Condition: Invariant and Postcondition
 */
describe("CategoryInterface", () => {
  it("returns selected category kanji ordered by ascending stroke count", async () => {
    const controller = CreateCategoryController({});

    const kanji = await controller.getKanjiByCategory(TEST_CALLIGRAPHY_CATEGORY_ID);

    expect(kanji.map(entry => entry.character)).toEqual(TEST_CALLIGRAPHY_CATEGORY_CHARACTERS);
    expect(kanji.every(entry => entry.categoryId === TEST_CALLIGRAPHY_CATEGORY_ID)).toBe(true);
    expect(kanji.map(entry => entry.strokeCount)).toEqual(TEST_CALLIGRAPHY_CATEGORY_STROKE_COUNTS);
  });

  /**
   * Requirement: R47
   * Type: Unit
   * Condition: Invariant and Postcondition
   */
  it("returns one category entry per kanji without duplicates", async () => {
    const controller = CreateCategoryController({});

    const kanji = await controller.getKanjiByCategory(TEST_CALLIGRAPHY_CATEGORY_ID);
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

    await controller.startPractice(TEST_CALLIGRAPHY_TARGET_CHARACTER);

    await expect(controller.getKanjiByCategory(TEST_CALLIGRAPHY_CATEGORY_ID)).resolves.toContainEqual(
      expect.objectContaining({ character: TEST_CALLIGRAPHY_TARGET_CHARACTER })
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
