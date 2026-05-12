import type { Page } from "@playwright/test";

import { E2E_KANJI_IMAGE_DATA_URL } from "./E2EImageFixtures";

/**
 * Installs browser fallbacks used by E2E tests for native-facing APIs.
 *
 * @pre The script is registered before page navigation.
 * @post Clipboard and media helpers are deterministic for browser tests.
 */
export async function installE2ENativeMocks(page: Page): Promise<void> {
  await page.addInitScript((imageDataUrl) => {
    let clipboardValue = "";

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (value: string) => {
          clipboardValue = value;
        },
        readText: async () => clipboardValue
      }
    });

    window.localStorage.setItem("kanjime.e2e.image", imageDataUrl);
  }, E2E_KANJI_IMAGE_DATA_URL);
}
