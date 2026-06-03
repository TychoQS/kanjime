import { test, expect } from "../../../Support/Fixtures";
import { E2EAdminPage } from "../../../Support/E2EAdminPage";
import {
  TEST_ADMIN_E2E_ERROR_REPORTS,
  TEST_ADMIN_E2E_SENSITIVE_FRAGMENT,
  TEST_ADMIN_E2E_TEST_IDS
} from "../../../Support/TestData";

test("[R28][E2E] AdminErrorsProps keeps the reported errors list readable without exposing sensitive information", async ({ page }) => {
  const admin = new E2EAdminPage(page);

  // Requirement: USABILIDAD R28 - AdminErrorsProps
  // @pre The administration panel starts with reported application errors.
  await admin.goto("/");
  await admin.navigateToErrors();

  // @inv The reported errors list should avoid exposing sensitive user information.
  await expect(page.getByTestId(TEST_ADMIN_E2E_TEST_IDS.errorsList), "The errors list should be visible before validating the listed error information.").toBeVisible();
  for (const report of TEST_ADMIN_E2E_ERROR_REPORTS) {
    await expect(page.getByTestId(`admin-error-context-summary-${report.id}`), `The reported error ${report.id} should expose its basic context summary in the list.`).toBeVisible();
    expect(report.message, `The reported error ${report.id} should not expose the configured sensitive fragment in its summary message.`).not.toContain(TEST_ADMIN_E2E_SENSITIVE_FRAGMENT);
  }

  // @post The administrator can identify each error from basic message, date, version and context information.
  for (const report of TEST_ADMIN_E2E_ERROR_REPORTS) {
    await expect(page.getByTestId(`admin-error-occurred-at-${report.id}`), `The reported error ${report.id} should expose its occurrence date in the list.`).toContainText(report.occurredAt);
    await expect(page.getByTestId(`admin-error-application-version-${report.id}`), `The reported error ${report.id} should expose its application version in the list.`).toContainText(report.applicationVersion);
    await expect(page.getByTestId(`admin-error-context-summary-${report.id}`), `The reported error ${report.id} should expose its basic runtime context in the list.`).toContainText(report.webEngine);
  }
});
