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
      notificationsEnabled: true,
      profileDisplayName: 'Starter User',
    })

    expect(readStarterSettings(storage)).toEqual({
      themeMode: 'dark',
      uiLanguage: 'vi',
      notificationsEnabled: true,
      profileDisplayName: 'Starter User',
    })
  })
})
