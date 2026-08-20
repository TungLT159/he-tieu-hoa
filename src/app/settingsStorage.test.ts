import { describe, expect, it } from 'vitest'
import { createMemoryStorage } from '@/test/testStorage'
import {
  DEFAULT_STARTER_SETTINGS,
  readStarterSettings,
  writeStarterSettings,
} from './settingsStorage'

describe('starter settings storage', () => {
  it('returns defaults when storage is empty', () => {
    expect(readStarterSettings(createMemoryStorage())).toEqual(DEFAULT_STARTER_SETTINGS)
  })

  it('persists only starter settings fields', () => {
    const storage = createMemoryStorage()

    writeStarterSettings(storage, {
      themeMode: 'dark',
      uiLanguage: 'vi',
      narrationVoice: 'nam',
      notificationsEnabled: true,
      profileDisplayName: 'Starter User',
    })

    expect(readStarterSettings(storage)).toEqual({
      themeMode: 'dark',
      uiLanguage: 'vi',
      narrationVoice: 'nam',
      notificationsEnabled: true,
      profileDisplayName: 'Starter User',
    })
  })

  it('normalizes invalid narration voice to the default', () => {
    const storage = createMemoryStorage()
    storage.setItem('starter-tauri-app-settings', JSON.stringify({
      themeMode: 'dark',
      uiLanguage: 'vi',
      narrationVoice: 'mien',
    }))

    expect(readStarterSettings(storage).narrationVoice).toBe(DEFAULT_STARTER_SETTINGS.narrationVoice)
  })
})
