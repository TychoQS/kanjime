import { test, expect } from "../../../Support/Fixtures";
import { E2EAdminPage } from "../../../Support/E2EAdminPage";
import { TEST_ADMIN_E2E_ERROR_REPORTS, TEST_ADMIN_E2E_TEST_IDS } from "../../../Support/TestData";

test("[R65][E2E] AdminErrorsInterface lists reported application errors with basic analysis information", async ({ page }) => {
  const admin = new E2EAdminPage(page);

  // Requirement: FUNCIONALES R65 - AdminErrorsInterface
  // @pre The administration panel starts with previously reported application errors.
  await admin.goto("/");
  await admin.navigateToErrors();

  // @post The administrator sees the reported errors together with basic analysis information.
  await expect(page.getByTestId(TEST_ADMIN_E2E_TEST_IDS.errorsList), "The errors screen should expose the reported errors list.").toBeVisible();
  for (const report of TEST_ADMIN_E2E_ERROR_REPORTS) {
    await expect(admin.errorRow(report.id), `The reported error row ${report.id} should be visible in the administration list.`).toBeVisible();
    await expect(page.getByTestId(`admin-error-message-${report.id}`), `The reported error ${report.id} should expose its message in the list.`).toContainText(report.message);
    await expect(page.getByTestId(`admin-error-application-version-${report.id}`), `The reported error ${report.id} should expose its application version in the list.`).toContainText(report.applicationVersion);
  }
});
