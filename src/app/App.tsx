import { useCallback, useEffect, useMemo, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { MenuPage } from '@/pages/MenuPage'
import { GuidePage } from '@/pages/GuidePage'
import { ViewerV2Page } from '@/components/viewer-v2/ViewerV2Page'
import { applyThemeSelectionToDocument, resolveThemeMode } from '@/lib/themeMode'
import { resolveEffectiveLocale } from '@/lib/i18n'
import { readNativeAppVersion, readNativeStarterSettings, saveNativeStarterSettings } from './nativeSettings'
import { StarterSettingsContext } from './StarterSettingsContext'
import { readStarterSettings, writeStarterSettings, type StarterSettings } from './settingsStorage'

export function StarterApp() {
  const [settings, setSettings] = useState(() => readStarterSettings())
  const [appVersion, setAppVersion] = useState<string | null>(null)
  const resolvedThemeMode = resolveThemeMode(settings.themeMode)
  const locale = resolveEffectiveLocale(settings.uiLanguage)

  const updateSettings = useCallback((patch: Partial<StarterSettings>) => {
    setSettings((current) => {
      const next = { ...current, ...patch }
      writeStarterSettings(window.localStorage, next)
      void saveNativeStarterSettings(next)
      return next
    })
  }, [])

  useEffect(() => {
    let cancelled = false

    async function hydrateNativeState() {
      const [nativeSettings, nativeVersion] = await Promise.all([
        readNativeStarterSettings(),
        readNativeAppVersion(),
      ])

      if (cancelled) return
      if (nativeVersion) setAppVersion(nativeVersion)
      if (!nativeSettings) return

      setSettings((current) => {
        const next = { ...current, ...nativeSettings }
        writeStarterSettings(window.localStorage, next)
        return next
      })
    }

    void hydrateNativeState()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    applyThemeSelectionToDocument(document, settings.themeMode)
  }, [settings.themeMode])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const contextValue = useMemo(() => ({
    appVersion,
    locale,
    resolvedThemeMode,
    settings,
    updateSettings,
  }), [appVersion, locale, resolvedThemeMode, settings, updateSettings])

  return (
    <StarterSettingsContext.Provider value={contextValue}>
      <Routes>
        <Route path="/" element={<MenuPage />} />
        <Route path="/viewer" element={<ViewerV2Page />} />
        <Route path="/guide" element={<GuidePage />} />
      </Routes>
    </StarterSettingsContext.Provider>
  )
}

export default StarterApp
