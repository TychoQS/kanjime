import { expect, type Locator, type Page } from "@playwright/test";

import { TEST_ADMIN_E2E_TEST_IDS } from "./TestData";

export class E2EAdminPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path = "/"): Promise<void> {
    await this.page.goto(path);
    await this.waitUntilReady();
  }

  async waitUntilReady(): Promise<void> {
    await expect
      .poll(
        async () => {
          const screen = this.page.getByTestId(TEST_ADMIN_E2E_TEST_IDS.shellScreen);

          return await screen.isVisible().catch(() => false);
        },
        {
          message: "The admin shell should become visible after loading the mocked administrator session."
        }
      )
      .toBe(true);
  }

  async navigateToVersions(): Promise<void> {
    await this.page.getByTestId(TEST_ADMIN_E2E_TEST_IDS.navVersionsButton).click();
    await expect(this.page.getByTestId(TEST_ADMIN_E2E_TEST_IDS.versionsView), "The versions view should be visible after navigating to the versions section.").toBeVisible();
  }

  async navigateToErrors(): Promise<void> {
    await this.page.getByTestId(TEST_ADMIN_E2E_TEST_IDS.navErrorsButton).click();
    await expect(this.page.getByTestId(TEST_ADMIN_E2E_TEST_IDS.errorsView), "The errors view should be visible after navigating to the errors section.").toBeVisible();
  }

  errorRow(errorId: string): Locator {
    return this.page.getByTestId(`admin-error-row-${errorId}`);
  }
}
