import { expect, test } from "../../../Support/Fixtures";

import { E2ECalligraphyPage } from "../../../Support/E2ECalligraphyPage";
import {
  TEST_CALLIGRAPHY_E2E_MESSAGES,
  TEST_CALLIGRAPHY_REQUIRED_METRIC_IDS,
  TEST_CALLIGRAPHY_SCORE_RANGE,
  TEST_CALLIGRAPHY_TEST_IDS,
  TEST_MOBILE_E2E_TEST_IDS
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

test("[R68][E2E] CalligraphyEvaluationInterface keeps independent metrics visible after similarity evaluation", async ({ page }) => {
  const calligraphy = new E2ECalligraphyPage(page);

  // Requirement: FUNCIONALES R68 - CalligraphyEvaluationInterface
  // @pre The user finalizes a writing attempt with a renderable reference.
  await calligraphy.evaluateDrawnAttempt();
  await expect(
    page.getByTestId(TEST_CALLIGRAPHY_TEST_IDS.visualComparison),
    TEST_CALLIGRAPHY_E2E_MESSAGES.visualComparisonVisible
  ).toBeVisible();

  // @inv SIFT similarity comparison does not replace stroke count, stroke order, or approximate direction metrics.
  for (const metricId of TEST_CALLIGRAPHY_REQUIRED_METRIC_IDS) {
    await expect(
      page.getByTestId(`${TEST_CALLIGRAPHY_TEST_IDS.metricPrefix}${metricId}`),
      TEST_CALLIGRAPHY_E2E_MESSAGES.evaluationMetricsPreserved
    ).toBeVisible();
  }
});

test("[R69][E2E] CalligraphyEvaluationInterface shows controlled fallback similarity feedback", async ({ page }) => {
  const calligraphy = new E2ECalligraphyPage(page);

  // Requirement: FUNCIONALES R69 - CalligraphyEvaluationInterface
  // @pre The user evaluates an attempt with insufficient visual keypoints for reliable SIFT comparison.
  await calligraphy.evaluateDrawnAttempt();

  // @inv The insufficient-keypoint path does not interrupt the evaluation with an uncontrolled error.
  await expect.poll(
    () => page
      .getByTestId(TEST_MOBILE_E2E_TEST_IDS.controlledErrorView)
      .evaluateAll(elements => elements.filter(element => element.checkVisibility()).length),
    {
      message: TEST_CALLIGRAPHY_E2E_MESSAGES.evaluationNoControlledError
    }
  ).toBe(0);

  // @post A controlled fallback similarity result remains visible to the user.
  await expect(
    page.getByTestId(TEST_CALLIGRAPHY_TEST_IDS.score),
    TEST_CALLIGRAPHY_E2E_MESSAGES.fallbackScoreVisible
  ).toBeVisible();
});

test("[R70][E2E] CalligraphyEvaluationInterface displays the evaluated reference-attempt comparison", async ({ page }) => {
  const calligraphy = new E2ECalligraphyPage(page);

  // Requirement: FUNCIONALES R70 - CalligraphyEvaluationInterface
  // @pre A calculated evaluation exists with reference and attempt visuals available.
  const selectedCharacter = await calligraphy.evaluateDrawnAttempt();
  const visualComparison = page.getByTestId(TEST_CALLIGRAPHY_TEST_IDS.visualComparison);
  await expect(
    visualComparison,
    TEST_CALLIGRAPHY_E2E_MESSAGES.visualComparisonVisible
  ).toBeVisible();

  // @inv The visual comparison corresponds to the same target character and evaluated attempt route.
  await expect.poll(
    () => page.evaluate(() => decodeURIComponent(window.location.pathname)),
    {
      message: TEST_CALLIGRAPHY_E2E_MESSAGES.practiceRouteSelected
    }
  ).toContain(selectedCharacter);

  // @post Reference and attempt are displayed as differentiated visuals, or as an aligned matching visual when homography is available.
  const separateVisualsVisible =
    await page.getByTestId(TEST_CALLIGRAPHY_TEST_IDS.referenceVisual).isVisible().catch(() => false) &&
    await page.getByTestId(TEST_CALLIGRAPHY_TEST_IDS.attemptVisual).isVisible().catch(() => false);
  const matchingVisualVisible = await page
    .getByTestId(TEST_CALLIGRAPHY_TEST_IDS.matchingVisual)
    .isVisible()
    .catch(() => false);

  expect(
    separateVisualsVisible || matchingVisualVisible,
    TEST_CALLIGRAPHY_E2E_MESSAGES.referenceAndAttemptVisible
  ).toBe(true);
});

test("[R30][E2E] CalligraphyEvaluationProps places the visual comparison above the metrics", async ({ page }) => {
  const calligraphy = new E2ECalligraphyPage(page);

  // Requirement: USABILIDAD R30 - CalligraphyEvaluationProps
  // @pre An evaluation result exists with reference, attempt, and metrics calculated.
  await calligraphy.evaluateDrawnAttempt();
  const visualComparison = page.getByTestId(TEST_CALLIGRAPHY_TEST_IDS.visualComparison);
  const metrics = page.getByTestId(TEST_CALLIGRAPHY_TEST_IDS.metricList);
  await expect(
    visualComparison,
    TEST_CALLIGRAPHY_E2E_MESSAGES.visualComparisonVisible
  ).toBeVisible();
  await expect(
    metrics,
    TEST_CALLIGRAPHY_E2E_MESSAGES.metricVisible
  ).toBeVisible();

  const visualBox = await visualComparison.boundingBox();
  const metricsBox = await metrics.boundingBox();

  // @inv The comparison remains above the metrics block while the evaluation is visible.
  expect(
    Boolean(visualBox && metricsBox && visualBox.y < metricsBox.y),
    TEST_CALLIGRAPHY_E2E_MESSAGES.visualComparisonAboveMetrics
  ).toBe(true);

  // @post The user can see both the reference-attempt comparison and the metric details.
  await expect(
    visualComparison,
    TEST_CALLIGRAPHY_E2E_MESSAGES.referenceAndAttemptVisible
  ).toBeVisible();
  await expect(
    metrics,
    TEST_CALLIGRAPHY_E2E_MESSAGES.evaluationMetricsPreserved
  ).toBeVisible();
});
