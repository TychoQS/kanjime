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

  // @post The application continues using the last known configuration and still allows normal use.
  await app.openMenu();
  await page.getByTestId(TEST_MOBILE_E2E_TEST_IDS.navAbout).click();
  await expect(page.getByTestId("about-screen"), "The application should still allow navigation to another screen after falling back to the last known version configuration.").toBeVisible();
});
