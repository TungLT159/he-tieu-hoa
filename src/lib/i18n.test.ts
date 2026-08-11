import { describe, expect, it } from 'vitest'
import {
  APP_LOCALES,
  createTranslator,
  normalizeUiLanguagePreference,
  resolveEffectiveLocale,
  translate,
} from './i18n'

describe('starter i18n', () => {
  it('supports only English and Vietnamese app locales', () => {
    expect(APP_LOCALES).toEqual(['en', 'vi'])
  })

  it('translates starter keys with interpolation', () => {
    expect(translate('en', 'app.welcome', { name: 'Mina' })).toBe('Welcome back, Mina')
    expect(translate('vi', 'app.welcome', { name: 'Mina' })).toBe('Chào mừng trở lại, Mina')
  })

  it('falls back to English when Vietnamese key is missing', () => {
    const t = createTranslator('vi')
    expect(t('app.name')).toBe('Phần mềm 3D Hệ tiêu hóa')
  })

  it('normalizes supported preferences and rejects old locales', () => {
    expect(normalizeUiLanguagePreference('system')).toBe('system')
    expect(normalizeUiLanguagePreference('vi')).toBe('vi')
    expect(normalizeUiLanguagePreference('fr-FR')).toBeNull()
  })

  it('resolves system languages to Vietnamese or English', () => {
    expect(resolveEffectiveLocale('system', ['vi-VN', 'en-US'])).toBe('vi')
    expect(resolveEffectiveLocale('system', ['de-DE'])).toBe('en')
  })
})
