import { expect, type Locator, type Page } from "@playwright/test";

/**
 * Shared browser actions for the mobile Ionic shell.
 *
 * @pre A Playwright page is available.
 * @post Tests can navigate using visible application controls.
 */
export class E2EApplicationPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path = "/"): Promise<void> {
    await this.page.goto(path);
    await this.waitUntilReady();
  }

  async waitUntilReady(): Promise<void> {
    await expect(this.page.getByTestId("loading-screen-view")).toBeHidden({ timeout: 30_000 });
    await expect(this.page.getByTestId("classification-screen").or(this.page.getByTestId("search-screen")).or(this.page.getByTestId("history-screen")).or(this.page.getByTestId("about-screen")).or(this.page.getByTestId("kanji-detail-screen"))).toBeVisible();
  }

  async openMenu(): Promise<void> {
    await this.page.locator("[data-testid='menu-button']:visible").first().click();
    await expect(this.page.getByTestId("navigation-view")).toBeVisible();
  }

  async closeMenu(): Promise<void> {
    await this.page.getByRole("button", { name: "Close navigation" }).click();
    await expect(this.page.getByTestId("navigation-view")).toBeHidden();
  }

  async navigateByMenu(label: string | RegExp): Promise<void> {
    const isMenuShown = await this.page.getByTestId("app-menu").evaluate(element =>
      element.classList.contains("show-menu")
    );

    if (!isMenuShown) {
      await this.openMenu();
    }
    await this.page.getByTestId("navigation-view").getByRole("menuitem", { name: label }).click();
    await expect(this.page.getByTestId("navigation-view")).toBeHidden();
  }

  visibleResults(containerTestId: string): Locator {
    return this.page.getByTestId(containerTestId).locator(".result-row");
  }
}
