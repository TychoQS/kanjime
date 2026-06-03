import type { Page } from "@playwright/test";

import { test, expect } from "../../../Support/Fixtures";
import { E2EApplicationPage } from "../../../Support/E2EApplicationPage";
import {
  TEST_MOBILE_E2E_FORCED_ERROR_MESSAGE,
  TEST_MOBILE_E2E_MAX_REPORTED_ACTIONS,
  TEST_MOBILE_E2E_REPORT_EXPECTED_WEB_ENGINE,
  TEST_MOBILE_E2E_REPORT_VERSION_PATTERN,
  TEST_MOBILE_E2E_ROUTES,
  TEST_MOBILE_E2E_SENSITIVE_MESSAGE_FRAGMENT,
  TEST_MOBILE_E2E_STORAGE_KEYS,
  TEST_MOBILE_E2E_TEST_IDS,
  TEST_MOBILE_E2E_VERSION_CONFIGURATION_CURRENT
} from "../../../Support/TestData";

type MobileStoredErrorReport = {
  readonly id: string;
  readonly message: string;
  readonly occurredAt: string;
  readonly applicationVersion: string;
  readonly webEngine: string;
  readonly webEngineVersion: string;
  readonly lastActions: ReadonlyArray<{ readonly type: string; readonly occurredAt: string }>;
  readonly isReadyForObservability: boolean;
};

interface SeedErrorObservabilityArgs {
  readonly configuration: typeof TEST_MOBILE_E2E_VERSION_CONFIGURATION_CURRENT;
  readonly storageKeys: typeof TEST_MOBILE_E2E_STORAGE_KEYS;
}

async function seedErrorObservabilityScenario(page: Page): Promise<void> {
  await page.addInitScript(
    ({ configuration, storageKeys }: SeedErrorObservabilityArgs) => {
      window.localStorage.clear();
      window.localStorage.setItem(storageKeys.remoteVersionConfiguration, JSON.stringify(configuration));
      window.localStorage.setItem(storageKeys.versionCheckShouldFail, JSON.stringify(false));
    },
    {
      configuration: TEST_MOBILE_E2E_VERSION_CONFIGURATION_CURRENT,
      storageKeys: TEST_MOBILE_E2E_STORAGE_KEYS
    }
  );
}

async function readStoredReports(page: Page): Promise<ReadonlyArray<MobileStoredErrorReport>> {
  return await page.evaluate((storageKeys: typeof TEST_MOBILE_E2E_STORAGE_KEYS) => {
    const rawValue = window.localStorage.getItem(storageKeys.errorReports);

    return rawValue === null ? [] : JSON.parse(rawValue);
  }, TEST_MOBILE_E2E_STORAGE_KEYS);
}

test("[R61][E2E] ErrorObservabilityInterface generates a structured non-sensitive error report", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R61 - ErrorObservabilityInterface
  // @pre A controlled captured error exists in the application.
  await seedErrorObservabilityScenario(page);
  await app.goto(TEST_MOBILE_E2E_ROUTES.classification);
  await app.openMenu();
  await page.getByTestId(TEST_MOBILE_E2E_TEST_IDS.navHistory).click();
  await expect(page.getByTestId("history-screen"), "The history screen should be reachable before generating the observability report.").toBeVisible();
  await page.getByTestId(TEST_MOBILE_E2E_TEST_IDS.triggerUnexpectedErrorButton).evaluate(button => {
    (button as HTMLButtonElement).click();
  });

  // @inv The generated report must expose structured traceability data without sensitive user information.
  await expect
    .poll(
      async () => (await readStoredReports(page)).length,
      {
        message: "The application should persist a generated error report after capturing an unexpected runtime error."
      }
    )
    .toBe(1);

  const [report] = await readStoredReports(page);

  expect(report.message, "The generated report should preserve the captured error message for observability analysis.").toBe(TEST_MOBILE_E2E_FORCED_ERROR_MESSAGE);
  expect(report.webEngine, "The generated report should include the web engine used by the application runtime.").toBe(TEST_MOBILE_E2E_REPORT_EXPECTED_WEB_ENGINE);
  expect(report.applicationVersion, "The generated report should include a semantic application version.").toMatch(TEST_MOBILE_E2E_REPORT_VERSION_PATTERN);
  expect(report.lastActions.length, "The generated report should include no more than the ten most recent user actions.").toBeLessThanOrEqual(TEST_MOBILE_E2E_MAX_REPORTED_ACTIONS);
  expect(JSON.stringify(report), "The generated report should avoid exposing sensitive user-facing technical trace prefixes.").not.toContain(TEST_MOBILE_E2E_SENSITIVE_MESSAGE_FRAGMENT);

  // @post The application leaves a structured report ready to be registered or consulted by administration tooling.
  expect(report.id.length, "The generated report should include a stable identifier for later consultation.").toBeGreaterThan(0);
  expect(report.occurredAt.length, "The generated report should include the capture timestamp.").toBeGreaterThan(0);
  expect(report.isReadyForObservability, "The generated report should be marked as ready for observability registration.").toBe(true);
});
