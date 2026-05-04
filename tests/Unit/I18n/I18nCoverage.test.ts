import { describe, expect, it } from "vitest";
import {
  ENGLISH_TRANSLATIONS,
  SUPPORTED_LOCALES,
  TRANSLATIONS,
  TRANSLATION_KEYS,
  translate
} from "../../../src/Shared/I18n";

describe("i18n locale coverage", () => {
  it("defines every translation key for every supported locale", () => {
    for (const locale of SUPPORTED_LOCALES) {
      expect(Object.keys(TRANSLATIONS[locale]).sort()).toEqual([...TRANSLATION_KEYS].sort());
      expect(Object.keys(TRANSLATIONS[locale])).toHaveLength(TRANSLATION_KEYS.length);

      for (const key of TRANSLATION_KEYS) {
        expect(translate(locale, key).trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("preserves the model detail interpolation placeholder in every locale", () => {
    for (const locale of SUPPORTED_LOCALES) {
      expect(TRANSLATIONS[locale].modelDetail).toContain("{{count}}");
    }
  });

  it("falls back to English for unsupported locale strings", () => {
    expect(translate("unsupported-locale", "about")).toBe(ENGLISH_TRANSLATIONS.about);
  });
});
