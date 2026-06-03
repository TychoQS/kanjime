import { test, expect } from "../../../Support/Fixtures";
import { E2EAdminPage } from "../../../Support/E2EAdminPage";
import { TEST_ADMIN_E2E_ERROR_REPORTS, TEST_ADMIN_E2E_LAST_ACTIONS, TEST_ADMIN_E2E_TEST_IDS } from "../../../Support/TestData";

const SELECTED_ERROR = TEST_ADMIN_E2E_ERROR_REPORTS[0];

test("[R66][E2E] AdminErrorDetailInterface shows the detail that corresponds to the selected reported error", async ({ page }) => {
  const admin = new E2EAdminPage(page);

  // Requirement: FUNCIONALES R66 - AdminErrorDetailInterface
  // @pre The administrator opens the errors list and selects an existing reported error.
  await admin.goto("/");
  await admin.navigateToErrors();
  await page.getByTestId(`admin-error-open-button-${SELECTED_ERROR.id}`).click();

  // @inv The displayed detail should correspond to the selected error.
  await expect(page.getByTestId(TEST_ADMIN_E2E_TEST_IDS.errorDetailView), "The error detail view should become visible after selecting a reported error.").toBeVisible();
  await expect(page.getByTestId("admin-error-detail-identifier-value"), "The selected error detail should keep the identifier of the opened report.").toContainText(SELECTED_ERROR.id);

  // @post The administrator sees the selected error message, date, application version and basic context.
  await expect(page.getByTestId("admin-error-detail-message-value"), "The selected error detail should expose the report message.").toContainText(SELECTED_ERROR.message);
  await expect(page.getByTestId("admin-error-detail-occurred-at-value"), "The selected error detail should expose the report occurrence date.").toContainText(SELECTED_ERROR.occurredAt);
  await expect(page.getByTestId("admin-error-detail-application-version-value"), "The selected error detail should expose the application version of the report.").toContainText(SELECTED_ERROR.applicationVersion);
  await expect(page.getByTestId("admin-error-detail-web-engine-value"), "The selected error detail should expose the web engine used by the application runtime.").toContainText(SELECTED_ERROR.webEngine);
  await expect(page.getByTestId("admin-error-detail-actions-list"), "The selected error detail should expose the recorded recent user actions context.").toBeVisible();
  await expect(page.getByTestId("admin-error-detail-action-0"), "The selected error detail should render at least one recorded recent user action.").toBeVisible();
  expect(TEST_ADMIN_E2E_LAST_ACTIONS.length, "The seeded error detail should include the expected recent user actions context.").toBeGreaterThan(0);
});
