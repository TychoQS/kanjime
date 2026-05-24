import { expect, test } from "@playwright/test";
import { getContrast } from "polished";

import { E2EApplicationPage } from "../../Support/E2EApplicationPage";
import { WCAG_AAA_CONTRAST_THRESHOLD } from "../../Support/TestData";
import { TRANSLATIONS, SUPPORTED_LOCALES, LANGUAGE_NAMES } from "../../../src/Shared/I18n";

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

import { TEST_SCREENS_I18N } from "../../Support/TestData";

for (const locale of SUPPORTED_LOCALES) {
  test(`[R10][E2E] GlobalProps applies configured language to all screen texts [${locale} – ${LANGUAGE_NAMES[locale]}]`, async ({ page }) => {
    const app = new E2EApplicationPage(page);

    // Requirement: USABILIDAD R10 - GlobalProps
    // @pre A supported language is configured before startup.
    const translations = TRANSLATIONS[locale];

    await page.addInitScript(lang => {
      window.localStorage.setItem("kanjime.preferences", JSON.stringify({ language: lang, theme: "light" }));
    }, locale);

    for (const screen of TEST_SCREENS_I18N) {
      await app.goto(screen.route);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.locator("ion-title").filter({ hasText: translations[screen.titleKey] })).toBeVisible();
      for (const testId of screen.checks) {
        await expect(page.getByTestId(testId)).toBeVisible();
      }
    }

    // @post The interface text is rendered in the configured language.
    await app.openMenu();
    await expect(page.getByTestId("nav-classification")).toContainText(translations.recognition);
    await expect(page.getByTestId("nav-search")).toContainText(translations.search);
    await expect(page.getByTestId("nav-history")).toContainText(translations.history);
    await expect(page.getByTestId("nav-about")).toContainText(translations.about);
    await expect(page.getByTestId("nav-calligraphy")).toContainText(translations.calligraphy);
    await app.closeMenu();
  });
}

for (const theme of ["light", "dark"] as const) {
  test(`[R15][E2E] GlobalProps maintains contrast with ${theme} theme on all screens`, async ({ page }) => {
    const app = new E2EApplicationPage(page);

    // Requirement: USABILIDAD R15 - GlobalProps
    // @pre A valid theme is configured.
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.evaluate(t => {
      window.localStorage.setItem("kanjime.preferences", JSON.stringify({ language: "en-US", theme: t }));
    }, theme);
    await page.reload();

    const screens = ["/classification", "/search", "/history", "/about"] as const;

    for (const route of screens) {
      await app.goto(route);

      // @inv Contrast is maintained across all visual components.
      const { backgroundColor, textColor, primaryColor, primaryContrast } = await page.evaluate(() => ({
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue("--ion-background-color").trim(),
        textColor: getComputedStyle(document.documentElement).getPropertyValue("--ion-text-color").trim(),
        primaryColor: getComputedStyle(document.documentElement).getPropertyValue("--ion-color-primary").trim(),
        primaryContrast: getComputedStyle(document.documentElement).getPropertyValue("--ion-color-primary-contrast").trim()
      }));

      expect(getContrast(backgroundColor, textColor)).toBeGreaterThanOrEqual(WCAG_AAA_CONTRAST_THRESHOLD);
      expect(getContrast(primaryColor, primaryContrast)).toBeGreaterThanOrEqual(WCAG_AAA_CONTRAST_THRESHOLD);

      // @post Visual elements are rendered using the active theme palette.
      await expect(page.locator("ion-app")).toHaveAttribute("data-theme", theme);
    }
  });
}
