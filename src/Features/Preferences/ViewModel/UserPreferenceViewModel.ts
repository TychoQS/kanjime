import { useEffect, useState } from "react";

import type { ApplicationPreferences, CompositionRoot } from "../../../CompositionRoot";
import type { UserPreferenceInterface } from "../Contracts/UserPreferenceInterface";
import type { CreateUserPreferenceControllerDependencies } from "../CreateUserPreferenceController";
import type { ApplicationTheme } from "../../../Shared/DomainTypes";
import type { SupportedLocale } from "../../../Shared/I18n";
import { PreferenceError } from "../../../Shared/AppErrors";

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

const DEFAULT_PREFERENCES: ApplicationPreferences = {
  language: "en-US",
  theme: "system"
};

export interface UserPreferenceAppViewModel {
  readonly preferences: ApplicationPreferences;
  readonly isReady: boolean;
  setLanguage(language: SupportedLocale): void;
  setTheme(theme: ApplicationTheme): void;
}

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
        throw new PreferenceError("UserPreferenceInterface accepted an empty language.");
      }

      language = nextLanguage;
      void dependencies.applyLanguage(nextLanguage);
    },
    setTheme(nextTheme: ApplicationTheme): void {
      if (!isApplicationTheme(nextTheme)) {
        throw new PreferenceError("UserPreferenceInterface accepted an invalid theme.");
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

/**
 * Creates the application bootstrap and preference hook view model.
 *
 * @pre The composition root can initialize persistence and notify preference changes.
 * @inv Preference changes never bypass the existing preference controller.
 * @post The returned state exposes the current preferences together with the startup readiness flag.
 */
export function useUserPreferenceAppViewModel(root: CompositionRoot): UserPreferenceAppViewModel {
  const [preferences, setPreferences] = useState<ApplicationPreferences>(DEFAULT_PREFERENCES);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    root.registerPreferenceDelegate(nextPreferences => {
      if (isMounted) {
        setPreferences(nextPreferences);
      }
    });

    void root.initialize().then(nextPreferences => {
      if (isMounted) {
        setPreferences(nextPreferences);
        setIsReady(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [root]);

  return {
    preferences,
    isReady,
    setLanguage(language: SupportedLocale): void {
      root.userPreferenceController.setLanguage(language);
    },
    setTheme(theme: ApplicationTheme): void {
      root.userPreferenceController.setTheme(theme);
    }
  };
}
