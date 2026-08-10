import { createContext, useContext } from 'react'
import type { AppLocale } from '@/lib/i18n'
import type { ResolvedThemeMode } from '@/lib/themeMode'
import type { StarterSettings } from './settingsStorage'

export interface StarterSettingsContextValue {
  locale: AppLocale
  appVersion: string | null
  resolvedThemeMode: ResolvedThemeMode
  settings: StarterSettings
  updateSettings: (patch: Partial<StarterSettings>) => void
}

export const StarterSettingsContext = createContext<StarterSettingsContextValue | null>(null)

export function useStarterSettings(): StarterSettingsContextValue {
  const value = useContext(StarterSettingsContext)
  if (!value) throw new Error('useStarterSettings must be used inside StarterApp')
  return value
}
