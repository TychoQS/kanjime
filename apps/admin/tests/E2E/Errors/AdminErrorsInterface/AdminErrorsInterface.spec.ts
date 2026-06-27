import { test, expect } from "../../../Support/Fixtures";
import { E2EAdminPage } from "../../../Support/E2EAdminPage";
import {
  TEST_ADMIN_E2E_ERROR_REPORTS,
  TEST_ADMIN_E2E_ROUTES,
  TEST_ADMIN_E2E_STATUS_ASSERTION_MESSAGES,
  TEST_ADMIN_E2E_STATUS_ERROR_REPORTS,
  TEST_ADMIN_E2E_STORAGE_KEYS,
  TEST_ADMIN_E2E_TEST_IDS,
  TEST_ADMIN_FILTER_ALL,
  TEST_ADMIN_FILTER_TEST_STATUS,
  TEST_ADMIN_STATUS_ALL_TEST_ID_SEGMENT,
  TEST_ADMIN_STATUS_SOURCE_SEPARATOR,
  TEST_ADMIN_STATUS_TEST_ID_SEPARATOR
} from "../../../Support/TestData";
import type { Page } from "@playwright/test";

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

test("[R65][E2E] AdminErrorsInterface lists reported application errors with basic analysis information", async ({ page }) => {
  const admin = new E2EAdminPage(page);

  // Requirement: FUNCIONALES R65 - AdminErrorsInterface
  // @pre The administration panel starts with previously reported application errors.
  await admin.goto("/");
  await admin.navigateToErrors();
  expect(TEST_ADMIN_E2E_ERROR_REPORTS.length, "The E2E scenario should start with previously reported application errors.").toBeGreaterThan(0);

  // @post The administrator sees the reported errors together with basic analysis information.
  await expect(page.getByTestId(TEST_ADMIN_E2E_TEST_IDS.errorsList), "The errors screen should expose the reported errors list.").toBeVisible();
  for (const report of TEST_ADMIN_E2E_ERROR_REPORTS) {
    await expect(admin.errorRow(report.id), `The reported error row ${report.id} should be visible in the administration list.`).toBeVisible();
    await expect(page.getByTestId(`admin-error-message-${report.id}`), `The reported error ${report.id} should expose its message in the list.`).toContainText(report.message);
    await expect(page.getByTestId(`admin-error-application-version-${report.id}`), `The reported error ${report.id} should expose its application version in the list.`).toContainText(report.applicationVersion);
  }
});

test("[R73][E2E] AdminErrorsInterface filters reports by status and all reports", async ({ page }) => {
  const admin = new E2EAdminPage(page);
  const selectedReports = TEST_ADMIN_E2E_STATUS_ERROR_REPORTS
    .filter(report => report.status === TEST_ADMIN_FILTER_TEST_STATUS);
  const seededStatuses = new Set(TEST_ADMIN_E2E_STATUS_ERROR_REPORTS.map(report => report.status));

  // Requirement: FUNCIONALES R73 - AdminErrorInterface
  // @pre The errors screen contains reports with at least two different statuses.
  await seedStatusReports(page);
  await admin.goto(TEST_ADMIN_E2E_ROUTES.root);
  await admin.navigateToErrors();
  expect(
    seededStatuses.size,
    TEST_ADMIN_E2E_STATUS_ASSERTION_MESSAGES.seededReports
  ).toBeGreaterThan(1);

  // @inv The all option is only a visual filter, not an assignable report status.
  await expect(
    page.getByTestId(`${TEST_ADMIN_E2E_TEST_IDS.errorsFilterPrefix}${TEST_ADMIN_STATUS_ALL_TEST_ID_SEGMENT}`),
    TEST_ADMIN_E2E_STATUS_ASSERTION_MESSAGES.filterVisible
  ).toBeVisible();
  await expect(
    page.getByTestId(`${TEST_ADMIN_E2E_TEST_IDS.errorsStatusPrefix}${TEST_ADMIN_STATUS_ALL_TEST_ID_SEGMENT}`),
    TEST_ADMIN_E2E_STATUS_ASSERTION_MESSAGES.allOnlyFilter
  ).toHaveCount(0);

  // @post The screen shows only reports matching the selected status, then every report when all is selected.
  await page
    .getByTestId(`${TEST_ADMIN_E2E_TEST_IDS.errorsFilterPrefix}${formatStatusTestId(TEST_ADMIN_FILTER_TEST_STATUS)}`)
    .click();
  await expect(
    page.getByTestId(TEST_ADMIN_E2E_TEST_IDS.errorsList).locator(`[data-testid^="${TEST_ADMIN_E2E_TEST_IDS.errorRowPrefix}"]`),
    TEST_ADMIN_E2E_STATUS_ASSERTION_MESSAGES.filteredList
  ).toHaveCount(selectedReports.length);
  for (const report of selectedReports) {
    await expect(
      admin.errorRow(report.id),
      TEST_ADMIN_E2E_STATUS_ASSERTION_MESSAGES.filteredList
    ).toBeVisible();
    await expect(
      page.getByTestId(`${TEST_ADMIN_E2E_TEST_IDS.errorStatusPrefix}${report.id}`),
      TEST_ADMIN_E2E_STATUS_ASSERTION_MESSAGES.filteredList
    ).toContainText(TEST_ADMIN_FILTER_TEST_STATUS);
  }

  await page
    .getByTestId(`${TEST_ADMIN_E2E_TEST_IDS.errorsFilterPrefix}${formatStatusTestId(TEST_ADMIN_FILTER_ALL)}`)
    .click();
  await expect(
    page.getByTestId(TEST_ADMIN_E2E_TEST_IDS.errorsList).locator(`[data-testid^="${TEST_ADMIN_E2E_TEST_IDS.errorRowPrefix}"]`),
    TEST_ADMIN_E2E_STATUS_ASSERTION_MESSAGES.allList
  ).toHaveCount(TEST_ADMIN_E2E_STATUS_ERROR_REPORTS.length);
});
