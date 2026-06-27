import { test, expect } from "../../../Support/Fixtures";
import { E2EAdminPage } from "../../../Support/E2EAdminPage";
import {
  TEST_ADMIN_E2E_ERROR_REPORTS,
  TEST_ADMIN_E2E_LAST_ACTIONS,
  TEST_ADMIN_E2E_ROUTES,
  TEST_ADMIN_E2E_STATUS_ASSERTION_MESSAGES,
  TEST_ADMIN_E2E_STATUS_ERROR_REPORTS,
  TEST_ADMIN_E2E_STORAGE_KEYS,
  TEST_ADMIN_E2E_TEST_IDS,
  TEST_ADMIN_ERROR_STATUSES,
  TEST_ADMIN_FILTER_ALL,
  TEST_ADMIN_STATUS_ALL_TEST_ID_SEGMENT,
  TEST_ADMIN_STATUS_SOURCE_SEPARATOR,
  TEST_ADMIN_STATUS_TEST_ID_SEPARATOR,
  TEST_ADMIN_STATUS_UPDATE_TARGET
} from "../../../Support/TestData";
import type { ApplicationErrorReport } from "@kanjime/shared";
import type { Page } from "@playwright/test";

const SELECTED_ERROR = TEST_ADMIN_E2E_ERROR_REPORTS[0];

function formatStatusTestId(status: string): string {
  return status.toLowerCase().split(TEST_ADMIN_STATUS_SOURCE_SEPARATOR).join(TEST_ADMIN_STATUS_TEST_ID_SEPARATOR);
}

async function seedStatusReports(page: Page): Promise<void> {
  await page.addInitScript(
    ({ reports, storageKeys }) => {
      window.localStorage.setItem(storageKeys.errorReports, JSON.stringify(reports));
    },
    {
      reports: TEST_ADMIN_E2E_STATUS_ERROR_REPORTS,
      storageKeys: TEST_ADMIN_E2E_STORAGE_KEYS
    }
  );
}

async function readStoredReports(page: Page): Promise<ReadonlyArray<ApplicationErrorReport>> {
  return await page.evaluate((storageKeys: typeof TEST_ADMIN_E2E_STORAGE_KEYS) => {
    const rawValue = window.localStorage.getItem(storageKeys.errorReports);

    return rawValue === null ? [] : JSON.parse(rawValue);
  }, TEST_ADMIN_E2E_STORAGE_KEYS);
}

test("[R66][E2E] AdminErrorDetailInterface shows the detail that corresponds to the selected reported error", async ({ page }) => {
  const admin = new E2EAdminPage(page);

  // Requirement: FUNCIONALES R66 - AdminErrorDetailInterface
  // @pre The administrator opens the errors list and selects an existing reported error.
  await admin.goto("/");
  await admin.navigateToErrors();
  expect(TEST_ADMIN_E2E_ERROR_REPORTS.length, "The E2E scenario should start with previously reported application errors.").toBeGreaterThan(0);
  await expect(admin.errorRow(SELECTED_ERROR.id), "The selected reported error should be visible before opening its detail.").toBeVisible();
  await page.getByTestId(`admin-error-open-button-${SELECTED_ERROR.id}`).click();
  await expect(page.getByTestId(TEST_ADMIN_E2E_TEST_IDS.errorDetailView), "The error detail view should become visible after selecting a reported error.").toBeVisible();

  // @inv The displayed detail should correspond to the selected error.
  await expect(page.getByTestId("admin-error-detail-identifier-value"), "The selected error detail should keep the identifier of the opened report.").toContainText(SELECTED_ERROR.id);

  // @post The administrator sees the selected error message, date, application version and basic context.
  await expect(page.getByTestId("admin-error-detail-message-value"), "The selected error detail should expose the report message.").toContainText(SELECTED_ERROR.message);
  await expect(page.getByTestId("admin-error-detail-occurred-at-value"), "The selected error detail should expose the report occurrence date.").toContainText(SELECTED_ERROR.occurredAt);
  await expect(page.getByTestId("admin-error-detail-application-version-value"), "The selected error detail should expose the application version of the report.").toContainText(SELECTED_ERROR.applicationVersion);
  await expect(page.getByTestId("admin-error-detail-web-engine-value"), "The selected error detail should expose the web engine used by the application runtime.").toContainText(SELECTED_ERROR.webEngine);
  await expect(page.getByTestId("admin-error-detail-actions-list"), "The selected error detail should expose the recorded recent user actions context.").toBeVisible();
  await expect(page.getByTestId("admin-error-detail-action-0"), "The selected error detail should render at least one recorded recent user action.").toBeVisible();
  expect(TEST_ADMIN_E2E_LAST_ACTIONS.length, "The seeded error detail should include the expected recent user actions context.").toBeGreaterThan(0);
  expect(TEST_ADMIN_E2E_LAST_ACTIONS.length, "The selected error detail should render no more than 10 recent user actions.").toBeLessThanOrEqual(10);
});

