import { test, expect } from "../../../Support/Fixtures";
import { E2EAdminPage } from "../../../Support/E2EAdminPage";
import {
  TEST_ADMIN_E2E_ERROR_REPORTS,
  TEST_ADMIN_E2E_ROUTES,
  TEST_ADMIN_E2E_TEST_IDS,
  TEST_ADMIN_E2E_VERSION_CONFIGURATION
} from "../../../Support/TestData";

test("[R62][E2E] AdminDashboardInterface shows a separated technical overview of versions and reported errors", async ({ page }) => {
  const admin = new E2EAdminPage(page);

  // Requirement: FUNCIONALES R62 - AdminDashboardInterface
  // @pre The administrator accesses the administration panel.
  await admin.goto(TEST_ADMIN_E2E_ROUTES.root);

  // @inv Version information and reported errors should remain separated into differentiated blocks.
  await expect(page.getByTestId(TEST_ADMIN_E2E_TEST_IDS.dashboardVersionCard), "The dashboard should render a dedicated version block.").toBeVisible();
  await expect(page.getByTestId(TEST_ADMIN_E2E_TEST_IDS.dashboardErrorsCard), "The dashboard should render a dedicated reported errors block.").toBeVisible();

  // @post The panel shows a basic technical summary of the application.
  await expect(page.getByTestId(TEST_ADMIN_E2E_TEST_IDS.dashboardCurrentVersionValue), "The dashboard should expose the current application version in the technical summary.").toContainText(TEST_ADMIN_E2E_VERSION_CONFIGURATION.currentVersion);
  await expect(page.getByTestId(TEST_ADMIN_E2E_TEST_IDS.dashboardTotalReportsValue), "The dashboard should expose the total amount of reported errors in the technical summary.").toContainText(String(TEST_ADMIN_E2E_ERROR_REPORTS.length));
});
