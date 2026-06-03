import type { Page } from "@playwright/test";

import { test, expect } from "../../../Support/Fixtures";
import { E2EApplicationPage } from "../../../Support/E2EApplicationPage";
import {
  TEST_MOBILE_E2E_ROUTES,
  TEST_MOBILE_E2E_STORAGE_KEYS,
  TEST_MOBILE_E2E_TEST_IDS,
  TEST_MOBILE_E2E_VERSION_CONFIGURATION_OLD
} from "../../../Support/TestData";

interface SeedUpdateNoticeArgs {
  readonly configuration: typeof TEST_MOBILE_E2E_VERSION_CONFIGURATION_OLD;
  readonly storageKeys: typeof TEST_MOBILE_E2E_STORAGE_KEYS;
}

async function seedOldVersionConfiguration(page: Page): Promise<void> {
  await page.addInitScript(
    ({ configuration, storageKeys }: SeedUpdateNoticeArgs) => {
      window.localStorage.clear();
      window.localStorage.setItem(storageKeys.remoteVersionConfiguration, JSON.stringify(configuration));
      window.localStorage.setItem(storageKeys.versionCheckShouldFail, JSON.stringify(false));
    },
    {
      configuration: TEST_MOBILE_E2E_VERSION_CONFIGURATION_OLD,
      storageKeys: TEST_MOBILE_E2E_STORAGE_KEYS
    }
  );
}

test("[R58][E2E] UpdateAvailableInterface shows a non-blocking update recommendation when a newer compatible version exists", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R58 - UpdateAvailableInterface
  // @pre The application starts with a running version below the latest available compatible version.
  await seedOldVersionConfiguration(page);
  await app.goto(TEST_MOBILE_E2E_ROUTES.classification);

  // @inv The update notice must not block normal use of the application.
  await expect(page.getByTestId(TEST_MOBILE_E2E_TEST_IDS.updateAvailableView), "The update notice should become visible when a newer compatible version is available.").toBeVisible();
  await app.openMenu();
  await page.getByTestId(TEST_MOBILE_E2E_TEST_IDS.navSearch).click();
  await expect(page.getByTestId("search-screen"), "The search screen should remain reachable while the update notice is visible.").toBeVisible();

  // @post The application exposes an informational update recommendation to the user.
  await expect(page.getByTestId(TEST_MOBILE_E2E_TEST_IDS.updateAvailableDismissButton), "The update notice should provide a dismiss action so the user can keep using the application.").toBeVisible();
});
