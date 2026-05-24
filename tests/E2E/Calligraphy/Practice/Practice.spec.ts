import { expect, test } from "@playwright/test";

import { E2ECalligraphyPage } from "../../../Support/E2ECalligraphyPage";
import {
  TEST_CALLIGRAPHY_CATEGORY_ID,
  TEST_CALLIGRAPHY_E2E_MESSAGES,
  TEST_CALLIGRAPHY_TEST_IDS,
  TEST_CALLIGRAPHY_VISUAL_THRESHOLDS
} from "../../../Support/TestData";

test.beforeEach(async ({ page }) => {
  await new E2ECalligraphyPage(page).resetApplicationState();
});

test("[R50][E2E] KanjiPracticeInterface returns from practice to selected category", async ({ page }) => {
  const calligraphy = new E2ECalligraphyPage(page);

  // Requirement: FUNCIONALES R50 - KanjiPracticeInterface
  // @pre The user is in an active calligraphy practice.
  await calligraphy.startPracticeFromDefaultCategory();
  await expect(
    page.getByTestId(TEST_CALLIGRAPHY_TEST_IDS.backButton),
    TEST_CALLIGRAPHY_E2E_MESSAGES.categoryBackVisible
  ).toBeVisible();

  // @post The application returns to the selected category list.
  await page.getByTestId(TEST_CALLIGRAPHY_TEST_IDS.backButton).click();
  await expect(
    page.getByTestId(TEST_CALLIGRAPHY_TEST_IDS.categoryView),
    TEST_CALLIGRAPHY_E2E_MESSAGES.returnedCategory
  ).toBeVisible();
  await expect.poll(
    () => page.evaluate(() => window.location.pathname),
    {
      message: TEST_CALLIGRAPHY_E2E_MESSAGES.categoryRouteSelected
    }
  ).toContain(TEST_CALLIGRAPHY_CATEGORY_ID);
});

test("[R51][E2E] CalligraphyCanvasInterface captures visible strokes in drawing order", async ({ page }) => {
  const calligraphy = new E2ECalligraphyPage(page);

  // Requirement: FUNCIONALES R51 - CalligraphyCanvasInterface
  // @pre The user is in an active calligraphy practice.
  await calligraphy.startPracticeFromDefaultCategory();

  // @post - el trazo aparece en pantalla tras dibujarlo
  await calligraphy.drawStroke(0);
  await expect.poll(
    () => calligraphy.hasVisibleStroke(),
    { message: TEST_CALLIGRAPHY_E2E_MESSAGES.strokeVisible }
  ).toBe(true);

  // @inv - los trazos anteriores se mantienen visibles al añadir nuevos
  await calligraphy.drawStroke(1);
  await expect.poll(
    () => calligraphy.getStrokeCount(),
    { message: TEST_CALLIGRAPHY_E2E_MESSAGES.strokeCount }
  ).toBe(2);
});

test("[R52][E2E] CalligraphyCanvasInterface resets the current writing attempt", async ({ page }) => {
  const calligraphy = new E2ECalligraphyPage(page);

  // Requirement: FUNCIONALES R52 - CalligraphyCanvasInterface
  // @pre The user has drawn at least one stroke in an active practice.
  await calligraphy.startPracticeFromDefaultCategory();
  await calligraphy.drawStroke();
  await expect.poll(
    () => calligraphy.hasVisibleStroke(),
    {
      message: TEST_CALLIGRAPHY_E2E_MESSAGES.strokeVisible
    }
  ).toBe(true);
  await expect(
    page.getByTestId(TEST_CALLIGRAPHY_TEST_IDS.resetButton),
    TEST_CALLIGRAPHY_E2E_MESSAGES.resetEnabled
  ).toBeEnabled();

  // @post Reset removes all strokes from the current attempt.
  await page.getByTestId(TEST_CALLIGRAPHY_TEST_IDS.resetButton).click();
  await expect.poll(
    () => calligraphy.hasVisibleStroke(),
    {
      message: TEST_CALLIGRAPHY_E2E_MESSAGES.canvasEmptyAfterReset
    }
  ).toBe(false);

  // @inv The canvas remains operative after reset.
  await page.getByTestId(TEST_CALLIGRAPHY_TEST_IDS.resetButton).click();
  await calligraphy.drawStroke();
  await expect.poll(
    () => calligraphy.hasVisibleStroke(),
    {
      message: TEST_CALLIGRAPHY_E2E_MESSAGES.canvasOperativeAfterReset
    }
  ).toBe(true);
});

