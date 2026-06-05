import type { Page } from "@playwright/test";

import { test, expect } from "../../../Support/Fixtures";
import { E2EAdminPage } from "../../../Support/E2EAdminPage";
import {
  TEST_ADMIN_E2E_INVALID_VERSION_VALUE,
  TEST_ADMIN_E2E_STORAGE_KEYS,
  TEST_ADMIN_E2E_TEST_IDS,
  TEST_ADMIN_E2E_UPDATED_VERSION_CONFIGURATION
} from "../../../Support/TestData";

async function fillVersionInput(page: Page, testId: string, value: string): Promise<void> {
  const input = page.getByTestId(testId).locator("input");

  await input.fill("");
  await input.fill(value);
}

test("[R64][E2E] AdminVersionFormInterface rejects invalid versions and persists valid configuration changes", async ({ page }) => {
  const admin = new E2EAdminPage(page);

  // Requirement: FUNCIONALES R64 - AdminVersionFormInterface
  // @pre The administrator is on the version configuration screen and edits a version value.
  await admin.goto("/");
  await admin.navigateToVersions();
  await page.getByTestId(TEST_ADMIN_E2E_TEST_IDS.versionsEditButton).click();
  await expect(page.getByTestId(TEST_ADMIN_E2E_TEST_IDS.versionCurrentInput), "The version configuration form should be available for editing.").toBeVisible();

  // @inv Invalid version values should never be accepted or persisted.
  await fillVersionInput(page, TEST_ADMIN_E2E_TEST_IDS.versionCurrentInput, TEST_ADMIN_E2E_INVALID_VERSION_VALUE);
  await expect(page.getByTestId(TEST_ADMIN_E2E_TEST_IDS.versionValidationMessage), "The version form should expose a validation error after entering an invalid semantic version.").toBeVisible();
  await expect(page.getByTestId(TEST_ADMIN_E2E_TEST_IDS.versionSaveButton), "The version form should disable saving while the configuration is invalid.").toHaveAttribute("aria-disabled", "true");

  // @post A valid configuration should be stored and immediately available to the application.
  await fillVersionInput(page, TEST_ADMIN_E2E_TEST_IDS.versionCurrentInput, TEST_ADMIN_E2E_UPDATED_VERSION_CONFIGURATION.currentVersion);
  await fillVersionInput(page, TEST_ADMIN_E2E_TEST_IDS.versionLatestInput, TEST_ADMIN_E2E_UPDATED_VERSION_CONFIGURATION.latestVersion);
  await fillVersionInput(page, TEST_ADMIN_E2E_TEST_IDS.versionMinimumInput, TEST_ADMIN_E2E_UPDATED_VERSION_CONFIGURATION.minimumSupportedVersion);
  await expect(page.getByTestId(TEST_ADMIN_E2E_TEST_IDS.versionSaveButton), "The version form should enable saving again once the configuration is valid.").toBeEnabled();
  await page.getByTestId(TEST_ADMIN_E2E_TEST_IDS.versionSaveButton).click();
  await expect(page.getByTestId(TEST_ADMIN_E2E_TEST_IDS.versionCurrentValue), "The versions screen should expose the saved current version after persisting valid changes.").toContainText(TEST_ADMIN_E2E_UPDATED_VERSION_CONFIGURATION.currentVersion);
  await expect
    .poll(
      async () => {
        return await page.evaluate(storageKeys => {
          return window.localStorage.getItem(storageKeys.versionConfiguration);
        }, TEST_ADMIN_E2E_STORAGE_KEYS);
      },
      {
        message: "The persisted administration version configuration should be updated after saving valid changes."
      }
    )
    .toContain(TEST_ADMIN_E2E_UPDATED_VERSION_CONFIGURATION.currentVersion);
});
