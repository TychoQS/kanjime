import { useEffect, useState } from "react";

import type { ApplicationPreferences, CompositionRoot } from "../../../CompositionRoot";
import type { UserPreferenceInterface } from "../Contracts/UserPreferenceInterface";
import type { CreateUserPreferenceControllerDependencies } from "../CreateUserPreferenceController";
import type { ApplicationTheme } from "@kanjime/shared";
import { SUPPORTED_LOCALES, type SupportedLocale } from "../../../Shared/I18n";
import { PreferenceError } from "@kanjime/shared";

const SUPPORTED_LANGUAGES = new Set<string>(SUPPORTED_LOCALES);

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

    void root.initialize()
      .then(nextPreferences => {
        if (isMounted) {
          setPreferences(nextPreferences);
          setIsReady(true);
        }
      })
      .catch(error => {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        void root.captureUnexpectedError(errorObj);

        if (isMounted) {
          setPreferences(DEFAULT_PREFERENCES);
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
      try {
        root.userPreferenceController.setLanguage(language);
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        void root.captureUnexpectedError(errorObj);
      }
    },
    setTheme(theme: ApplicationTheme): void {
      try {
        root.userPreferenceController.setTheme(theme);
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        void root.captureUnexpectedError(errorObj);
      }
    }
  };
}
