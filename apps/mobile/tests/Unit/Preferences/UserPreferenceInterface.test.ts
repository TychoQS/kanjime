import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";

import { CreateUserPreferenceController } from "../../../src/Features/Preferences/CreateUserPreferenceController";
import { createVoidArgumentRecorder } from "../../Support/DependencyFactories";
import { TEST_LANGUAGE, TEST_THEME } from "../../Support/TestData";
import { buildRequirementTitle } from "../../Support/RequirementTest";

describe("UserPreferenceInterface", () => {
  /**
 * Requirement: R37
 * Type: Unit
 * Condition: Precondition - valid
 */
  it(buildRequirementTitle("R37", "Unit", "Precondition", "accepts a valid non-empty language"), () => {
    const languageRecorder = createVoidArgumentRecorder<string>();
    const themeRecorder = createVoidArgumentRecorder<"light" | "dark" | "system">();
    const controller = CreateUserPreferenceController({
      applyLanguage: languageRecorder.handler,
      applyTheme: themeRecorder.handler
    });

    expect(() => controller.setLanguage(TEST_LANGUAGE)).not.toThrow(
      "UserPreferenceInterface rejected a valid language."
    );
  });

  /**
   * Requirement: R37
   * Type: Unit
   * Condition: Precondition - invalid
   */
  it(buildRequirementTitle("R37", "Unit", "Precondition", "rejects an empty language"), () => {
    const languageRecorder = createVoidArgumentRecorder<string>();
    const themeRecorder = createVoidArgumentRecorder<"light" | "dark" | "system">();
    const controller = CreateUserPreferenceController({
      applyLanguage: languageRecorder.handler,
      applyTheme: themeRecorder.handler
    });

    expect(() => controller.setLanguage("")).toThrow(
      "UserPreferenceInterface accepted an empty language."
    );
  });

  /**
 * Requirement: R37
 * Type: Unit
 * Condition: Invariant
 */
  it(buildRequirementTitle("R37", "Unit", "Invariant", "setting language does not trigger theme updates"), () => {
    const languageRecorder = createVoidArgumentRecorder<string>();
    const themeRecorder = createVoidArgumentRecorder<"light" | "dark" | "system">();
    const controller = CreateUserPreferenceController({
      applyLanguage: languageRecorder.handler,
      applyTheme: themeRecorder.handler
    });

    controller.setLanguage(TEST_LANGUAGE);

    expect(themeRecorder.calls).toHaveLength(0,
      "UserPreferenceInterface incorrectly updated the theme while changing language."
    );
  });


  /**
   * Requirement: R37
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R37", "Unit", "Postcondition", "updates the application language"), () => {
    const languageRecorder = createVoidArgumentRecorder<string>();
    const themeRecorder = createVoidArgumentRecorder<"light" | "dark" | "system">();
    const controller = CreateUserPreferenceController({
      applyLanguage: languageRecorder.handler,
      applyTheme: themeRecorder.handler
    });

    controller.setLanguage(TEST_LANGUAGE);

    expect(languageRecorder.calls).toEqual([TEST_LANGUAGE],
      "UserPreferenceInterface did not apply the selected language."
    );
    expect(controller.getCurrentPreferences().language).toBe(TEST_LANGUAGE,
      "UserPreferenceInterface returned an unexpected current language."
    );
  });

  /**
   * Requirement: R38
   * Type: Unit
   * Condition: Precondition - valid
   */
  it(buildRequirementTitle("R38", "Unit", "Precondition", "accepts a valid theme"), () => {
    const languageRecorder = createVoidArgumentRecorder<string>();
    const themeRecorder = createVoidArgumentRecorder<"light" | "dark" | "system">();
    const controller = CreateUserPreferenceController({
      applyLanguage: languageRecorder.handler,
      applyTheme: themeRecorder.handler
    });

    expect(() => controller.setTheme(TEST_THEME)).not.toThrow(
      "UserPreferenceInterface rejected a valid theme."
    );
  });

  /**
   * Requirement: R38
   * Type: Unit
   * Condition: Precondition - invalid
   */
  it(buildRequirementTitle("R38", "Unit", "Precondition", "rejects an invalid theme"), () => {
    const languageRecorder = createVoidArgumentRecorder<string>();
    const themeRecorder = createVoidArgumentRecorder<"light" | "dark" | "system">();
    const controller = CreateUserPreferenceController({
      applyLanguage: languageRecorder.handler,
      applyTheme: themeRecorder.handler
    });

    expect(() => controller.setTheme("invalid" as any)).toThrow(
      "UserPreferenceInterface accepted an invalid theme."
    );
  });

  /**
 * Requirement: R38
 * Type: Unit
 * Condition: Invariant
 */
  it(buildRequirementTitle("R38", "Unit", "Invariant", "setting theme does not trigger language updates"), () => {
    const languageRecorder = createVoidArgumentRecorder<string>();
    const themeRecorder = createVoidArgumentRecorder<"light" | "dark" | "system">();
    const controller = CreateUserPreferenceController({
      applyLanguage: languageRecorder.handler,
      applyTheme: themeRecorder.handler
    });

    controller.setTheme(TEST_THEME);

    expect(languageRecorder.calls).toHaveLength(0,
      "UserPreferenceInterface incorrectly updated the language while changing theme."
    );
  });


  /**
   * Requirement: R38
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R38", "Unit", "Postcondition", "updates the visual theme"), () => {
    const languageRecorder = createVoidArgumentRecorder<string>();
    const themeRecorder = createVoidArgumentRecorder<"light" | "dark" | "system">();
    const controller = CreateUserPreferenceController({
      applyLanguage: languageRecorder.handler,
      applyTheme: themeRecorder.handler
    });

    controller.setTheme(TEST_THEME);

    expect(themeRecorder.calls).toEqual([TEST_THEME],
      "UserPreferenceInterface did not apply the selected theme."
    );
    expect(controller.getCurrentPreferences().theme).toBe(TEST_THEME,
      "UserPreferenceInterface returned an unexpected active theme."
    );
  });
  /**
   * Requirement: R38
   * Type: Regression
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R38", "Regression", "Postcondition", "Regressión of ligth background on language selection in dark mode of Apple webkit"), () => {
    const currentDir = typeof __dirname !== "undefined" ? __dirname : dirname(fileURLToPath(import.meta.url));
    const cssPath = resolve(currentDir, "../../../src/Theme/Variables.css");
    const cssContent = readFileSync(cssPath, "utf-8");

    const expectedCSS = `html[data-theme="dark"] ion-action-sheet {
  --background: var(--ion-background-color);
  --button-background: var(--ion-background-color);
}`;

    expect(cssContent.replace(/\s+/g, " ")).toContain(expectedCSS.replace(/\s+/g, " "));
  });
});
