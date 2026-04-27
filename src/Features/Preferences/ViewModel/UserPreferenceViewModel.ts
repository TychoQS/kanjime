import type { UserPreferenceInterface } from "../Contracts/UserPreferenceInterface";
import type { CreateUserPreferenceControllerDependencies } from "../CreateUserPreferenceController";
import type { ApplicationTheme } from "../../../Shared/DomainTypes";
import type { SupportedLocale } from "../../../Shared/I18n";

const SUPPORTED_LANGUAGES = new Set([
  "en-US",
  "en-GB",
  "es-ES",
  "fr-FR",
  "de-DE",
  "it-IT",
  "pt-PT",
  "zh-CN",
  "ja-JP",
  "ko-KR",
  "ar-EG",
  "sw-KE"
]);

/**
 * Checks whether a theme value is supported.
 *
 * @pre Theme may originate from UI or persisted preferences.
 * @post The returned value is true only for supported theme modes.
 */
function isApplicationTheme(theme: string): theme is ApplicationTheme {
  return theme === "light" || theme === "dark" || theme === "system";
}

/**
 * Creates the user-preference view model.
 *
 * @pre Language and theme application dependencies are available.
 * @inv Functional application state is not modified by preference changes.
 * @post The returned controller exposes the current preference snapshot.
 */
export function createUserPreferenceViewModel(
  dependencies: CreateUserPreferenceControllerDependencies
): UserPreferenceInterface {
  let language = "en-US";
  let theme: ApplicationTheme = "system";

  return {
    setLanguage(nextLanguage: string): void {
      if (!SUPPORTED_LANGUAGES.has(nextLanguage)) {
        throw new Error("UserPreferenceInterface accepted an empty language.");
      }

      language = nextLanguage;
      void dependencies.applyLanguage(nextLanguage);
    },
    setTheme(nextTheme: ApplicationTheme): void {
      if (!isApplicationTheme(nextTheme)) {
        throw new Error("UserPreferenceInterface accepted an invalid theme.");
      }

      theme = nextTheme;
      void dependencies.applyTheme(nextTheme);
    },
    getCurrentPreferences(): { language: SupportedLocale; theme: ApplicationTheme } {
      return {
        language: language as SupportedLocale,
        theme
      };
    }
  };
}
