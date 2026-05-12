import { expect, test } from "@playwright/test";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { E2EApplicationPage } from "../../Support/E2EApplicationPage";
import { ENGLISH_TRANSLATIONS } from "../../../src/Shared/I18n";

const require = createRequire(import.meta.url);
const packageMetadata = require("../../../package.json") as { readonly version: string };

const __dirname = dirname(fileURLToPath(import.meta.url));
const attributionsPath = join(__dirname, "../../../public/assets/attributions/data-sources.json");
const attributionsData = JSON.parse(readFileSync(attributionsPath, "utf-8")) as {
  readonly sources: ReadonlyArray<{
    readonly id: string;
    readonly attribution: string;
    readonly license: string;
  }>;
};

const expectedAttributions = attributionsData.sources.map(
  source => `${source.attribution}. ${source.license}.`
);

test.beforeEach(async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => window.localStorage.clear());
});

test("[R1][E2E] AboutInterface renders non-empty application information", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R1 - AboutInterface
  // @pre The user is on the About screen.
  await app.goto("/about");

  // @inv Valid About metadata never leaves the information container empty.
  await expect(page.getByTestId("about-list")).toBeVisible();

  // @post Application information is visible to the user.
  await expect(page.getByTestId("about-list").locator("dd")).toHaveCount(7);
  await expect(page.getByTestId("about-row-version").locator("dd")).toContainText(packageMetadata.version);
  await expect(page.getByTestId("about-row-authorship").locator("dd")).toContainText(ENGLISH_TRANSLATIONS.authorshipName);
  await expect(page.getByTestId("about-row-textConversion").locator("dd")).toContainText(ENGLISH_TRANSLATIONS.textConversionValue);
  await expect(page.getByTestId("about-row-jmdict").locator("dd")).toContainText(expectedAttributions[0]);
  await expect(page.getByTestId("about-row-kanjidic2").locator("dd")).toContainText(expectedAttributions[1]);
  await expect(page.getByTestId("about-row-kanjivg").locator("dd")).toContainText(expectedAttributions[2]);
  await expect(page.getByTestId("about-row-etl9b").locator("dd")).toContainText(expectedAttributions[3]);
});

test("[R2][E2E] AboutInterface renders the project version", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R2 - AboutInterface
  // @pre The user is on the About screen.
  await app.goto("/about");

  // @inv The visible version is synchronized with project metadata.
  await expect(page.getByTestId("about-row-version")).toContainText(packageMetadata.version);

  // @post The correct version is visible in the About information.
  await expect(page.getByTestId("about-row-version")).toBeVisible();
});
