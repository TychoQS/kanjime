import { expect, type Locator, type Page } from "@playwright/test";

import {
  TEST_CALLIGRAPHY_CATEGORY_ID,
  TEST_CALLIGRAPHY_E2E_MESSAGES,
  TEST_CALLIGRAPHY_JLPT_GROUPING,
  TEST_CALLIGRAPHY_ROUTES,
  TEST_CALLIGRAPHY_STROKE_PATH,
  TEST_CALLIGRAPHY_STROKE_COUNT_PATTERN,
  TEST_CALLIGRAPHY_TEST_IDS,
  TEST_CALLIGRAPHY_WAIT_TIMEOUTS
} from "./TestData";

export interface VisibleCalligraphyKanji {
  readonly character: string;
  readonly strokeCount: number;
}

/**
 * Page helper for calligraphy E2E flows.
 */
export class E2ECalligraphyPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async resetApplicationState(): Promise<void> {
    await this.page.goto("/", { waitUntil: "domcontentloaded" });
    await this.waitForApplicationReady();
    await this.page.evaluate(() => window.localStorage.clear());
  }

  async gotoHome(): Promise<void> {
    await this.page.goto(TEST_CALLIGRAPHY_ROUTES.home);
    await this.waitForApplicationReady();
    await this.waitForHome();
  }

  async waitForHome(): Promise<void> {
    await expect.poll(
      () => this.page.evaluate(() => window.location.pathname),
      {
        message: TEST_CALLIGRAPHY_E2E_MESSAGES.homeVisible
      }
    ).toBe(TEST_CALLIGRAPHY_ROUTES.home);
    await expect(
      this.page.getByTestId(TEST_CALLIGRAPHY_TEST_IDS.view),
      TEST_CALLIGRAPHY_E2E_MESSAGES.homeVisible
    ).toBeVisible();
  }

  async waitForApplicationReady(): Promise<void> {
    const loadingScreen = this.page.getByTestId(TEST_CALLIGRAPHY_TEST_IDS.loadingScreen);

    if (await loadingScreen.count() > 0) {
      await expect(
        loadingScreen,
        TEST_CALLIGRAPHY_E2E_MESSAGES.homeVisible
      ).toBeHidden({ timeout: TEST_CALLIGRAPHY_WAIT_TIMEOUTS.applicationReadyMs });
    }
  }

  async selectGrouping(grouping: "jlpt" | "joyo"): Promise<void> {
    await this.groupingButton(grouping).click();
    await expect(
      this.groupingButton(grouping),
      TEST_CALLIGRAPHY_E2E_MESSAGES.selectedGroupingActive
    ).toHaveAttribute("aria-pressed", "true");
  }

  groupingButton(grouping: "jlpt" | "joyo"): Locator {
    return this.page.getByTestId(
      grouping === TEST_CALLIGRAPHY_JLPT_GROUPING
        ? TEST_CALLIGRAPHY_TEST_IDS.groupingJlpt
        : TEST_CALLIGRAPHY_TEST_IDS.groupingJoyo
    );
  }

  categoryButton(categoryId = TEST_CALLIGRAPHY_CATEGORY_ID): Locator {
    return this.page.getByTestId(`${TEST_CALLIGRAPHY_TEST_IDS.categoryPrefix}${categoryId}`);
  }

  visibleCategoryButtons(): Locator {
    return this.page
      .getByTestId(TEST_CALLIGRAPHY_TEST_IDS.categoriesPanel)
      .locator(`[data-testid^="${TEST_CALLIGRAPHY_TEST_IDS.categoryPrefix}"]`);
  }

  async visibleCategoryIds(): Promise<ReadonlyArray<string>> {
    return this.visibleCategoryButtons().evaluateAll((nodes, prefix) => (
      nodes
        .map(node => node.getAttribute("data-testid") ?? "")
        .filter(testId => testId.length > 0)
        .map(testId => testId.slice(String(prefix).length))
    ), TEST_CALLIGRAPHY_TEST_IDS.categoryPrefix);
  }

  async openCategory(categoryId = TEST_CALLIGRAPHY_CATEGORY_ID): Promise<void> {
    await expect(
      this.categoryButton(categoryId),
      TEST_CALLIGRAPHY_E2E_MESSAGES.categoryNavigable
    ).toBeVisible();
    await this.categoryButton(categoryId).click();
    await this.waitForCategory(categoryId);
  }

  async waitForCategory(categoryId = TEST_CALLIGRAPHY_CATEGORY_ID): Promise<void> {
    await expect(
      this.page.getByTestId(TEST_CALLIGRAPHY_TEST_IDS.categoryView),
      TEST_CALLIGRAPHY_E2E_MESSAGES.categoryScreenVisible
    ).toBeVisible();
    await expect.poll(
      () => this.page.evaluate(() => window.location.pathname),
      {
        message: TEST_CALLIGRAPHY_E2E_MESSAGES.categoryRouteSelected
      }
    ).toContain(categoryId);
  }

  kanjiButtons(): Locator {
    return this.page
      .getByTestId(TEST_CALLIGRAPHY_TEST_IDS.categoryView)
      .locator(`[data-testid^="${TEST_CALLIGRAPHY_TEST_IDS.kanjiPrefix}"]`);
  }

  async visibleKanjiEntries(): Promise<ReadonlyArray<VisibleCalligraphyKanji>> {
    return this.kanjiButtons().evaluateAll((nodes, input) => {
      const prefix = input.prefix;
      const pattern = new RegExp(input.strokeCountPattern);

      return nodes.map(node => {
        const testId = node.getAttribute("data-testid") ?? "";
        const character = testId.slice(prefix.length);
        const text = node.textContent ?? "";
        const strokeCount = Number.parseInt(text.match(pattern)?.[0] ?? "", 10);

        return {
          character,
          strokeCount
        };
      });
    }, {
      prefix: TEST_CALLIGRAPHY_TEST_IDS.kanjiPrefix,
      strokeCountPattern: TEST_CALLIGRAPHY_STROKE_COUNT_PATTERN.source
    });
  }

  async openFirstVisiblePractice(): Promise<string> {
    await expect(
      this.kanjiButtons().first(),
      TEST_CALLIGRAPHY_E2E_MESSAGES.categoryKanjiVisible
    ).toBeVisible();
    const testId = await this.kanjiButtons().first().getAttribute("data-testid");
    const character = (testId ?? "").slice(TEST_CALLIGRAPHY_TEST_IDS.kanjiPrefix.length);

    await this.kanjiButtons().first().click();
    await this.waitForPractice(character);

    return character;
  }

  async waitForPractice(character: string): Promise<void> {
    await expect(
      this.page.getByTestId(TEST_CALLIGRAPHY_TEST_IDS.practiceScreen).first(),
      TEST_CALLIGRAPHY_E2E_MESSAGES.practiceVisible
    ).toBeVisible();
    await expect.poll(
      () => this.page.evaluate(() => decodeURIComponent(window.location.pathname)),
      {
        message: TEST_CALLIGRAPHY_E2E_MESSAGES.practiceRouteSelected
      }
    ).toContain(character);
  }

  drawingCanvas(): Locator {
    return this.page.getByTestId(TEST_CALLIGRAPHY_TEST_IDS.drawingCanvas);
  }

  async drawStroke(): Promise<void> {
    const box = await this.drawingCanvas().boundingBox();

    if (!box) {
      throw new Error("The drawing canvas is not visible.");
    }

    const startX = box.x + box.width * TEST_CALLIGRAPHY_STROKE_PATH.startRatio;
    const startY = box.y + box.height * TEST_CALLIGRAPHY_STROKE_PATH.startRatio;
    const endX = box.x + box.width * TEST_CALLIGRAPHY_STROKE_PATH.endRatio;
    const endY = box.y + box.height * TEST_CALLIGRAPHY_STROKE_PATH.endRatio;

    await this.dispatchDrawingPointerEvent("pointerdown", startX, startY, TEST_CALLIGRAPHY_STROKE_PATH.pressedButtons);
    await this.dispatchDrawingPointerEvent("pointermove", endX, endY, TEST_CALLIGRAPHY_STROKE_PATH.pressedButtons);
    await this.dispatchDrawingPointerEvent("pointerup", endX, endY, TEST_CALLIGRAPHY_STROKE_PATH.releasedButtons);
  }

  async hasVisibleStroke(): Promise<boolean> {
    return (await this.page
      .getByTestId(TEST_CALLIGRAPHY_TEST_IDS.drawingStrokesView)
      .locator("path")
      .count()) > 0;
  }

  private async dispatchDrawingPointerEvent(
    eventName: "pointerdown" | "pointermove" | "pointerup",
    clientX: number,
    clientY: number,
    buttons: number
  ): Promise<void> {
    await this.drawingCanvas().dispatchEvent(eventName, {
      bubbles: true,
      buttons,
      clientX,
      clientY,
      isPrimary: true,
      pointerId: TEST_CALLIGRAPHY_STROKE_PATH.pointerId,
      pointerType: TEST_CALLIGRAPHY_STROKE_PATH.pointerType
    });
  }

  async startPracticeFromDefaultCategory(): Promise<string> {
    await this.gotoHome();
    await this.selectGrouping(TEST_CALLIGRAPHY_JLPT_GROUPING);
    await this.openCategory(TEST_CALLIGRAPHY_CATEGORY_ID);
    return this.openFirstVisiblePractice();
  }

  async evaluateDrawnAttempt(): Promise<string> {
    const character = await this.startPracticeFromDefaultCategory();
    await this.drawStroke();
    await expect.poll(
      () => this.hasVisibleStroke(),
      {
        message: TEST_CALLIGRAPHY_E2E_MESSAGES.strokeVisible
      }
    ).toBe(true);
    await expect(
      this.page.getByTestId(TEST_CALLIGRAPHY_TEST_IDS.validateButton),
      TEST_CALLIGRAPHY_E2E_MESSAGES.validateEnabled
    ).toBeEnabled();
    await this.page.getByTestId(TEST_CALLIGRAPHY_TEST_IDS.validateButton).click();
    await expect(
      this.page.getByTestId(TEST_CALLIGRAPHY_TEST_IDS.evaluationOverlay),
      TEST_CALLIGRAPHY_E2E_MESSAGES.evaluationOverlayVisible
    ).toBeVisible();

    return character;
  }
}
