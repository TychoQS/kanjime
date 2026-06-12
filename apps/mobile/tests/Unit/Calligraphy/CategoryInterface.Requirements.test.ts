import { describe, expect, it } from "vitest";

import { CreateCategoryController } from "../../../src/Features/Calligraphy/CreateCategoryController";
import { buildRequirementTitle } from "../../Support/RequirementTest";
import {
  TEST_CALLIGRAPHY_CATEGORY_ID,
  TEST_CALLIGRAPHY_JLPT_GROUPING,
  TEST_PRIMARY_CHARACTER,
  TEST_SEARCH_TERM
} from "../../Support/TestData";

describe("CategoryInterface requirements", () => {
  const categoryController = CreateCategoryController({
    getKanjiByCategory: async () => [],
    startCalligraphyPractice: async () => undefined,
    returnToCalligraphy: async () => undefined
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
  });
});
