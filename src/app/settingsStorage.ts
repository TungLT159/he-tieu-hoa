import { normalizeThemeMode, type ThemeMode } from '@/lib/themeMode'
import {
  DEFAULT_UI_LANGUAGE,
  normalizeUiLanguagePreference,
  type UiLanguagePreference,
} from '@/lib/i18n'
import {
  DEFAULT_NARRATION_VOICE,
  normalizeNarrationVoice,
  type NarrationVoice,
} from '@/lib/narrationVoice'

export interface StarterSettings {
  themeMode: ThemeMode
  uiLanguage: UiLanguagePreference
  narrationVoice: NarrationVoice
  notificationsEnabled: boolean
  profileDisplayName: string
}

export const STARTER_SETTINGS_STORAGE_KEY = 'starter-tauri-app-settings'

export const DEFAULT_STARTER_SETTINGS: StarterSettings = {
  themeMode: 'system',
  uiLanguage: DEFAULT_UI_LANGUAGE,
  narrationVoice: DEFAULT_NARRATION_VOICE,
  notificationsEnabled: false,
  profileDisplayName: '',
}

function normalizeBoolean(value: unknown): boolean {
  return typeof value === 'boolean' ? value : false
}

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

export function normalizeStarterSettings(value: unknown): StarterSettings {
  if (!value || typeof value !== 'object') return DEFAULT_STARTER_SETTINGS
  const record = value as Record<string, unknown>

  return {
    themeMode: normalizeThemeMode(record.themeMode) ?? DEFAULT_STARTER_SETTINGS.themeMode,
    uiLanguage: normalizeUiLanguagePreference(record.uiLanguage) ?? DEFAULT_STARTER_SETTINGS.uiLanguage,
    narrationVoice: normalizeNarrationVoice(record.narrationVoice) ?? DEFAULT_STARTER_SETTINGS.narrationVoice,
    notificationsEnabled: normalizeBoolean(record.notificationsEnabled),
    profileDisplayName: normalizeString(record.profileDisplayName),
  }
}

export function readStarterSettings(storage: Pick<Storage, 'getItem'> = window.localStorage): StarterSettings {
  try {
    const raw = storage.getItem(STARTER_SETTINGS_STORAGE_KEY)
    return raw ? normalizeStarterSettings(JSON.parse(raw)) : DEFAULT_STARTER_SETTINGS
  } catch {
    return DEFAULT_STARTER_SETTINGS
  }
}

export function writeStarterSettings(
  storage: Pick<Storage, 'setItem'> = window.localStorage,
  settings: StarterSettings,
): void {
  storage.setItem(STARTER_SETTINGS_STORAGE_KEY, JSON.stringify(settings))
}
