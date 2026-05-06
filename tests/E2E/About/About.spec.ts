import { expect, test } from "@playwright/test";
import { createRequire } from "node:module";

import { E2EApplicationPage } from "../../Support/E2EApplicationPage";

const require = createRequire(import.meta.url);
const packageMetadata = require("../../../package.json") as { readonly version: string };

test.beforeEach(async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => window.localStorage.clear());
});

test("AboutInterface renders non-empty application information", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R1 - AboutInterface
  // @pre The user is on the About screen.
  await app.goto("/about");

  // @inv Valid About metadata never leaves the information container empty.
  await expect(page.getByTestId("about-list")).toBeVisible();

  // @post Application information is visible to the user.
  await expect(page.getByTestId("about-list").locator("dd")).not.toHaveCount(0);
});

test("AboutInterface renders the project version", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R2 - AboutInterface
  // @pre The user is on the About screen.
  await app.goto("/about");

  // @inv The visible version is synchronized with project metadata.
  await expect(page.getByTestId("about-row-version")).toContainText(packageMetadata.version);

  // @post The correct version is visible in the About information.
  await expect(page.getByTestId("about-row-version")).toBeVisible();
});
