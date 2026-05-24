import { expect, test } from "@playwright/test";

import { E2ECalligraphyPage } from "../../../Support/E2ECalligraphyPage";
import {
  TEST_CALLIGRAPHY_E2E_MESSAGES,
  TEST_CALLIGRAPHY_REQUIRED_METRIC_IDS,
  TEST_CALLIGRAPHY_SCORE_RANGE,
  TEST_CALLIGRAPHY_TEST_IDS
} from "../../../Support/TestData";

test.beforeEach(async ({ page }) => {
  await new E2ECalligraphyPage(page).resetApplicationState();
});

test("[R54][E2E] CalligraphyEvaluationInterface generates an evaluation result", async ({ page }) => {
  const calligraphy = new E2ECalligraphyPage(page);

  // Requirement: FUNCIONALES R54 - CalligraphyEvaluationInterface
  // @pre The user finalizes a writing attempt.
  await calligraphy.evaluateDrawnAttempt();

  // @post The application generates an evaluation result for the attempt.
  await expect(
    page.getByTestId(TEST_CALLIGRAPHY_TEST_IDS.evaluationPanel),
    TEST_CALLIGRAPHY_E2E_MESSAGES.evaluationOverlayVisible
  ).toBeVisible();
  await expect(
    page.getByTestId(TEST_CALLIGRAPHY_TEST_IDS.score),
    TEST_CALLIGRAPHY_E2E_MESSAGES.scoreVisible
  ).toBeVisible();
});

test("[R55][E2E] CalligraphyEvaluationInterface shows a score inside the allowed range", async ({ page }) => {
  const calligraphy = new E2ECalligraphyPage(page);

  // Requirement: FUNCIONALES R55 - CalligraphyEvaluationInterface
  // @pre A valid evaluation result exists for the attempt.
  await calligraphy.evaluateDrawnAttempt();
  await expect(
    page.getByTestId(TEST_CALLIGRAPHY_TEST_IDS.scoreValue),
    TEST_CALLIGRAPHY_E2E_MESSAGES.scoreVisible
  ).toBeVisible();

  const score = Number.parseInt(
    await page.getByTestId(TEST_CALLIGRAPHY_TEST_IDS.scoreValue).innerText(),
    10
  );

  // @inv The calculated score remains inside the allowed range.
  expect(
    score,
    TEST_CALLIGRAPHY_E2E_MESSAGES.scoreInRange
  ).toBeGreaterThanOrEqual(TEST_CALLIGRAPHY_SCORE_RANGE.min);
  expect(
    score,
    TEST_CALLIGRAPHY_E2E_MESSAGES.scoreInRange
  ).toBeLessThanOrEqual(TEST_CALLIGRAPHY_SCORE_RANGE.max);

  // @post A global score is visible in the interface.
  await expect(
    page.getByTestId(TEST_CALLIGRAPHY_TEST_IDS.score),
    TEST_CALLIGRAPHY_E2E_MESSAGES.scoreVisible
  ).toBeVisible();
});

test("[R56][E2E] CalligraphyEvaluationInterface displays score and summary feedback", async ({ page }) => {
  const calligraphy = new E2ECalligraphyPage(page);

  // Requirement: FUNCIONALES R56 - CalligraphyEvaluationInterface
  // @pre A calculated evaluation result exists.
  await calligraphy.evaluateDrawnAttempt();

  // @post Visual feedback with the score and result summary is shown.
  await expect(
    page.getByTestId(TEST_CALLIGRAPHY_TEST_IDS.score),
    TEST_CALLIGRAPHY_E2E_MESSAGES.scoreVisible
  ).toBeVisible();
  await expect(
    page.getByTestId(TEST_CALLIGRAPHY_TEST_IDS.evaluationSummary),
    TEST_CALLIGRAPHY_E2E_MESSAGES.summaryVisible
  ).toBeVisible();
  await expect(
    page.getByTestId(TEST_CALLIGRAPHY_TEST_IDS.recommendation),
    TEST_CALLIGRAPHY_E2E_MESSAGES.recommendationVisible
  ).toBeVisible();
});

test("[R22][E2E] CalligraphyEvaluationProps overlays understandable feedback on practice", async ({ page }) => {
  const calligraphy = new E2ECalligraphyPage(page);

  // Requirement: USABILIDAD R22 - CalligraphyEvaluationProps
  // @pre An evaluation result exists after finishing a calligraphy practice.
  await calligraphy.evaluateDrawnAttempt();

  const overlayBox = await page.getByTestId(TEST_CALLIGRAPHY_TEST_IDS.evaluationOverlay).boundingBox();
  const practiceBox = await page.getByTestId(TEST_CALLIGRAPHY_TEST_IDS.practiceScreen).first().boundingBox();

  // @inv Feedback remains visible over the practice screen.
  expect(
    Boolean(
      overlayBox &&
      practiceBox &&
      overlayBox.y <= practiceBox.y + practiceBox.height &&
      overlayBox.y + overlayBox.height >= practiceBox.y
    ),
    TEST_CALLIGRAPHY_E2E_MESSAGES.feedbackOverPractice
  ).toBe(true);

  // @post Evaluation results are shown through user-facing visual elements.
  await expect(
    page.getByTestId(TEST_CALLIGRAPHY_TEST_IDS.evaluationPanel),
    TEST_CALLIGRAPHY_E2E_MESSAGES.evaluationOverlayVisible
  ).toBeVisible();
  for (const metricId of TEST_CALLIGRAPHY_REQUIRED_METRIC_IDS) {
    await expect(
      page.getByTestId(`${TEST_CALLIGRAPHY_TEST_IDS.metricPrefix}${metricId}`),
      TEST_CALLIGRAPHY_E2E_MESSAGES.metricVisible
    ).toBeVisible();
  }
});
