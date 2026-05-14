import { describe, expect, it } from "vitest";

import { CreateCategoryController } from "../../../src/Features/Calligraphy/CreateCategoryController";

/**
 * R45 Inv/Post: Category kanji belong exclusively to the selected category and are ordered by ascending stroke count.
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
   * R47 Inv/Post: Every kanji has exactly one visual entry associated with it.
   */
  it("returns one category entry per kanji without duplicates", async () => {
    const controller = CreateCategoryController({});

    const kanji = await controller.getKanjiByCategory("jlpt-n5");
    const uniqueCharacters = new Set(kanji.map(entry => entry.character));

    expect(uniqueCharacters.size).toBe(kanji.length);
  });

  /**
   * R48 Post: Selecting a kanji starts calligraphy practice for that kanji.
   */
  it("starts practice for the selected kanji", async () => {
    const controller = CreateCategoryController({});

    await controller.startPractice("水");

    await expect(controller.getKanjiByCategory("jlpt-n5")).resolves.toContainEqual(
      expect.objectContaining({ character: "水" })
    );
  });

  /**
   * R49 Post: The category list can return to the main calligraphy screen.
   */
  it("returns from the category list to the calligraphy home", async () => {
    const controller = CreateCategoryController({});

    await expect(controller.returnToCalligraphyHome()).resolves.toBeUndefined();
  });
});
