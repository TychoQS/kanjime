import type { Page } from "@playwright/test";

import { test, expect } from "../../../Support/Fixtures";
import { E2EAdminPage } from "../../../Support/E2EAdminPage";
import {
  TEST_ADMIN_E2E_ROUTES,
  TEST_ADMIN_E2E_STATUS_ASSERTION_MESSAGES,
  TEST_ADMIN_E2E_STATUS_ERROR_REPORTS,
  TEST_ADMIN_E2E_STORAGE_KEYS,
  TEST_ADMIN_E2E_TEST_IDS,
  TEST_ADMIN_ERROR_STATUSES,
  TEST_ADMIN_STATUS_ALL_TEST_ID_SEGMENT,
  TEST_ADMIN_STATUS_SOURCE_SEPARATOR,
  TEST_ADMIN_STATUS_TEST_ID_SEPARATOR
} from "../../../Support/TestData";

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

test("[R31][E2E] AdminErrorDashboardProps separates all filter from assignable report statuses", async ({ page }) => {
  const admin = new E2EAdminPage(page);

  // Requirement: USABILIDAD R31 - AdminErrorDashboardProps
  // @pre The administrator is on the reported errors screen with existing reports.
  await seedStatusReports(page);
  await admin.goto(TEST_ADMIN_E2E_ROUTES.root);
  await admin.navigateToErrors();
  await expect(
    page.getByTestId(TEST_ADMIN_E2E_TEST_IDS.errorsList),
    TEST_ADMIN_E2E_STATUS_ASSERTION_MESSAGES.allList
  ).toBeVisible();

  // @inv The all option appears only as a filter and not as an assignable status.
  await expect(
    page.getByTestId(`${TEST_ADMIN_E2E_TEST_IDS.errorsFilterPrefix}${TEST_ADMIN_STATUS_ALL_TEST_ID_SEGMENT}`),
    TEST_ADMIN_E2E_STATUS_ASSERTION_MESSAGES.filterVisible
  ).toBeVisible();
  await expect(
    page.getByTestId(`${TEST_ADMIN_E2E_TEST_IDS.errorsStatusPrefix}${TEST_ADMIN_STATUS_ALL_TEST_ID_SEGMENT}`),
    TEST_ADMIN_E2E_STATUS_ASSERTION_MESSAGES.allOnlyFilter
  ).toHaveCount(0);

  // @post The real statuses are visible as differentiated report statuses.
  for (const status of TEST_ADMIN_ERROR_STATUSES) {
    await expect(
      page.getByTestId(`${TEST_ADMIN_E2E_TEST_IDS.errorsStatusPrefix}${formatStatusTestId(status)}`),
      TEST_ADMIN_E2E_STATUS_ASSERTION_MESSAGES.assignableStatusVisible
    ).toBeVisible();
  }
});
