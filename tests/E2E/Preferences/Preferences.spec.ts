import { expect, test } from "@playwright/test";

import { E2EApplicationPage } from "../../Support/E2EApplicationPage";

test.beforeEach(async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => window.localStorage.clear());
});

test("UserPreferenceInterface changes theme without losing functional state", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R38 - UserPreferenceInterface
  // Requirement: USABILIDAD R15 - GlobalProps
  // @pre A valid theme control is available while functional state exists.
  await app.goto("/search");
  await page.getByTestId("kanji-searchbar").locator("input").fill("日");
  await expect(app.visibleResults("search-results-panel").first()).toBeVisible();
  await app.openMenu();
  const themeBefore = await page.locator("html").getAttribute("data-theme");
  await page.getByTestId("theme-cycle-button").click();
  await page.getByTestId("theme-cycle-button").click();

  // @post The active theme changes visibly.
  await expect.poll(() => page.locator("html").getAttribute("data-theme")).not.toBe(themeBefore);

  // @inv Functional search state remains available after the preference change.
  await app.closeMenu();
  await expect(page.getByTestId("kanji-searchbar").locator("input")).toHaveValue("日");
  await expect(app.visibleResults("search-results-panel").first()).toBeVisible();
});

test("UserPreferenceInterface applies the configured language consistently", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R37 - UserPreferenceInterface
  // Requirement: USABILIDAD R10 - GlobalProps
  // @pre A different supported language is persisted before startup.
  await page.addInitScript(() => {
    window.localStorage.setItem("tfg-app.preferences", JSON.stringify({ language: "es-ES", theme: "light" }));
  });
  await app.goto("/classification");

  // @inv The configured language is applied to document metadata and visible text.
  await expect(page.locator("html")).toHaveAttribute("lang", "es-ES");
  await expect(page.locator("ion-title").filter({ hasText: "Reconocimiento" })).toBeVisible();

  // @post Navigation text is rendered in the configured language.
  await app.openMenu();
  await expect(page.getByRole("menuitem", { name: "Buscar" })).toBeVisible();
});
