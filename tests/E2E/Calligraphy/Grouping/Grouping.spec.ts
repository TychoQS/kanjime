import { expect, test } from "@playwright/test";

import { E2ECalligraphyPage } from "../../../Support/E2ECalligraphyPage";
import {
  TEST_CALLIGRAPHY_CATEGORY_ID,
  TEST_CALLIGRAPHY_E2E_MESSAGES,
  TEST_CALLIGRAPHY_JLPT_CATEGORY_IDS,
  TEST_CALLIGRAPHY_JLPT_GROUPING,
  TEST_CALLIGRAPHY_JLPT_RESIDUAL_CATEGORY,
  TEST_CALLIGRAPHY_JOYO_GROUPING,
  TEST_CALLIGRAPHY_JOYO_RESIDUAL_CATEGORY,
  TEST_CALLIGRAPHY_TEST_IDS
} from "../../../Support/TestData";

test.beforeEach(async ({ page }) => {
  await new E2ECalligraphyPage(page).resetApplicationState();
});

test("[R42][E2E] CalligraphyInterface keeps exactly one selected grouping", async ({ page }) => {
  const calligraphy = new E2ECalligraphyPage(page);

  // Requirement: FUNCIONALES R42 - CalligraphyInterface
  // @pre The user is on the main calligraphy screen.
  await calligraphy.gotoHome();
  await expect(
    page.getByTestId(TEST_CALLIGRAPHY_TEST_IDS.groupingSegment),
    TEST_CALLIGRAPHY_E2E_MESSAGES.groupingSegmentVisible
  ).toBeVisible();

  // @inv Only one grouping can be active at the same time.
  await calligraphy.selectGrouping(TEST_CALLIGRAPHY_JOYO_GROUPING);
  await expect.poll(
    () => page.getByTestId(TEST_CALLIGRAPHY_TEST_IDS.groupingSegment)
      .locator("[aria-pressed='true']")
      .count(),
    {
      message: TEST_CALLIGRAPHY_E2E_MESSAGES.onlyOneGroupingActive
    }
  ).toBe(1);

  // @post The grouping selected by the user is active in the interface.
  await expect(
    calligraphy.groupingButton(TEST_CALLIGRAPHY_JOYO_GROUPING),
    TEST_CALLIGRAPHY_E2E_MESSAGES.selectedGroupingActive
  ).toHaveAttribute("aria-pressed", "true");
});

test("[R43][E2E] CalligraphyInterface shows categories for the active grouping", async ({ page }) => {
  const calligraphy = new E2ECalligraphyPage(page);

  // Requirement: FUNCIONALES R43 - CalligraphyInterface
  // @pre The user is on the main calligraphy screen with a selected grouping.
  await calligraphy.gotoHome();
  await calligraphy.selectGrouping(TEST_CALLIGRAPHY_JLPT_GROUPING);
  await expect(
    page.getByTestId(TEST_CALLIGRAPHY_TEST_IDS.categoriesPanel),
    TEST_CALLIGRAPHY_E2E_MESSAGES.categoryPanelVisible
  ).toBeVisible();

  // @inv Visible categories belong exclusively to the active grouping.
  const jlptCategoryIds = await calligraphy.visibleCategoryIds();
  expect(
    jlptCategoryIds.every(categoryId => categoryId.startsWith(TEST_CALLIGRAPHY_JLPT_GROUPING)),
    TEST_CALLIGRAPHY_E2E_MESSAGES.categoriesBelongToGrouping
  ).toBe(true);

  // @post Categories corresponding to the selected grouping are shown.
  expect(
    jlptCategoryIds.includes(TEST_CALLIGRAPHY_CATEGORY_ID),
    TEST_CALLIGRAPHY_E2E_MESSAGES.categoriesVisible
  ).toBe(true);
});

test("[R44][E2E] CalligraphyInterface exposes residual categories when needed", async ({ page }) => {
  const calligraphy = new E2ECalligraphyPage(page);

  // Requirement: FUNCIONALES R44 - CalligraphyInterface
  // @pre The user is on the main calligraphy screen.
  await calligraphy.gotoHome();

  // @inv The residual category remains accessible when unclassified kanji exist.
  await calligraphy.selectGrouping(TEST_CALLIGRAPHY_JLPT_GROUPING);
  await expect(
    calligraphy.categoryButton(TEST_CALLIGRAPHY_JLPT_RESIDUAL_CATEGORY.id),
    TEST_CALLIGRAPHY_E2E_MESSAGES.residualCategoryVisible
  ).toBeVisible();

  // @post A residual category is shown together with the normal categories when applicable.
  await calligraphy.selectGrouping(TEST_CALLIGRAPHY_JOYO_GROUPING);
  await expect(
    calligraphy.categoryButton(TEST_CALLIGRAPHY_JOYO_RESIDUAL_CATEGORY.id),
    TEST_CALLIGRAPHY_E2E_MESSAGES.residualCategoryVisible
  ).toBeVisible();
});

test("[R17][E2E] CalligraphyProps keeps the selected grouping visually identified", async ({ page }) => {
  const calligraphy = new E2ECalligraphyPage(page);

  // Requirement: USABILIDAD R17 - CalligraphyProps
  // @pre The user is on the main calligraphy screen.
  await calligraphy.gotoHome();

  // @inv The active grouping remains visible to the user while switching.
  await calligraphy.selectGrouping(TEST_CALLIGRAPHY_JOYO_GROUPING);
  await expect(
    calligraphy.groupingButton(TEST_CALLIGRAPHY_JOYO_GROUPING),
    TEST_CALLIGRAPHY_E2E_MESSAGES.selectedGroupingCurrent
  ).toHaveAttribute("aria-current", "page");

  // @post The selected option appears highlighted in the interface.
  await calligraphy.selectGrouping(TEST_CALLIGRAPHY_JLPT_GROUPING);
  await expect(
    calligraphy.groupingButton(TEST_CALLIGRAPHY_JLPT_GROUPING),
    TEST_CALLIGRAPHY_E2E_MESSAGES.selectedGroupingCurrent
  ).toHaveAttribute("aria-current", "page");
});

test("[R18][E2E] CalligraphyProps presents grouped categories as ordered navigation", async ({ page }) => {
  const calligraphy = new E2ECalligraphyPage(page);

  // Requirement: USABILIDAD R18 - CalligraphyProps
  // @pre The user is on the main calligraphy screen with a selected grouping.
  await calligraphy.gotoHome();
  await calligraphy.selectGrouping(TEST_CALLIGRAPHY_JLPT_GROUPING);

  // @inv Categories remain grouped by the active level family.
  const visibleCategoryIds = await calligraphy.visibleCategoryIds();
  expect(
    visibleCategoryIds.slice(0, TEST_CALLIGRAPHY_JLPT_CATEGORY_IDS.length),
    TEST_CALLIGRAPHY_E2E_MESSAGES.categoriesBelongToGrouping
  ).toEqual([...TEST_CALLIGRAPHY_JLPT_CATEGORY_IDS]);

  // @post Categories are ordered and navigable.
  await expect.poll(
    () => calligraphy.visibleCategoryButtons().evaluateAll(nodes => nodes.every(node => !node.hasAttribute("disabled"))),
    {
      message: TEST_CALLIGRAPHY_E2E_MESSAGES.categoryNavigable
    }
  ).toBe(true);
});
