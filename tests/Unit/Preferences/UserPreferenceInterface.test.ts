import { describe, expect, it } from "vitest";

import { CreateUserPreferenceController } from "../../../src/Features/Preferences/CreateUserPreferenceController";
import { createVoidArgumentRecorder } from "../../Support/DependencyFactories";
import { TEST_LANGUAGE, TEST_THEME } from "../../Support/TestData";
import { buildRequirementTitle } from "../../Support/RequirementTest";

describe("UserPreferenceInterface", () => {
  /**
   * Requirement: R37
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R37", "Unit", "Postcondition", "updates the application language"), () => {
    const languageRecorder = createVoidArgumentRecorder<string>();
    const themeRecorder = createVoidArgumentRecorder<"light" | "dark" | "system">();
    const controller = CreateUserPreferenceController({
      applyLanguage: languageRecorder.handler,
      applyTheme: themeRecorder.handler
    });

    controller.setLanguage(TEST_LANGUAGE);

    expect(languageRecorder.calls).toEqual([TEST_LANGUAGE], "UserPreferenceInterface did not apply the selected language.");
    expect(controller.getCurrentPreferences().language).toBe(
      TEST_LANGUAGE,
      "UserPreferenceInterface returned an unexpected current language."
    );
  });

  /**
   * Requirement: R38
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R38", "Unit", "Postcondition", "updates the visual theme"), () => {
    const languageRecorder = createVoidArgumentRecorder<string>();
    const themeRecorder = createVoidArgumentRecorder<"light" | "dark" | "system">();
    const controller = CreateUserPreferenceController({
      applyLanguage: languageRecorder.handler,
      applyTheme: themeRecorder.handler
    });

    controller.setTheme(TEST_THEME);

    expect(themeRecorder.calls).toEqual([TEST_THEME], "UserPreferenceInterface did not apply the selected theme.");
    expect(controller.getCurrentPreferences().theme).toBe(
      TEST_THEME,
      "UserPreferenceInterface returned an unexpected active theme."
    );
  });
});
