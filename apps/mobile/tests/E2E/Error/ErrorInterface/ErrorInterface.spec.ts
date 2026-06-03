import type { Page } from "@playwright/test";

import { test, expect } from "../../../Support/Fixtures";
import { E2EApplicationPage } from "../../../Support/E2EApplicationPage";
import {
  TEST_MOBILE_E2E_ROUTES,
  TEST_MOBILE_E2E_STORAGE_KEYS,
  TEST_MOBILE_E2E_TEST_IDS,
  TEST_MOBILE_E2E_VERSION_CONFIGURATION_CURRENT
} from "../../../Support/TestData";

interface SeedUnexpectedErrorArgs {
  readonly configuration: typeof TEST_MOBILE_E2E_VERSION_CONFIGURATION_CURRENT;
  readonly storageKeys: typeof TEST_MOBILE_E2E_STORAGE_KEYS;
}

async function seedUnexpectedErrorScenario(page: Page): Promise<void> {
  await page.addInitScript(
    ({ configuration, storageKeys }: SeedUnexpectedErrorArgs) => {
      window.localStorage.clear();
      window.localStorage.setItem(storageKeys.remoteVersionConfiguration, JSON.stringify(configuration));
      window.localStorage.setItem(storageKeys.versionCheckShouldFail, JSON.stringify(false));
    },
    {
      configuration: TEST_MOBILE_E2E_VERSION_CONFIGURATION_CURRENT,
      storageKeys: TEST_MOBILE_E2E_STORAGE_KEYS
    }
  );
}

test("[R60][E2E] ErrorInterface captures an unexpected runtime error and shows a controlled response", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R60 - ErrorInterface
  // @pre An unexpected error is triggered while a component is running.
  await seedUnexpectedErrorScenario(page);
  await app.goto(TEST_MOBILE_E2E_ROUTES.classification);
  await page.getByTestId(TEST_MOBILE_E2E_TEST_IDS.triggerUnexpectedErrorButton).evaluate(button => {
    (button as HTMLButtonElement).click();
  });

  const controlledErrorView = page.getByTestId(TEST_MOBILE_E2E_TEST_IDS.controlledErrorView);

  // @inv Capturing the error must not cause a second failure or leave the application blank.
  await expect(controlledErrorView, "The controlled error interface should appear instead of leaving the application in a blank state.").toBeVisible();
  await expect
    .poll(
      async () => await page.locator("body > *").count(),
      {
        message: "The application should keep rendering content after handling an unexpected runtime error."
      }
    )
    .toBeGreaterThan(0);

  // @post The application shows a controlled error interface to the user.
  await expect(page.getByTestId(TEST_MOBILE_E2E_TEST_IDS.controlledErrorDismissButton), "The controlled error interface should expose the dismiss action defined by the contract.").toBeVisible();
});