test("[R72][E2E] AdminErrorDetailInterface updates a reported error status with an allowed value", async ({ page }) => {
  const admin = new E2EAdminPage(page);
  const selectedError = TEST_ADMIN_E2E_STATUS_ERROR_REPORTS[0];

  // Requirement: FUNCIONALES R72 - AdminErrorDetailInterface
  // @pre The administrator opens the detail of an existing reported error.
  await seedStatusReports(page);
  await admin.goto(TEST_ADMIN_E2E_ROUTES.root);
  await admin.navigateToErrors();
  await expect(
    admin.errorRow(selectedError.id),
    TEST_ADMIN_E2E_STATUS_ASSERTION_MESSAGES.detailVisible
  ).toBeVisible();
  await page.getByTestId(`${TEST_ADMIN_E2E_TEST_IDS.errorOpenButtonPrefix}${selectedError.id}`).click();
  await expect(
    page.getByTestId(TEST_ADMIN_E2E_TEST_IDS.errorDetailView),
    TEST_ADMIN_E2E_STATUS_ASSERTION_MESSAGES.detailVisible
  ).toBeVisible();

  // @inv Only allowed real statuses are available as assignable status values.
  for (const status of TEST_ADMIN_ERROR_STATUSES) {
    await expect(
      page.getByTestId(`${TEST_ADMIN_E2E_TEST_IDS.errorDetailStatusPrefix}${formatStatusTestId(status)}`),
      TEST_ADMIN_E2E_STATUS_ASSERTION_MESSAGES.detailStatusVisible
    ).toBeVisible();
  }
  await expect(
    page.getByTestId(`${TEST_ADMIN_E2E_TEST_IDS.errorDetailStatusPrefix}${TEST_ADMIN_STATUS_ALL_TEST_ID_SEGMENT}`),
    TEST_ADMIN_E2E_STATUS_ASSERTION_MESSAGES.detailAllNotAssignable
  ).toHaveCount(0);

  // @post The reported error is updated with the selected allowed status.
  await page
    .getByTestId(`${TEST_ADMIN_E2E_TEST_IDS.errorDetailStatusPrefix}${formatStatusTestId(TEST_ADMIN_STATUS_UPDATE_TARGET)}`)
    .click();
  await expect(
    page.getByTestId(TEST_ADMIN_E2E_TEST_IDS.errorDetailCurrentStatusValue),
    TEST_ADMIN_E2E_STATUS_ASSERTION_MESSAGES.detailStatusUpdated
  ).toContainText(TEST_ADMIN_STATUS_UPDATE_TARGET);
  await expect.poll(
    async () => (await readStoredReports(page)).find(report => report.id === selectedError.id)?.status,
    {
      message: TEST_ADMIN_E2E_STATUS_ASSERTION_MESSAGES.detailStoredStatusUpdated
    }
  ).toBe(TEST_ADMIN_STATUS_UPDATE_TARGET);
});
