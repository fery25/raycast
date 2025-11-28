import { environment, getPreferenceValues } from "@raycast/api";
import { en, Translations } from "./en";
import { cs } from "./cs";

const translations: Record<string, Translations> = {
  en,
  cs,
};

function getLocale(): string {
  // Try to get language from Raycast preferences first
  const prefs = getPreferenceValues();
  if (typeof prefs.language === "string" && translations[prefs.language]) {
    return prefs.language;
  }

  // Fallback to Raycast environment locale
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raycastLocale = (environment as any).locale as string | undefined;
  if (!raycastLocale) {
    return "en";
  }
  const languageCode = raycastLocale.split(/[-_]/)[0].toLowerCase();
  return translations[languageCode] ? languageCode : "en";
}

let currentLocale = getLocale();
let currentTranslations = translations[currentLocale];

export function t(): Translations {
  return currentTranslations;
}

export function setLocale(locale: string): void {
  if (translations[locale]) {
    currentLocale = locale;
    currentTranslations = translations[locale];
  }
}

export function getCurrentLocale(): string {
  return currentLocale;
}

export type { Translations };
