import React, { createContext, useContext } from "react";

import type { ApplicationTheme } from "../DomainTypes";
import type { SupportedLanguage, TranslationKey } from "./Translations";
import { translate } from "./Translations";

/**
 * Global language and theme state.
 *
 * @inv Text and theme values come from persisted user preferences.
 */
export interface I18nContextValue {
  /** @post Current supported language. */
  readonly language: SupportedLanguage;
  /** @post Current application theme. */
  readonly theme: ApplicationTheme;
  /** @post Changes the active language. */
  readonly setLanguage: (language: SupportedLanguage) => void;
  /** @post Changes the active theme. */
  readonly setTheme: (theme: ApplicationTheme) => void;
  /** @post Resolves localized text for the active language. */
  readonly t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * I18n provider.
 */
export const I18nProvider = I18nContext.Provider;

/**
 * Reads global i18n state.
 *
 * @returns I18n state.
 *
 * @post Localized text can be resolved by the caller.
 */
export function useI18n(): I18nContextValue {
  const value = useContext(I18nContext);

  if (value === null) {
    throw new Error("Language settings are not ready.");
  }

  return value;
}

/**
 * Creates a translation function.
 *
 * @param language Current language.
 * @returns Translation resolver.
 *
 * @post The resolver falls back to English for missing values.
 */
export function createTranslator(language: SupportedLanguage): (key: TranslationKey) => string {
  return key => translate(language, key);
}
