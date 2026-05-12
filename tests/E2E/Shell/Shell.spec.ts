import { expect, test } from "@playwright/test";
import { getContrast } from "polished";

import { E2EApplicationPage } from "../../Support/E2EApplicationPage";
import { TEST_KANJI_DAY, WCAG_AAA_CONTRAST_THRESHOLD } from "../../Support/TestData";
import { TRANSLATIONS } from "../../../src/Shared/I18n";

test.beforeEach(async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => window.localStorage.clear());
});

test("[R8][E2E] NavigationProps closes the menu with the visible control", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: USABILIDAD R8 - NavigationProps
  // @pre The navigation menu is open.
  await app.goto("/classification");
  await app.openMenu();

  // @inv The close control remains visible while the menu is open.
  await expect(page.getByRole("button", { name: "Close navigation" })).toBeVisible();

  // @post Activating the control closes the menu.
  await app.closeMenu();
  await expect(page.getByRole("button", { name: "Close navigation" })).toBeHidden({
    timeout: 10_000,
  });
  await expect(page.getByTestId("navigation-view")).toBeHidden({
    timeout: 10_000,
  });
});

test("[R9][E2E] NavigationProps navigates to selected page from menu", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: USABILIDAD R9 - NavigationProps
  // @pre The navigation menu is open on the classification screen.
  await app.goto("/classification");
  await app.openMenu();

  // @inv The current page remains identified in the menu.
  await expect(page.getByTestId("nav-classification")).toHaveAttribute("aria-current", "page");

  // @post Selecting another page navigates correctly.
  await page.getByTestId("nav-search").click();
  await expect(page.getByTestId("search-screen")).toBeVisible();
});

test("[R27][E2E] NavigationInterface navigates clearly and resets page state", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R27 - NavigationInterface
  // @pre Search contains active state and the menu is open.
  await app.goto("/search");
  await page.getByTestId("kanji-searchbar").locator("input").fill(TEST_KANJI_DAY.character);
  await expect(app.visibleResults("search-results-panel").first()).toBeVisible();
  await app.openMenu();

  // @inv The current page remains identified in the navigation.
  await expect(page.getByRole("menuitem", { name: /Search|Buscar/ })).toHaveAttribute("aria-current", "page");

  // @post Navigating away and back clears the previous page state.
  await page.getByTestId("nav-classification").click();
  await expect(page.getByTestId("classification-screen")).toBeVisible();
  await app.goto("/search");
  await expect(page.getByTestId("kanji-searchbar").locator("input")).toHaveValue("");
});

test("[R28][E2E] NavigationInterface starts the application on image OCR mode", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R28 - NavigationInterface
  // @pre The application starts after the model has loaded.
  await app.goto("/");

  // @post The OCR screen is shown in image mode.
  await expect(page.getByTestId("ocr-image-segment")).toHaveClass(/segment-button-checked/);

  await expect(page.getByTestId("ocr-drawing-segment")).not.toHaveClass(/segment-button-checked/);
  await expect(page.getByTestId("image-ocr-zone")).toBeVisible();
  await expect(page.getByTestId("drawing-ocr-zone")).toBeHidden();
});

test("[R7][E2E] LoadingScreenProps shows a blocking loading indicator during startup", async ({ page }) => {
  // Requirement: USABILIDAD R7 - LoadingScreenProps

  // @pre A blocking startup process may exist during application startup.
  await page.goto("/classification", { waitUntil: "domcontentloaded" });

  const loading = page.getByTestId("loading-screen-view");

  if (await loading.isVisible()) {
    // @post A visible loading indicator is rendered.
    await expect(loading).toHaveAttribute("aria-busy", "true");
    await expect(loading).toHaveAttribute("role", "status");

    // @inv User interaction is blocked while loading.
    await expect(loading.locator("[data-blocks-interaction='true']")).toBeVisible();

    await expect(loading).toBeHidden({ timeout: 30_000 });
  }

  await expect(page.getByTestId("classification-screen")).toBeVisible({
    timeout: 30_000,
  });
});
