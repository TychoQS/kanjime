import { expect, test } from "@playwright/test";

import { E2EApplicationPage } from "../../Support/E2EApplicationPage";

test.beforeEach(async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => window.localStorage.clear());
});

test("[R8][E2E] NavigationInterface closes the menu with the visible control", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: USABILIDAD R8 - NavigationProps
  // @pre The navigation menu is open.
  await app.goto("/classification");
  await app.openMenu();

  // @inv The close control remains visible while the menu is open.
  await expect(page.getByRole("button", { name: "Close navigation" })).toBeVisible();

  // @post Activating the control closes the menu.
  await app.closeMenu();
});

test("[R27][E2E] NavigationInterface navigates clearly and resets page state", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R27 - NavigationInterface
  // @pre Search contains active state and the menu is open.
  await app.goto("/search");
  await page.getByTestId("kanji-searchbar").locator("input").fill("日");
  await expect(app.visibleResults("search-results-panel").first()).toBeVisible();
  await app.openMenu();

  // @inv The current page remains identified in the navigation.
  await expect(page.getByRole("menuitem", { name: /Search|Buscar/ })).toHaveAttribute("aria-current", "page");

  // @post Navigating away and back clears the previous page state.
  await page.getByRole("menuitem", { name: /Recognition|Reconocimiento/ }).click();
  await expect(page.getByTestId("classification-screen")).toBeVisible();
  await app.goto("/search");
  await expect(page.getByTestId("kanji-searchbar").locator("input")).toHaveValue("");
});

test("[R7][E2E] LoadingScreenProps shows a blocking loading indicator during startup", async ({ page }) => {
  // Requirement: USABILIDAD R7 - LoadingScreenProps
  // @pre The application has just started and blocking startup work exists.
  await page.goto("/classification", { waitUntil: "domcontentloaded" });

  // @inv The startup loading screen marks interaction as blocked when visible.
  const loading = page.getByTestId("loading-screen-view");
  if (await loading.isVisible()) {
    await expect(loading.locator("[data-blocks-interaction='true']")).toBeVisible();
  }

  // @post Startup completes and the OCR screen is available.
  await expect(loading).toBeHidden({ timeout: 30_000 });
  await expect(page.getByTestId("classification-screen")).toBeVisible();
});
