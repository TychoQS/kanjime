import { expect, test } from "@playwright/test";

import { E2ECalligraphyPage } from "../../../Support/E2ECalligraphyPage";
import {
  TEST_CALLIGRAPHY_CATEGORY_ID,
  TEST_CALLIGRAPHY_E2E_MESSAGES,
  TEST_CALLIGRAPHY_JLPT_CATEGORY_IDS,
  TEST_CALLIGRAPHY_JLPT_GROUPING,
  TEST_CALLIGRAPHY_JOYO_CATEGORY_GRADES,
  TEST_CALLIGRAPHY_JOYO_GROUPING,
  TEST_CALLIGRAPHY_TEST_IDS
} from "../../../Support/TestData";

test.beforeEach(async ({ page }) => {
  await new E2ECalligraphyPage(page).resetApplicationState();
});

test("[R45][E2E] CategoryInterface shows category kanji ordered by stroke count", async ({ page }) => {
  const calligraphy = new E2ECalligraphyPage(page);

  // Requirement: FUNCIONALES R45 - CategoryInterface
  // @pre The user enters a kanji category.
  await calligraphy.gotoHome();
  await calligraphy.selectGrouping(TEST_CALLIGRAPHY_JLPT_GROUPING);
  await calligraphy.openCategory(TEST_CALLIGRAPHY_CATEGORY_ID);

  // @inv Visible kanji belong to the selected category screen.
  const entries = await calligraphy.visibleKanjiEntries();
  expect(entries.length, TEST_CALLIGRAPHY_E2E_MESSAGES.categoryKanjiVisible).toBeGreaterThan(0);
  await expect.poll(
    () => page.evaluate(() => window.location.pathname),
    {
      message: TEST_CALLIGRAPHY_E2E_MESSAGES.listMatchesSelectedCategory
    }
  ).toContain(TEST_CALLIGRAPHY_CATEGORY_ID);

  // @post Kanji are shown sorted by ascending stroke count.
  const strokeCounts = entries.map(entry => entry.strokeCount);
  expect(
    strokeCounts.every(strokeCount => Number.isFinite(strokeCount)),
    TEST_CALLIGRAPHY_E2E_MESSAGES.resultTextReadable
  ).toBe(true);
  expect(
    strokeCounts,
    TEST_CALLIGRAPHY_E2E_MESSAGES.categoryKanjiSorted
  ).toEqual([...strokeCounts].sort((left, right) => left - right));
});

test("[R46][E2E] CalligraphyInterface opens the selected category list", async ({ page }) => {
  const calligraphy = new E2ECalligraphyPage(page);

  // Requirement: FUNCIONALES R46 - CalligraphyInterface
  // @pre
  await calligraphy.gotoHome();
  await calligraphy.selectGrouping(TEST_CALLIGRAPHY_JLPT_GROUPING);

  // @post The list of kanji belonging to the selected category is shown.
  await calligraphy.openCategory(TEST_CALLIGRAPHY_CATEGORY_ID);
  await expect.poll(
    () => page.evaluate(() => window.location.pathname),
    { message: TEST_CALLIGRAPHY_E2E_MESSAGES.categoryRouteSelected }
  ).toContain(TEST_CALLIGRAPHY_CATEGORY_ID);
  await expect(
    calligraphy.kanjiButtons().first(),
    TEST_CALLIGRAPHY_E2E_MESSAGES.categoryKanjiVisible
  ).toBeVisible();
});

