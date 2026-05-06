import { expect, test } from "@playwright/test";
import { createRequire } from "node:module";

import { E2EApplicationPage } from "../../Support/E2EApplicationPage";

const require = createRequire(import.meta.url);
const packageMetadata = require("../../../package.json") as { readonly version: string };

test.beforeEach(async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => window.localStorage.clear());
});

test("AboutInterface renders non-empty information and the project version", async ({ page }) => {
  const app = new E2EApplicationPage(page);

  // Requirement: FUNCIONALES R1 - AboutInterface
  // Requirement: FUNCIONALES R2 - AboutInterface
  // @pre The user is on the About screen.
  await app.goto("/about");

  // @inv Valid About metadata never leaves the information container empty.
  await expect(page.getByTestId("about-list")).toBeVisible();
  await expect(page.getByTestId("about-list").locator("dd")).not.toHaveCount(0);

  // @post The visible version matches the project metadata.
  await expect(page.getByTestId("about-row-version")).toContainText(packageMetadata.version);
});
