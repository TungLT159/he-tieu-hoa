import EN_TRANSLATIONS from './locales/en.json'
import VI_TRANSLATIONS from './locales/vi.json'

export const DEFAULT_APP_LOCALE = 'en'
export const SYSTEM_UI_LANGUAGE = 'system'
export const DEFAULT_UI_LANGUAGE = SYSTEM_UI_LANGUAGE
export const APP_LOCALES = ['en', 'vi'] as const

export type AppLocale = typeof APP_LOCALES[number]
export type UiLanguagePreference = typeof SYSTEM_UI_LANGUAGE | AppLocale
export type TranslationCatalog = typeof EN_TRANSLATIONS
export type TranslationKey = keyof TranslationCatalog
export type TranslationValues = Record<string, string | number>

const TRANSLATIONS: Record<AppLocale, Partial<TranslationCatalog>> = {
  en: EN_TRANSLATIONS,
  vi: VI_TRANSLATIONS,
}

const APP_LOCALE_SET = new Set<AppLocale>(APP_LOCALES)

function interpolate(template: string, values: TranslationValues = {}): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = values[key]
    return value === undefined ? match : String(value)
  })
}

export function isAppLocale(value: unknown): value is AppLocale {
  return typeof value === 'string' && APP_LOCALE_SET.has(value as AppLocale)
}

export function normalizeUiLanguagePreference(value: unknown): UiLanguagePreference | null {
  if (value === SYSTEM_UI_LANGUAGE) return SYSTEM_UI_LANGUAGE
  return isAppLocale(value) ? value : null
}

export function getBrowserLanguagePreferences(): string[] {
  if (typeof navigator === 'undefined') return []
  return Array.from(navigator.languages?.length ? navigator.languages : [navigator.language])
    .filter((language): language is string => typeof language === 'string' && language.length > 0)
}

export function resolveEffectiveLocale(
  preference: UiLanguagePreference | null | undefined,
  languages: readonly string[] = getBrowserLanguagePreferences(),
): AppLocale {
  if (isAppLocale(preference)) return preference

  for (const language of languages) {
    const normalized = language.toLowerCase()
    if (normalized === 'vi' || normalized.startsWith('vi-')) return 'vi'
    if (normalized === 'en' || normalized.startsWith('en-')) return 'en'
  }

  return DEFAULT_APP_LOCALE
}

export function translate(
  locale: AppLocale,
  key: TranslationKey,
  values?: TranslationValues,
): string {
  const translated = TRANSLATIONS[locale][key] ?? EN_TRANSLATIONS[key]
  return interpolate(translated, values)
}

export function createTranslator(locale: AppLocale) {
  return (key: TranslationKey, values?: TranslationValues) => translate(locale, key, values)
}