test("[R53][E2E] KanjiPracticeInterface requests evaluation for a drawn attempt", async ({ page }) => {
  const calligraphy = new E2ECalligraphyPage(page);

  // Requirement: FUNCIONALES R53 - KanjiPracticeInterface
  // @pre The active calligraphy practice contains at least one stroke.
  await calligraphy.startPracticeFromDefaultCategory();
  await calligraphy.drawStroke();
  await expect.poll(
    () => calligraphy.hasVisibleStroke(),
    {
      message: TEST_CALLIGRAPHY_E2E_MESSAGES.strokeVisible
    }
  ).toBe(true);

  // @post Activating validate requests evaluation of the current attempt.
  await expect(
    page.getByTestId(TEST_CALLIGRAPHY_TEST_IDS.validateButton),
    TEST_CALLIGRAPHY_E2E_MESSAGES.validateEnabled
  ).toBeEnabled();
  await page.getByTestId(TEST_CALLIGRAPHY_TEST_IDS.validateButton).click();
  await expect(
    page.getByTestId(TEST_CALLIGRAPHY_TEST_IDS.evaluationOverlay),
    TEST_CALLIGRAPHY_E2E_MESSAGES.evaluationOverlayVisible
  ).toBeVisible();
});

test("[R19][E2E] CalligraphyPracticeProps keeps the canvas as the main visual element", async ({ page }) => {
  const calligraphy = new E2ECalligraphyPage(page);

  // Requirement: USABILIDAD R19 - CalligraphyPracticeProps
  // @pre The user starts a calligraphy practice.
  await calligraphy.startPracticeFromDefaultCategory();
  await expect(
    page.getByTestId(TEST_CALLIGRAPHY_TEST_IDS.practiceCanvas),
    TEST_CALLIGRAPHY_E2E_MESSAGES.practiceCanvasVisible
  ).toBeVisible();

  const ratio = await page.evaluate(testIds => {
    const practice = document.querySelector(`[data-testid="${testIds.practiceScreen}"]`);
    const canvas = document.querySelector(`[data-testid="${testIds.practiceCanvas}"]`);
    const practiceRect = practice?.getBoundingClientRect();
    const canvasRect = canvas?.getBoundingClientRect();

    if (!practiceRect || !canvasRect || practiceRect.height === 0) {
      return 0;
    }

    return canvasRect.height / practiceRect.height;
  }, TEST_CALLIGRAPHY_TEST_IDS);

  // @inv The canvas keeps most available practice space.
  expect(
    ratio,
    TEST_CALLIGRAPHY_E2E_MESSAGES.canvasIsPrimary
  ).toBeGreaterThan(TEST_CALLIGRAPHY_VISUAL_THRESHOLDS.canvasMajorityRatio);

  // @post The canvas is the main visible element of the practice interface.
  await expect(
    page.getByTestId(TEST_CALLIGRAPHY_TEST_IDS.practiceCanvas),
    TEST_CALLIGRAPHY_E2E_MESSAGES.canvasIsPrimary
  ).toBeVisible();
});

