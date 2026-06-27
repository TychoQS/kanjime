import { describe, expect, it } from "vitest";

import { CreateCategoryController } from "../../../src/Features/Calligraphy/CreateCategoryController";
import {
  TEST_CALLIGRAPHY_CATEGORY_ID, TEST_CALLIGRAPHY_JLPT_GROUPING, TEST_CALLIGRAPHY_KANJI_BY_CATEGORY_CASES,
  TEST_CALLIGRAPHY_TARGET_CHARACTER,
  TEST_PRIMARY_CHARACTER,
  TEST_SEARCH_TERM
} from "../../Support/TestData";
import { buildRequirementTitle } from "../../Support/RequirementTest";
import { createAsyncArgumentRecorder, createAsyncValueRecorder } from "../../Support/DependencyFactories";


describe("CategoryInterface", () => {

  const categoryController = CreateCategoryController({
    getKanjiByCategory: async () => [],
    startCalligraphyPractice: async () => undefined,
    returnToCalligraphy: async () => undefined
  });

  /**
   * Requirement: R45
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R45", "Unit", "Invariant", "kanjis belong exclusively to the selected category"), async () => {
    for (const categoryCase of TEST_CALLIGRAPHY_KANJI_BY_CATEGORY_CASES) {
      const kanjiRecorder = createAsyncArgumentRecorder<string, typeof categoryCase.unsortedKanji>(categoryCase.unsortedKanji);
      const startCalligraphyPractice = createAsyncArgumentRecorder<string, void>(undefined);
      const returnToCalligraphyRecorder = createAsyncValueRecorder(undefined);

      const controller = CreateCategoryController({
        getKanjiByCategory: kanjiRecorder.handler,
        startCalligraphyPractice: startCalligraphyPractice.handler,
        returnToCalligraphy: returnToCalligraphyRecorder.handler
      });

      const kanji = await controller.getKanjiByCategory(categoryCase.categoryId);

      expect(
        kanji.every((entry) => entry.categoryId === categoryCase.categoryId)
      ).toBe(
        true,
        `CategoryInterface returned kanjis outside category ${categoryCase.categoryId}.`
      );
    }
  });

  /**
   * Requirement: R45
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R45", "Unit", "Postcondition", "kanjis are ordered by ascending stroke count"), async () => {
    for (const categoryCase of TEST_CALLIGRAPHY_KANJI_BY_CATEGORY_CASES) {
      const kanjiRecorder = createAsyncArgumentRecorder<string, typeof categoryCase.unsortedKanji>(categoryCase.unsortedKanji);
      const startCalligraphyPractice = createAsyncArgumentRecorder<string, void>(undefined);
      const returnToCalligraphyRecorder = createAsyncValueRecorder(undefined);

      const controller = CreateCategoryController({
        getKanjiByCategory: kanjiRecorder.handler,
        startCalligraphyPractice: startCalligraphyPractice.handler,
        returnToCalligraphy: returnToCalligraphyRecorder.handler
      });

      const kanji = await controller.getKanjiByCategory(categoryCase.categoryId);

      expect(kanji).toEqual(
        categoryCase.sortedKanji,
        `CategoryInterface did not sort kanjis for category ${categoryCase.categoryId}.`
      );
    }
  });

  /**
   * Requirement: R47
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R47", "Unit", "Invariant", "each kanji has exactly one visual entry"), async () => {
    for (const categoryCase of TEST_CALLIGRAPHY_KANJI_BY_CATEGORY_CASES) {
      const kanjiRecorder = createAsyncArgumentRecorder<string, typeof categoryCase.unsortedKanji>(categoryCase.unsortedKanji);
      const startCalligraphyPractice = createAsyncArgumentRecorder<string, void>(undefined);
      const returnToCalligraphyRecorder = createAsyncValueRecorder(undefined);

      const controller = CreateCategoryController({
        getKanjiByCategory: kanjiRecorder.handler,
        startCalligraphyPractice: startCalligraphyPractice.handler,
        returnToCalligraphy: returnToCalligraphyRecorder.handler
      });

      const kanji = await controller.getKanjiByCategory(categoryCase.categoryId);
      const uniqueCharacters = new Set(kanji.map((entry) => entry.character));

      expect(uniqueCharacters.size).toBe(
        kanji.length,
        `CategoryInterface returned duplicated entries for category ${categoryCase.categoryId}.`
      );
    }
  });

  /**
   * Requirement: R47
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R47", "Unit", "Postcondition", "visual entries are shown for all kanjis in the selected category"), async () => {
    for (const categoryCase of TEST_CALLIGRAPHY_KANJI_BY_CATEGORY_CASES) {
      const kanjiRecorder = createAsyncArgumentRecorder<string, typeof categoryCase.unsortedKanji>(categoryCase.unsortedKanji);
      const startCalligraphyPractice = createAsyncArgumentRecorder<string, void>(undefined);
      const returnToCalligraphyRecorder = createAsyncValueRecorder(undefined);

      const controller = CreateCategoryController({
        getKanjiByCategory: kanjiRecorder.handler,
        startCalligraphyPractice: startCalligraphyPractice.handler,
        returnToCalligraphy: returnToCalligraphyRecorder.handler
      });

      const kanji = await controller.getKanjiByCategory(categoryCase.categoryId);

      expect(kanji).toHaveLength(
        categoryCase.sortedKanji.length,
        `CategoryInterface did not return one entry per kanji for category ${categoryCase.categoryId}.`
      );

      expect(kanji.map((entry) => entry.character)).toEqual(
        categoryCase.sortedKanji.map((entry) => entry.character),
        `CategoryInterface did not return entries for all kanjis in category ${categoryCase.categoryId}.`
      );
    }
  });

  /**
   * Requirement: R48
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R48", "Unit", "Postcondition", "selected kanji becomes the calligraphy practice target"), async () => {
    const practiceRecorder = createAsyncArgumentRecorder<string, void>(undefined);
    const returnToCalligraphyRecorder = createAsyncValueRecorder(undefined);
    const controller = CreateCategoryController({
      getKanjiByCategory: createAsyncArgumentRecorder<string, []>([]).handler,
      startCalligraphyPractice: practiceRecorder.handler,
      returnToCalligraphy: returnToCalligraphyRecorder.handler
    });

    await controller.startPractice(TEST_CALLIGRAPHY_TARGET_CHARACTER);

    expect(practiceRecorder.calls).toEqual(
      [TEST_CALLIGRAPHY_TARGET_CHARACTER],
      `CategoryInterface did not start calligraphy practice for selected kanji ${TEST_CALLIGRAPHY_TARGET_CHARACTER}.`
    );
  });

  /**
   * Requirement: R49
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R49", "Unit", "Postcondition", "returns from the category list to the calligraphy home"), async () => {
    const kanjiRecorder = createAsyncArgumentRecorder<string, []>([]);
    const practiceRecorder = createAsyncArgumentRecorder<string, void>(undefined);
    const returnToCalligraphyRecorder = createAsyncValueRecorder(undefined);

    const controller = CreateCategoryController({
      getKanjiByCategory: kanjiRecorder.handler,
      startCalligraphyPractice: practiceRecorder.handler,
      returnToCalligraphy: returnToCalligraphyRecorder.handler
    });

    await controller.returnToCalligraphyHome();

    expect(returnToCalligraphyRecorder.calls.length).toBe(
      1,
      "CategoryInterface did not return from the category list to the calligraphy home."
    );
  });

  /**
     * Requirement R67 - Precondition (valid):
     * a valid hiragana, katakana, or kanji term should filter the selected category list.
     */
  it(buildRequirementTitle("R67", "Unit", "Precondition", "valid category search terms are accepted"), async () => {
    await expect(
      categoryController.searchKanjiByCategory(TEST_CALLIGRAPHY_CATEGORY_ID, TEST_SEARCH_TERM),
      "R67 valid precondition should accept a search term while the selected category is visible."
    ).resolves.toEqual([
      expect.objectContaining({
        categoryId: TEST_CALLIGRAPHY_CATEGORY_ID,
        grouping: TEST_CALLIGRAPHY_JLPT_GROUPING,
        character: TEST_PRIMARY_CHARACTER
      })
    ]);
  });

  /**
   * Requirement R67 - Precondition (invalid):
   * an empty search term should be rejected for category filtering.
   */
  it(buildRequirementTitle("R67", "Unit", "Precondition", "empty category search terms are rejected"), async () => {
    await expect(
      categoryController.searchKanjiByCategory(TEST_CALLIGRAPHY_CATEGORY_ID, ""),
      "R67 invalid precondition should reject an empty search term in the category list."
    ).rejects.toThrow("valid search term");
  });

  /**
   * Requirement R67 - Invariant:
   * filtered results should remain inside the selected category.
   */
  it(buildRequirementTitle("R67", "Unit", "Invariant", "filtered results stay inside the selected category"), async () => {
    const filteredResults = await categoryController.searchKanjiByCategory(TEST_CALLIGRAPHY_CATEGORY_ID, TEST_SEARCH_TERM);

    expect(
      filteredResults.every(result => result.categoryId === TEST_CALLIGRAPHY_CATEGORY_ID),
      "R67 invariant should keep every filtered kanji inside the selected category."
    ).toBe(true);
  });

  /**
   * Requirement R67 - Postcondition:
   * only matching kanji should remain visible after searching inside the category.
   */
  it(buildRequirementTitle("R67", "Unit", "Postcondition", "only matching kanji remain visible after category filtering"), async () => {
    const filteredResults = await categoryController.searchKanjiByCategory(TEST_CALLIGRAPHY_CATEGORY_ID, TEST_SEARCH_TERM);

    expect(
      filteredResults.map(result => result.character),
      "R67 postcondition should leave only kanji matching the introduced search term."
    ).toEqual([TEST_PRIMARY_CHARACTER]);

    const nonExistentSearchTerm = "zzz";
    const filteredResultsNonExistent = await categoryController.searchKanjiByCategory(TEST_CALLIGRAPHY_CATEGORY_ID, nonExistentSearchTerm);
    expect(
      filteredResultsNonExistent,
      "R67 postcondition should leave no kanji after searching for a non-existent term in the category list."
    ).toEqual([]);
  });

});
