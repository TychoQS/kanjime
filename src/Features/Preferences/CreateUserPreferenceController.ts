import type { UserPreferenceInterface } from "./Contracts/UserPreferenceInterface";
import type { ApplicationTheme } from "../../Shared/DomainTypes";

/**
 * External collaborators consumed by the preference controller.
 */
export interface CreateUserPreferenceControllerDependencies {
  readonly applyLanguage: (language: string) => Promise<void> | void;
  readonly applyTheme: (theme: ApplicationTheme) => Promise<void> | void;
}

/**
 * Creates the preference controller stub used by the RED test suite.
 */
export function CreateUserPreferenceController(
  _dependencies: CreateUserPreferenceControllerDependencies
): UserPreferenceInterface {
  return {
    setLanguage(_language: string): void {},
    setTheme(_theme: ApplicationTheme): void {},
    getCurrentPreferences(): { language: string; theme: ApplicationTheme } {
      return {
        language: "en-US",
        theme: "system"
      };
    }
  };
}
