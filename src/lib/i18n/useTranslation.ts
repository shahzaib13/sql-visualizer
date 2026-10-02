"use client";

import { useAppStore } from "@/store/useAppStore";
import { TRANSLATIONS, type Locale, type TranslationDictionary } from "./translations";

export function useTranslation(): {
  locale: Locale;
  t: TranslationDictionary;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
} {
  const locale = useAppStore((s) => s.locale);
  const setLocale = useAppStore((s) => s.setLocale);
  const toggleLocale = useAppStore((s) => s.toggleLocale);

  return {
    locale,
    t: TRANSLATIONS[locale] || TRANSLATIONS.en,
    setLocale,
    toggleLocale,
  };
}
