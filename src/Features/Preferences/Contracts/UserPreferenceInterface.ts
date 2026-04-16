/**
 * Contract for user preference updates.
 *
 * @inv Updating language or theme never mutates the functional state of the application.
 */
export interface UserPreferenceInterface {
  /**
   * Updates the active application language.
   *
   * Requirement IDs: R37.
   *
   * @pre A valid language different from the current one has been selected.
   * @post The application language is updated while preserving the functional state.
   */
  setLanguage(language: string): void;

  /**
   * Updates the active visual theme.
   *
   * Requirement IDs: R38.
   *
   * @pre A valid theme has been selected and the device theme is accessible when required.
   * @post The active visual theme is updated while preserving the functional state.
   */
  setTheme(theme: "light" | "dark" | "system"): void;

  /**
   * Returns the current persisted user preferences.
   *
   * @post The returned preferences reflect the language and theme currently applied by the application.
   */
  getCurrentPreferences(): {
    language: string;
    theme: "light" | "dark" | "system";
  };
}
