import { normalizeUiLanguagePreference } from '@/lib/i18n'
import { normalizeThemeMode } from '@/lib/themeMode'
import type { StarterSettings } from './settingsStorage'

type NativeSettings = {
  theme_mode?: unknown
  ui_language?: unknown
  notifications_enabled?: unknown
  profile_display_name?: unknown
}

type TauriCore = {
  invoke: <T>(command: string, args?: Record<string, unknown>) => Promise<T>
}

async function loadTauriCore(): Promise<TauriCore | null> {
  try {
    return await import('@tauri-apps/api/core')
  } catch {
    return null
  }
}

function toNativeSettings(settings: StarterSettings): NativeSettings {
  return {
    theme_mode: settings.themeMode,
    ui_language: settings.uiLanguage,
    notifications_enabled: settings.notificationsEnabled,
    profile_display_name: settings.profileDisplayName,
  }
}

function fromNativeSettings(settings: NativeSettings): Partial<StarterSettings> {
  const themeMode = normalizeThemeMode(settings.theme_mode)
  const uiLanguage = normalizeUiLanguagePreference(settings.ui_language)
  const notificationsEnabled = typeof settings.notifications_enabled === 'boolean'
    ? settings.notifications_enabled
    : undefined
  const profileDisplayName = typeof settings.profile_display_name === 'string'
    ? settings.profile_display_name
    : undefined

  return {
    ...(themeMode ? { themeMode } : {}),
    ...(uiLanguage ? { uiLanguage } : {}),
    ...(notificationsEnabled !== undefined ? { notificationsEnabled } : {}),
    ...(profileDisplayName !== undefined ? { profileDisplayName } : {}),
  }
}

export async function readNativeStarterSettings(): Promise<Partial<StarterSettings> | null> {
  const core = await loadTauriCore()
  if (!core) return null

  try {
    const settings = await core.invoke<NativeSettings>('get_settings')
    return fromNativeSettings(settings)
  } catch {
    return null
  }
}

export async function saveNativeStarterSettings(settings: StarterSettings): Promise<void> {
  const core = await loadTauriCore()
  if (!core) return

  try {
    await core.invoke('save_settings', { settings: toNativeSettings(settings) })
  } catch {
    // Browser dev and unsupported native contexts keep using localStorage.
  }
}

export async function readNativeAppVersion(): Promise<string | null> {
  const core = await loadTauriCore()
  if (!core) return null

  try {
    const version = await core.invoke<string>('get_app_version')
    return typeof version === 'string' && version.trim() ? version.trim() : null
  } catch {
    return null
  }
}
