import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { StarterSettings } from './settingsStorage'

const invoke = vi.fn()

vi.mock('@tauri-apps/api/core', () => ({ invoke }))

describe('native starter settings bridge', () => {
  beforeEach(() => {
    invoke.mockReset()
  })

  it('reads native starter settings into the frontend settings shape', async () => {
    invoke.mockResolvedValueOnce({
      theme_mode: 'dark',
      ui_language: 'vi',
      narration_voice: 'trung',
      notifications_enabled: true,
      profile_display_name: 'Native User',
    })
    const { readNativeStarterSettings } = await import('./nativeSettings')

    await expect(readNativeStarterSettings()).resolves.toEqual({
      themeMode: 'dark',
      uiLanguage: 'vi',
      narrationVoice: 'trung',
      notificationsEnabled: true,
      profileDisplayName: 'Native User',
    })
    expect(invoke).toHaveBeenCalledWith('get_settings')
  })

  it('saves frontend starter settings through native command arguments', async () => {
    invoke.mockResolvedValueOnce(null)
    const settings: StarterSettings = {
      themeMode: 'system',
      uiLanguage: 'en',
      narrationVoice: 'nam',
      notificationsEnabled: false,
      profileDisplayName: 'Browser User',
    }
    const { saveNativeStarterSettings } = await import('./nativeSettings')

    await saveNativeStarterSettings(settings)

    expect(invoke).toHaveBeenCalledWith('save_settings', {
      settings: {
        theme_mode: 'system',
        ui_language: 'en',
        narration_voice: 'nam',
        notifications_enabled: false,
        profile_display_name: 'Browser User',
      },
    })
  })

  it('returns null when native settings and version commands are unavailable', async () => {
    invoke.mockRejectedValue(new Error('not running in Tauri'))
    const { readNativeAppVersion, readNativeStarterSettings } = await import('./nativeSettings')

    await expect(readNativeStarterSettings()).resolves.toBeNull()
    await expect(readNativeAppVersion()).resolves.toBeNull()
  })
})
