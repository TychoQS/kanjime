import { expect, test } from "@playwright/test";

import { installE2ENativeMocks } from "../../Support/E2ECapacitorMocks";
import { E2EApplicationPage } from "../../Support/E2EApplicationPage";

test.beforeEach(async ({ page }) => {
  await installE2ENativeMocks(page);
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => window.localStorage.clear());
});

test("DisplayKanjiInterface renders available fields for the selected kanji", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R12 - DisplayKanjiInterface
  // @pre A valid kanji route is opened.
  await app.goto("/kanji/日");

  // @inv Rendered fields belong to the selected kanji.
  await expect(page.getByTestId("kanji-detail-header")).toContainText("日");
  await expect(page.getByTestId("kanji-meanings-section")).toBeVisible();
  await expect(page.getByTestId("kanji-readings-section")).toBeVisible();
  await expect(page.getByTestId("kanji-information-section")).toBeVisible();

  // @post Available detail fields are visible to the user.
  await expect(page.getByTestId("kanji-information-section")).toContainText(/Strokes|Trazos|Stroke/i);
});

test("DisplayKanjiInterface copies the selected character", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R13 - DisplayKanjiInterface
  // Requirement: USABILIDAD R5 - KanjiEntryProps
  // @pre The user is on a valid kanji detail screen.
  await app.goto("/kanji/日");
  await expect(page.getByTestId("kanji-copy-button")).toBeEnabled();

  // @inv Copying does not change the selected kanji state.
  await page.getByTestId("kanji-copy-button").click();
  await expect(page.getByTestId("kanji-detail-header")).toContainText("日");

  // @post The selected character is available through the mocked clipboard.
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe("日");
});

test("DisplayKanjiInterface returns to the previous screen preserving state", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R14 - DisplayKanjiInterface
  // Requirement: USABILIDAD R6 - KanjiEntryProps
  // @pre A kanji detail was opened from search results.
  await app.goto("/search");
  await page.getByTestId("kanji-searchbar").locator("input").fill("日");
  await expect(app.visibleResults("search-results-panel").first()).toBeVisible();
  await app.visibleResults("search-results-panel").first().click();
  await expect(page.getByTestId("kanji-detail-screen")).toBeVisible();

  // @post The visible back control returns to the previous screen.
  await page.getByTestId("kanji-back-button").click();
  await expect(page.getByTestId("search-screen")).toBeVisible();

  // @inv Previous search state remains unchanged.
  await expect(page.getByTestId("kanji-searchbar").locator("input")).toHaveValue("日");
});
