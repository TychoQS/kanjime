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

test("[R32][E2E] AdminErrorDetailProps separates all filter from assignable detail statuses", async ({ page }) => {
  const admin = new E2EAdminPage(page);
  const selectedError = TEST_ADMIN_E2E_STATUS_ERROR_REPORTS[0];

  // Requirement: USABILIDAD R32 - AdminErrorDetailProps
  // @pre The administrator is on the detail of a reported error.
  await seedStatusReports(page);
  await admin.goto(TEST_ADMIN_E2E_ROUTES.root);
  await admin.navigateToErrors();
  await page.getByTestId(`${TEST_ADMIN_E2E_TEST_IDS.errorOpenButtonPrefix}${selectedError.id}`).click();
  await expect(
    page.getByTestId(TEST_ADMIN_E2E_TEST_IDS.errorDetailView),
    TEST_ADMIN_E2E_STATUS_ASSERTION_MESSAGES.detailVisible
  ).toBeVisible();

  // @inv The all option is not available as an assignable detail status.
  await expect(
    page.getByTestId(`${TEST_ADMIN_E2E_TEST_IDS.errorDetailStatusPrefix}${TEST_ADMIN_STATUS_ALL_TEST_ID_SEGMENT}`),
    TEST_ADMIN_E2E_STATUS_ASSERTION_MESSAGES.detailAllNotAssignable
  ).toHaveCount(0);

  // @post The administrator can identify the real statuses as assignable values.
  for (const status of TEST_ADMIN_ERROR_STATUSES) {
    await expect(
      page.getByTestId(`${TEST_ADMIN_E2E_TEST_IDS.errorDetailStatusPrefix}${formatStatusTestId(status)}`),
      TEST_ADMIN_E2E_STATUS_ASSERTION_MESSAGES.detailStatusVisible
    ).toBeVisible();
  }
});
