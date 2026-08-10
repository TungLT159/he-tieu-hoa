import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { StarterSettingsContext } from '@/app/StarterSettingsContext'
import type { StarterSettingsContextValue } from '@/app/StarterSettingsContext'
import type { StarterSettings } from '@/app/settingsStorage'
import type { AppLocale } from '@/lib/i18n'

import { ViewerProvider } from '../ViewerContext.tsx'
import { ViewerSettings } from '../ViewerSettings'
import { useViewer } from '../viewerContext'

function createMockSettingsContext(
  overrides: Partial<StarterSettingsContextValue> = {},
): StarterSettingsContextValue {
  return {
    locale: 'vi' as AppLocale,
    appVersion: '1.0.0',
    resolvedThemeMode: 'dark',
    settings: {
      themeMode: 'dark',
      uiLanguage: 'vi',
      profileDisplayName: 'Test',
      notificationsEnabled: false,
    } as StarterSettings,
    updateSettings: vi.fn(),
    ...overrides,
  }
}

function SettingsTrigger() {
  const { setActiveSheet, setBackgroundColor, setModelColor } = useViewer()

  return (
    <>
      <button type="button" onClick={() => setActiveSheet('settings')}>
        Open settings
      </button>
      <button
        type="button"
        onClick={() => {
          setBackgroundColor('#ffffff')
          setModelColor('#ff0000')
        }}
      >
        Change colors
      </button>
    </>
  )
}

function ViewerColorProbe() {
  const { backgroundColor, modelColor } = useViewer()

  return (
    <output aria-label="viewer colors">
      {backgroundColor}:{modelColor ?? 'none'}
    </output>
  )
}

function renderSettings(contextOverrides: Partial<StarterSettingsContextValue> = {}) {
  const settingsContext = createMockSettingsContext(contextOverrides)

  return {
    settingsContext,
    ...render(
      <StarterSettingsContext.Provider value={settingsContext}>
        <ViewerProvider>
          <SettingsTrigger />
          <ViewerSettings />
          <ViewerColorProbe />
        </ViewerProvider>
      </StarterSettingsContext.Provider>,
    ),
  }
}

describe('ViewerSettings', () => {
  it('opens from active sheet state and closes by clearing it', () => {
    renderSettings()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Open settings' }))
    expect(screen.getByRole('heading', { name: 'Cài đặt' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Đóng' })).toBeInTheDocument()

    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('updates persisted starter settings for theme and language', () => {
    const updateSettings = vi.fn()
    renderSettings({ updateSettings })

    fireEvent.click(screen.getByRole('button', { name: 'Open settings' }))
    fireEvent.click(screen.getByRole('combobox', { name: 'Chủ đề' }))
    fireEvent.click(screen.getByRole('option', { name: 'Sáng' }))
    fireEvent.click(screen.getByRole('combobox', { name: 'Ngôn ngữ' }))
    fireEvent.click(screen.getByRole('option', { name: 'Tiếng Anh' }))

    expect(updateSettings).toHaveBeenCalledWith({ themeMode: 'light' })
    expect(updateSettings).toHaveBeenCalledWith({ uiLanguage: 'en' })
  })

  it('keeps placeholder controls local and resets viewer colors', () => {
    renderSettings()

    fireEvent.click(screen.getByRole('button', { name: 'Change colors' }))
    expect(screen.getByLabelText('viewer colors')).toHaveTextContent('#ffffff:#ff0000')

    fireEvent.click(screen.getByRole('button', { name: 'Open settings' }))
    fireEvent.click(screen.getByRole('switch', { name: 'Đổ bóng' }))
    fireEvent.click(screen.getByRole('radio', { name: 'Nam' }))
    fireEvent.click(screen.getByRole('button', { name: 'Khôi phục màu mặc định' }))

    expect(screen.getByRole('switch', { name: 'Đổ bóng' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Nam' })).toBeChecked()
    expect(screen.getByLabelText('viewer colors')).toHaveTextContent('#1a1a2e:none')
  })
})
