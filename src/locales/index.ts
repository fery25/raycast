import { environment } from "@raycast/api";
import { en, Translations } from "./en";
import { cs } from "./cs";

const translations: Record<string, Translations> = {
  en,
  cs,
};

function getLocale(): string {
  // Try to get locale from Raycast environment
  // Note: environment.locale may not be available in all Raycast versions
  const raycastLocale = (environment as any).locale as string | undefined;
  
  // If locale is not available, default to English
  if (!raycastLocale) {
    return "en";
  }
  
  // Extract language code (e.g., "cs-CZ" -> "cs", "en_US" -> "en")
  const languageCode = raycastLocale.split(/[-_]/)[0].toLowerCase();
  
  // Return language code if we have translations for it, otherwise default to English
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
