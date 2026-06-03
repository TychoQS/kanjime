import { test, expect } from "../../../Support/Fixtures";
import { E2EAdminPage } from "../../../Support/E2EAdminPage";
import {
  TEST_ADMIN_E2E_INVALID_VERSION_VALUE,
  TEST_ADMIN_E2E_STORAGE_KEYS,
  TEST_ADMIN_E2E_TEST_IDS,
  TEST_ADMIN_E2E_VALIDATION_MESSAGE,
  TEST_ADMIN_E2E_VERSION_CONFIGURATION
} from "../../../Support/TestData";

test("[R27][E2E] AdminVersionFormProps shows a clear validation message and avoids saving invalid configuration", async ({ page }) => {
  const admin = new E2EAdminPage(page);

  // Requirement: USABILIDAD R27 - AdminVersionFormProps
  // @pre The administrator introduces an invalid version format in the version form.
  await admin.goto("/");
  await admin.navigateToVersions();
  await page.getByTestId(TEST_ADMIN_E2E_TEST_IDS.versionsEditButton).click();
  const currentVersionInput = page.getByTestId(TEST_ADMIN_E2E_TEST_IDS.versionCurrentInput).locator("input");
  await currentVersionInput.fill("");
  await currentVersionInput.fill(TEST_ADMIN_E2E_INVALID_VERSION_VALUE);

  // @inv The interface must not save invalid configurations or show ambiguous validation messages.
  await expect(page.getByTestId(TEST_ADMIN_E2E_TEST_IDS.versionSaveButton), "The version form should keep the save action disabled while the version format remains invalid.").toBeDisabled();
  const storedConfiguration = await page.evaluate(storageKeys => {
    return window.localStorage.getItem(storageKeys.versionConfiguration);
  }, TEST_ADMIN_E2E_STORAGE_KEYS);
  expect(storedConfiguration, "The persisted version configuration should remain unchanged after entering an invalid version.").toContain(TEST_ADMIN_E2E_VERSION_CONFIGURATION.currentVersion);

  // @post The administrator sees a clear validation message explaining that the entered version format is invalid.
  await expect(page.getByTestId(TEST_ADMIN_E2E_TEST_IDS.versionValidationMessage), "The version form should display a clear semantic-version validation message.").toContainText(TEST_ADMIN_E2E_VALIDATION_MESSAGE);
});
