import { ENGLISH_TRANSLATIONS } from "../../../../src/Shared/I18n";
import type { Page } from "@playwright/test";
import { test, expect } from "../../../Support/Fixtures";
import { E2EApplicationPage } from "../../../Support/E2EApplicationPage";
import {
  TEST_MOBILE_E2E_ROUTES,
  TEST_MOBILE_E2E_STORAGE_KEYS,
  TEST_MOBILE_E2E_TEST_IDS,
  TEST_MOBILE_E2E_VERSION_CONFIGURATION_OLD
} from "../../../Support/TestData";

interface SeedReadableUpdateNoticeArgs {
  readonly configuration: typeof TEST_MOBILE_E2E_VERSION_CONFIGURATION_OLD;
  readonly storageKeys: typeof TEST_MOBILE_E2E_STORAGE_KEYS;
}

async function seedReadableUpdateNotice(page: Page): Promise<void> {
  await page.addInitScript(
    ({ configuration, storageKeys }: SeedReadableUpdateNoticeArgs) => {
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

test("[R24][E2E] UpdateAvailableProps exposes a clear and non-technical update message", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: USABILIDAD R24 - UpdateAvailableProps
  // @pre The application starts while a newer version exists than the one used by the user.
  await seedReadableUpdateNotice(page);
  await app.goto(TEST_MOBILE_E2E_ROUTES.classification);
  const storedVersionConfiguration = await page.evaluate(storageKeys => window.localStorage.getItem(storageKeys.remoteVersionConfiguration), TEST_MOBILE_E2E_STORAGE_KEYS);
  expect(storedVersionConfiguration, "The E2E scenario should start with a remote version configuration.").not.toBeNull();
  expect(storedVersionConfiguration, "The remote version configuration should contain the current application version.").toContain(TEST_MOBILE_E2E_VERSION_CONFIGURATION_OLD.currentVersion);
  expect(storedVersionConfiguration, "The remote version configuration should contain a newer latest version.").toContain(TEST_MOBILE_E2E_VERSION_CONFIGURATION_OLD.latestVersion);
  const updateNotice = page.getByTestId(TEST_MOBILE_E2E_TEST_IDS.updateAvailableView);

  // @inv The notice must stay non-blocking and avoid internal technical wording.
  await expect(page.getByTestId("image-ocr-zone"), "The application should show the image OCR mode before checking normal interaction.").toBeVisible();
  await expect(page.getByTestId("drawing-ocr-zone"), "The drawing OCR mode should be hidden before the user changes OCR mode.").toBeHidden();

  await page.getByTestId("ocr-drawing-segment").click();

  await expect(page.getByTestId("drawing-ocr-zone"), "The user should be able to switch to drawing OCR mode while the update notice exists.").toBeVisible();
  await expect(page.getByTestId("image-ocr-zone"), "The image OCR mode should be hidden after switching to drawing OCR mode.").toBeHidden();

  await expect(page.getByTestId("ocr-drawing-segment"), "The drawing OCR segment should become selected after the user interaction.").toHaveClass(/segment-button-checked/);
  await expect(page.getByTestId("ocr-image-segment"), "The image OCR segment should no longer be selected after switching mode.").not.toHaveClass(/segment-button-checked/);

  // @post The user sees a clear update message and can continue using the application.
  await expect(updateNotice, "The update notice should be visible when a newer version exists for the user.").toBeVisible();
  await expect(page.getByTestId(TEST_MOBILE_E2E_TEST_IDS.updateAvailableDismissButton), "The update notice should remain dismissible so it does not block normal use.").toBeVisible();
  await expect
    .poll(
      async () => {
        return await updateNotice.evaluate(element => (element as HTMLIonToastElement).message);
      },
      {
        message: "The update notice should expose the expected user-facing update message."
      }
    )
    .toBe(ENGLISH_TRANSLATIONS.updateAvailable);
});
