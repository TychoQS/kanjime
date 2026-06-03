import { createRequire } from "node:module";
import type { Page } from "@playwright/test";

import { test, expect } from "../../../Support/Fixtures";
import { E2EApplicationPage } from "../../../Support/E2EApplicationPage";
import {
  TEST_MOBILE_E2E_ROUTES,
  TEST_MOBILE_E2E_STORAGE_KEYS,
  TEST_MOBILE_E2E_TEST_IDS,
  TEST_MOBILE_E2E_VERSION_CONFIGURATION_CURRENT,
  TEST_MOBILE_E2E_LAST_KNOWN_VERSION_CONFIGURATION
} from "../../../Support/TestData";

const require = createRequire(import.meta.url);
const packageMetadata = require("../../../../package.json") as { readonly version: string };

interface SeedVersionCheckStateArgs {
  readonly remoteConfiguration: {
    readonly currentVersion: string;
    readonly latestVersion: string;
    readonly minimumSupportedVersion: string;
    readonly updatedAt: string;
  };
  readonly failFlag: boolean;
  readonly lastKnown?: {
    readonly currentVersion: string;
    readonly latestVersion: string;
    readonly minimumSupportedVersion: string;
    readonly updatedAt: string;
  };
  readonly storageKeys: typeof TEST_MOBILE_E2E_STORAGE_KEYS;
}

async function seedVersionCheckState(
  page: Page,
  configuration: {
    readonly currentVersion: string;
    readonly latestVersion: string;
    readonly minimumSupportedVersion: string;
    readonly updatedAt: string;
  },
  shouldFail: boolean,
  lastKnownConfiguration?: {
    readonly currentVersion: string;
    readonly latestVersion: string;
    readonly minimumSupportedVersion: string;
    readonly updatedAt: string;
  }
): Promise<void> {
  await page.addInitScript(
    ({ remoteConfiguration, failFlag, lastKnown, storageKeys }: SeedVersionCheckStateArgs) => {
      window.localStorage.clear();
      window.localStorage.setItem(storageKeys.remoteVersionConfiguration, JSON.stringify(remoteConfiguration));
      window.localStorage.setItem(storageKeys.versionCheckShouldFail, JSON.stringify(failFlag));

      if (lastKnown !== undefined) {
        window.localStorage.setItem(storageKeys.lastKnownVersionConfiguration, JSON.stringify(lastKnown));
      }
    },
    {
      remoteConfiguration: configuration,
      failFlag: shouldFail,
      lastKnown: lastKnownConfiguration,
      storageKeys: TEST_MOBILE_E2E_STORAGE_KEYS
    }
  );
}

test("[R57][E2E] VersionCheckInterface determines whether the running version is already current", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R57 - VersionCheckInterface
  // @pre The application starts with a defined current version.
  await seedVersionCheckState(page, {
    ...TEST_MOBILE_E2E_VERSION_CONFIGURATION_CURRENT,
    currentVersion: packageMetadata.version,
    latestVersion: packageMetadata.version,
    minimumSupportedVersion: packageMetadata.version
  }, false);
  await app.goto(TEST_MOBILE_E2E_ROUTES.classification);

  // @inv Version verification never blocks normal application startup.
  await expect(page.getByTestId(TEST_MOBILE_E2E_TEST_IDS.classificationScreen), "The classification screen should remain visible after startup version verification completes.").toBeVisible();

  // @post The application determines that the running version is current and does not show an update notice.
  await expect(page.getByTestId(TEST_MOBILE_E2E_TEST_IDS.updateAvailableView), "The update notice should stay hidden when the running version already matches the latest available version.").toBeHidden();
});

test("[R59][E2E] VersionCheckInterface falls back to the last known configuration after a remote failure", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R59 - VersionCheckInterface
  // @pre The application starts while the remote version check fails.
  await seedVersionCheckState(
    page,
    TEST_MOBILE_E2E_VERSION_CONFIGURATION_CURRENT,
    true,
    TEST_MOBILE_E2E_LAST_KNOWN_VERSION_CONFIGURATION
  );
  await app.goto(TEST_MOBILE_E2E_ROUTES.classification);

  // @inv The connection failure must not throw an uncontrolled startup error or block the application.
  await expect(page.getByTestId(TEST_MOBILE_E2E_TEST_IDS.classificationScreen), "The application should remain usable when the remote version source fails during startup.").toBeVisible();

  // @post The application continues using the last known configuration and exposes the corresponding update notice.
  await expect(page.getByTestId(TEST_MOBILE_E2E_TEST_IDS.updateAvailableView), "The update notice should be visible when the last known configuration indicates that a newer compatible version exists.").toBeVisible();
});
