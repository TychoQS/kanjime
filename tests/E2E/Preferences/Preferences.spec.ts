import { expect, test } from "@playwright/test";

import { E2EApplicationPage } from "../../Support/E2EApplicationPage";

const TEST_KANJI = "日";

test.beforeEach(async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => window.localStorage.clear());
});

test("[R37][E2E] UserPreferenceInterface applies the configured language consistently", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R37 - UserPreferenceInterface
  // @pre A different supported language is selected from the menu.
  await app.goto("/classification");
  await app.openMenu();

  // Click the select's button to open the action sheet
  const langSelectButton = page.locator(".language-select").locator("button, .select-text, [role='button']").first();
  await langSelectButton.click({ timeout: 10000 });

  // Wait for action sheet with options to appear
  await page.waitForSelector("ion-action-sheet", { state: "attached", timeout: 10000 });
  await page.waitForTimeout(500);

  // Find and click the Spanish option in the action sheet
  const spanishBtn = page.locator("ion-action-sheet button").filter({ hasText: "Español" }).first();
  await expect(spanishBtn).toBeVisible({ timeout: 5000 });
  await spanishBtn.click();
  await page.waitForTimeout(500);
  await app.closeMenu();

  // @post The interface text is rendered in the configured language.
  await expect(page.locator("html")).toHaveAttribute("lang", "es-ES");
  await expect(page.locator("ion-title").filter({ hasText: "Reconocimiento" })).toBeVisible();
  await app.openMenu();
  await expect(page.getByRole("menuitem", { name: "Buscar" })).toBeVisible();
});

test("[R38][E2E] UserPreferenceInterface changes theme without losing functional state", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R38 - UserPreferenceInterface
  // @pre A valid theme control is available while functional state exists.
  await app.goto("/search");
  await page.getByTestId("kanji-searchbar").locator("input").fill(TEST_KANJI);
  await expect(app.visibleResults("search-results-panel").first()).toBeVisible();
  await app.openMenu();

  const themeBefore = await page.evaluate(() => document.documentElement.dataset.theme);
  const langBefore = await page.evaluate(() => document.documentElement.lang);

  const themeButton = page.getByTestId("theme-cycle-button");
  await themeButton.click();
  await page.waitForTimeout(1000);
  const themeAfter1Click = await page.locator("ion-app").first().getAttribute("data-theme");
  if (themeAfter1Click === themeBefore) {
    await themeButton.click();
    await page.waitForTimeout(1000);
  }
  await app.closeMenu();

  // @post The active theme changes and functional state remains intact.
  const ionApp = page.locator("ion-app").first();
  await expect(ionApp).not.toHaveAttribute("data-theme", themeBefore ?? "light");
  await expect(page.locator("html")).toHaveAttribute("lang", langBefore ?? "en-US");
  await expect(page.getByTestId("kanji-searchbar").locator("input")).toHaveValue(TEST_KANJI);
  await expect(app.visibleResults("search-results-panel").first()).toBeVisible();
});
