import { test as base, expect } from "@playwright/test";

import {
  TEST_ADMIN_E2E_AUTH_USER,
  TEST_ADMIN_E2E_ERROR_REPORTS,
  TEST_ADMIN_E2E_STORAGE_KEYS,
  TEST_ADMIN_E2E_VERSION_CONFIGURATION
} from "./TestData";

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(
      ({ authUser, errorReports, storageKeys, versionConfiguration }) => {
        window.localStorage.clear();
        window.localStorage.setItem(storageKeys.authUser, JSON.stringify(authUser));
        window.localStorage.setItem(storageKeys.errorReports, JSON.stringify(errorReports));
        window.localStorage.setItem(storageKeys.versionConfiguration, JSON.stringify(versionConfiguration));
      },
      {
        authUser: TEST_ADMIN_E2E_AUTH_USER,
        errorReports: TEST_ADMIN_E2E_ERROR_REPORTS,
        storageKeys: TEST_ADMIN_E2E_STORAGE_KEYS,
        versionConfiguration: TEST_ADMIN_E2E_VERSION_CONFIGURATION
      }
    );

    await use(page);
  }
});

export { expect };