test("[R47][E2E] CategoryInterface renders one visual entry for each visible kanji", async ({ page }) => {
  const calligraphy = new E2ECalligraphyPage(page);

  // Requirement: FUNCIONALES R47 - CategoryInterface
  // @pre The user is on the kanji list for a category.
  await calligraphy.gotoHome();

  // @inv No kanji has duplicated visible entries.
  // @post Every visible category kanji has a rendered entry.
  await calligraphy.selectGrouping(TEST_CALLIGRAPHY_JLPT_GROUPING);
  for (const categoryId of TEST_CALLIGRAPHY_JLPT_CATEGORY_IDS) {
    await calligraphy.openCategory(categoryId);
    const entries = await calligraphy.visibleKanjiEntries();
    const uniqueCharacters = new Set(entries.map(entry => entry.character));
    expect(uniqueCharacters.size, TEST_CALLIGRAPHY_E2E_MESSAGES.noDuplicateEntries).toBe(entries.length);
    await expect.poll(
      () => calligraphy.kanjiButtons().count(),
      { message: TEST_CALLIGRAPHY_E2E_MESSAGES.categoryKanjiVisible }
    ).toBe(entries.length);
    await calligraphy.gotoHome();
    await calligraphy.selectGrouping(TEST_CALLIGRAPHY_JLPT_GROUPING);
  }

  await calligraphy.selectGrouping(TEST_CALLIGRAPHY_JOYO_GROUPING);
  for (const grade of TEST_CALLIGRAPHY_JOYO_CATEGORY_GRADES) {
    await calligraphy.openCategory(`joyo-grade-${grade}`);
    const entries = await calligraphy.visibleKanjiEntries();
    const uniqueCharacters = new Set(entries.map(entry => entry.character));
    expect(uniqueCharacters.size, TEST_CALLIGRAPHY_E2E_MESSAGES.noDuplicateEntries).toBe(entries.length);
    await expect.poll(
      () => calligraphy.kanjiButtons().count(),
      { message: TEST_CALLIGRAPHY_E2E_MESSAGES.categoryKanjiVisible }
    ).toBe(entries.length);
    await calligraphy.gotoHome();
    await calligraphy.selectGrouping(TEST_CALLIGRAPHY_JOYO_GROUPING);
  }
});

test("[R48][E2E] CategoryInterface starts practice for the selected kanji", async ({ page }) => {
  const calligraphy = new E2ECalligraphyPage(page);

  // Requirement: FUNCIONALES R48 - CategoryInterface
  // @pre The user is on the kanji list for a category.
  await calligraphy.gotoHome();
  await calligraphy.selectGrouping(TEST_CALLIGRAPHY_JLPT_GROUPING);
  await calligraphy.openCategory(TEST_CALLIGRAPHY_CATEGORY_ID);

  // @post The selected kanji becomes the target of an active calligraphy practice.
  const selectedCharacter = await calligraphy.openFirstVisiblePractice();
  await expect.poll(
    () => page.evaluate(() => decodeURIComponent(window.location.pathname)),
    {
      message: TEST_CALLIGRAPHY_E2E_MESSAGES.practiceRouteSelected
    }
  ).toContain(selectedCharacter);
  await expect(
    page.getByTestId(TEST_CALLIGRAPHY_TEST_IDS.practiceCanvas),
    TEST_CALLIGRAPHY_E2E_MESSAGES.practiceCanvasVisible
  ).toBeVisible();
});

test("[R49][E2E] CategoryInterface returns from category list to calligraphy home", async ({ page }) => {
  const calligraphy = new E2ECalligraphyPage(page);

  // Requirement: FUNCIONALES R49 - CategoryInterface
  // @pre The user is on the kanji list for a category.
  await calligraphy.gotoHome();
  await calligraphy.selectGrouping(TEST_CALLIGRAPHY_JLPT_GROUPING);
  await calligraphy.openCategory(TEST_CALLIGRAPHY_CATEGORY_ID);
  await expect(
    page.getByTestId(TEST_CALLIGRAPHY_TEST_IDS.categoryBackButton),
    TEST_CALLIGRAPHY_E2E_MESSAGES.categoryBackVisible
  ).toBeVisible();

  // @post The application returns to the main calligraphy screen.
  await page.getByTestId(TEST_CALLIGRAPHY_TEST_IDS.categoryBackButton).click();
  await expect(
    page.getByTestId(TEST_CALLIGRAPHY_TEST_IDS.view),
    TEST_CALLIGRAPHY_E2E_MESSAGES.returnedHome
  ).toBeVisible();
});
