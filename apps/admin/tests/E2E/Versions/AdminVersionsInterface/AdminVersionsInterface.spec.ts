import { test, expect } from "../../../Support/Fixtures";
import { E2EAdminPage } from "../../../Support/E2EAdminPage";
import {
  TEST_ADMIN_E2E_STORAGE_KEYS,
  TEST_ADMIN_E2E_TEST_IDS,
  TEST_ADMIN_E2E_VERSION_CONFIGURATION
} from "../../../Support/TestData";

test("[R63][E2E] AdminVersionsInterface displays the stored application version configuration without modifying it", async ({ page }) => {
  const admin = new E2EAdminPage(page);

  // Requirement: FUNCIONALES R63 - AdminVersionsInterface
  // @pre The administration panel starts with an existing version configuration.
  await admin.goto("/");
  const storedConfigurationBeforeNavigation = await page.evaluate(storageKeys => {
    return window.localStorage.getItem(storageKeys.versionConfiguration);
  }, TEST_ADMIN_E2E_STORAGE_KEYS);
  expect(storedConfigurationBeforeNavigation, "A version configuration should exist before opening the versions screen.").not.toBeNull();
  expect(storedConfigurationBeforeNavigation, "The version configuration should contain the current version.").toContain(TEST_ADMIN_E2E_VERSION_CONFIGURATION.currentVersion);
  expect(storedConfigurationBeforeNavigation, "The version configuration should contain the latest version.").toContain(TEST_ADMIN_E2E_VERSION_CONFIGURATION.latestVersion);
  expect(storedConfigurationBeforeNavigation, "The version configuration should contain the minimum supported version.").toContain(TEST_ADMIN_E2E_VERSION_CONFIGURATION.minimumSupportedVersion);
  await admin.navigateToVersions();

  // @inv Querying the configuration should not modify the stored values.
  const storedConfigurationAfterNavigation = await page.evaluate(storageKeys => {
    return window.localStorage.getItem(storageKeys.versionConfiguration);
  }, TEST_ADMIN_E2E_STORAGE_KEYS);
  expect(storedConfigurationAfterNavigation, "Opening the versions screen should not mutate the persisted version configuration.").toBe(storedConfigurationBeforeNavigation);

  // @post The administrator sees the current, latest and minimum supported versions.
  await expect(page.getByTestId(TEST_ADMIN_E2E_TEST_IDS.versionCurrentValue), "The versions screen should expose the current version value.").toContainText(TEST_ADMIN_E2E_VERSION_CONFIGURATION.currentVersion);
  await expect(page.getByTestId(TEST_ADMIN_E2E_TEST_IDS.versionLatestValue), "The versions screen should expose the latest version value.").toContainText(TEST_ADMIN_E2E_VERSION_CONFIGURATION.latestVersion);
  await expect(page.getByTestId(TEST_ADMIN_E2E_TEST_IDS.versionMinimumValue), "The versions screen should expose the minimum supported version value.").toContainText(TEST_ADMIN_E2E_VERSION_CONFIGURATION.minimumSupportedVersion);
});
