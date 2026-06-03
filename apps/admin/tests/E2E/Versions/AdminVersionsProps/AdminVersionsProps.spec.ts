import { test, expect } from "../../../Support/Fixtures";
import { E2EAdminPage } from "../../../Support/E2EAdminPage";
import {
  TEST_ADMIN_E2E_TEST_IDS,
  TEST_ADMIN_E2E_VERSION_CONFIGURATION
} from "../../../Support/TestData";

test("[R26][E2E] AdminVersionsProps presents differentiated and readable version information", async ({ page }) => {
  const admin = new E2EAdminPage(page);

  // Requirement: USABILIDAD R26 - AdminVersionsProps
  // @pre A version configuration is available in the administration panel.
  await admin.goto("/");
  await admin.navigateToVersions();

  // @inv The interface should clearly differentiate the current, latest and updated-at version data.
  await expect(page.getByTestId("admin-version-current-row"), "The versions screen should expose a differentiated row for the current version.").toBeVisible();
  await expect(page.getByTestId("admin-version-latest-row"), "The versions screen should expose a differentiated row for the latest version.").toBeVisible();
  await expect(page.getByTestId("admin-version-updated-at-row"), "The versions screen should expose a differentiated row for the configuration update timestamp.").toBeVisible();

  // @post The administrator can inspect the version status clearly without interpreting raw technical data.
  await expect(page.getByTestId(TEST_ADMIN_E2E_TEST_IDS.versionCurrentValue), "The readable current version value should be visible to the administrator.").toContainText(TEST_ADMIN_E2E_VERSION_CONFIGURATION.currentVersion);
  await expect(page.getByTestId(TEST_ADMIN_E2E_TEST_IDS.versionUpdatedAtValue), "The readable configuration update timestamp should be visible to the administrator.").toContainText(TEST_ADMIN_E2E_VERSION_CONFIGURATION.updatedAt);
});
