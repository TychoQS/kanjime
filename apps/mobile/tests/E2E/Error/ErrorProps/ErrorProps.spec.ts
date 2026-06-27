import { ENGLISH_TRANSLATIONS } from "../../../../src/Shared/I18n";
import type { Page } from "@playwright/test";
import { test, expect } from "../../../Support/Fixtures";
import {
  TEST_MOBILE_E2E_FORCED_ERROR_MESSAGE,
  TEST_MOBILE_E2E_ROUTES,
  TEST_MOBILE_E2E_SENSITIVE_MESSAGE_FRAGMENT,
  TEST_MOBILE_E2E_STORAGE_KEYS,
  TEST_MOBILE_E2E_TEST_IDS,
  TEST_MOBILE_E2E_UNEXPECTED_ERROR_MESSAGE,
  TEST_MOBILE_E2E_VERSION_CONFIGURATION_CURRENT
} from "../../../Support/TestData";
import { E2EApplicationPage } from "../../../Support/E2EApplicationPage";

interface SeedControlledErrorPropsArgs {
  readonly configuration: typeof TEST_MOBILE_E2E_VERSION_CONFIGURATION_CURRENT;
  readonly storageKeys: typeof TEST_MOBILE_E2E_STORAGE_KEYS;
}

async function seedControlledErrorProps(page: Page): Promise<void> {
  await page.addInitScript(
    ({ configuration, storageKeys }: SeedControlledErrorPropsArgs) => {
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

test("[R25][E2E] ErrorProps renders a clear non-technical message for the user", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: USABILIDAD R25 - ErrorProps
  // @pre An unexpected error happens while the application is running.
  await seedControlledErrorProps(page);
  await app.goto(TEST_MOBILE_E2E_ROUTES.classification);
  await expect(page.getByTestId(TEST_MOBILE_E2E_TEST_IDS.triggerUnexpectedErrorButton), "The test control for triggering an unexpected error should be available.").toBeVisible();
  await page.getByTestId(TEST_MOBILE_E2E_TEST_IDS.triggerUnexpectedErrorButton).evaluate(button => {
    (button as HTMLButtonElement).click();
  });

  const controlledErrorView = page.getByTestId(TEST_MOBILE_E2E_TEST_IDS.controlledErrorView);

  // @inv The controlled message must not expose internal traces or technical details.
  await expect(controlledErrorView, "The controlled error interface should be visible before validating the user-facing message.").toBeVisible();
  await expect
    .poll(
      async () => {
        const message = String(await controlledErrorView.evaluate(element => (element as HTMLIonAlertElement).message ?? ""));

        return !message.includes(TEST_MOBILE_E2E_FORCED_ERROR_MESSAGE) && !message.includes(TEST_MOBILE_E2E_SENSITIVE_MESSAGE_FRAGMENT);
      },
      {
        message: "The controlled error message should avoid raw exception details and technical trace prefixes."
      }
    )
    .toBe(true);

  // @post The user sees a clear and non-technical error message.
  await expect
    .poll(
      async () => {
        return await controlledErrorView.evaluate(element => (element as HTMLIonAlertElement).message);
      },
      {
        message: "The user-facing controlled error message should stay aligned with the requirement wording."
      }
    )
    .toBe(TEST_MOBILE_E2E_UNEXPECTED_ERROR_MESSAGE);
  await expect(page.getByTestId(TEST_MOBILE_E2E_TEST_IDS.controlledErrorView), "The controlled error dialog should be visible after triggering an unexpected error.").toBeVisible();
});