test("[R20][E2E] CalligraphyPracticeProps hides visual hints for the target kanji", async ({ page }) => {
  const calligraphy = new E2ECalligraphyPage(page);

  // Requirement: USABILIDAD R20 - CalligraphyPracticeProps
  // @pre The user starts a calligraphy practice.
  const selectedCharacter = await calligraphy.startPracticeFromDefaultCategory();

  // @inv No visual target kanji reference is shown during practice.
  const visiblePracticeText = await page
    .getByTestId(TEST_CALLIGRAPHY_TEST_IDS.practiceScreen)
    .first()
    .textContent();
  expect(
    visiblePracticeText?.includes(selectedCharacter) ?? false,
    TEST_CALLIGRAPHY_E2E_MESSAGES.noTargetVisualReference
  ).toBe(false);

  // @post Practice remains visible without target kanji visual references.
  await expect(
    page.getByTestId(TEST_CALLIGRAPHY_TEST_IDS.practiceCanvas),
    TEST_CALLIGRAPHY_E2E_MESSAGES.practiceCanvasVisible
  ).toBeVisible();
});

test("[R21][E2E] CalligraphyPracticeProps shows only essential practice controls", async ({ page }) => {
  const calligraphy = new E2ECalligraphyPage(page);

  // Requirement: USABILIDAD R21 - CalligraphyPracticeProps
  // @pre The user is in an active calligraphy practice.
  await calligraphy.startPracticeFromDefaultCategory();

  // @inv Only indispensable controls are shown in the practice toolbar.
  const controls = page
    .getByTestId(TEST_CALLIGRAPHY_TEST_IDS.practiceTopControls)
    .getByRole("button");
  await expect(
    controls,
    TEST_CALLIGRAPHY_E2E_MESSAGES.onlyEssentialControls
  ).toHaveCount(3);

  // @post The interface exposes back, reset, and validate actions.
  await expect(
    page.getByTestId(TEST_CALLIGRAPHY_TEST_IDS.backButton),
    TEST_CALLIGRAPHY_E2E_MESSAGES.onlyEssentialControls
  ).toBeVisible();
  await expect(
    page.getByTestId(TEST_CALLIGRAPHY_TEST_IDS.resetButton),
    TEST_CALLIGRAPHY_E2E_MESSAGES.onlyEssentialControls
  ).toBeVisible();
  await expect(
    page.getByTestId(TEST_CALLIGRAPHY_TEST_IDS.validateButton),
    TEST_CALLIGRAPHY_E2E_MESSAGES.onlyEssentialControls
  ).toBeVisible();
});

test("[R23][E2E] CalligraphyPracticeProps groups controls at the top of practice", async ({ page }) => {
  const calligraphy = new E2ECalligraphyPage(page);

  // Requirement: USABILIDAD R23 - CalligraphyPracticeProps
  // @pre The user is in an active calligraphy practice.
  await calligraphy.startPracticeFromDefaultCategory();

  const layout = await page.evaluate(testIds => {
    const practice = document.querySelector(`[data-testid="${testIds.practiceScreen}"]`);
    const controls = document.querySelector(`[data-testid="${testIds.practiceTopControls}"]`);
    const canvas = document.querySelector(`[data-testid="${testIds.practiceCanvas}"]`);
    const practiceRect = practice?.getBoundingClientRect();
    const controlsRect = controls?.getBoundingClientRect();
    const canvasRect = canvas?.getBoundingClientRect();

    return {
      practiceHeight: practiceRect?.height ?? 0,
      controlsHeight: controlsRect?.height ?? 0,
      controlsTop: controlsRect?.top ?? 0,
      canvasTop: canvasRect?.top ?? 0
    };
  }, TEST_CALLIGRAPHY_TEST_IDS);

  // @inv Practice controls remain grouped above the canvas.
  expect(
    layout.controlsTop < layout.canvasTop,
    TEST_CALLIGRAPHY_E2E_MESSAGES.controlsAtTop
  ).toBe(true);

  // @post Controls appear in the upper area and use compact space.
  expect(
    layout.practiceHeight > 0 && layout.controlsHeight / layout.practiceHeight < TEST_CALLIGRAPHY_VISUAL_THRESHOLDS.topControlsMaxHeightRatio,
    TEST_CALLIGRAPHY_E2E_MESSAGES.controlsCompact
  ).toBe(true);
});
