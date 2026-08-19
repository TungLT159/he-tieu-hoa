import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { StarterSettingsContext } from '@/app/StarterSettingsContext'
import { DEFAULT_STARTER_SETTINGS } from '@/app/settingsStorage'
import { renderStarter } from '@/test/starterRender'
import { AppSettingsControls } from '../AppSettingsControls'

function renderControls(updateSettings = vi.fn()) {
  return renderStarter(
    <StarterSettingsContext.Provider
      value={{
        appVersion: '0.1.0',
        locale: 'en',
        resolvedThemeMode: 'light',
        settings: DEFAULT_STARTER_SETTINGS,
        updateSettings,
      }}
    >
      <AppSettingsControls />
    </StarterSettingsContext.Provider>,
  )
}

describe('AppSettingsControls', () => {
  it('renders theme and language controls', () => {
    renderControls()

    expect(screen.getByText('Theme')).toBeInTheDocument()
    expect(screen.getByText('Language')).toBeInTheDocument()
    expect(screen.getAllByRole('combobox')).toHaveLength(2)
  })

  it('updates starter settings from the select controls', () => {
    const updateSettings = vi.fn()
    renderControls(updateSettings)

    fireEvent.click(screen.getByRole('combobox', { name: 'Theme' }))
    fireEvent.click(screen.getByRole('option', { name: 'Dark' }))
    fireEvent.click(screen.getByRole('combobox', { name: 'Language' }))
    fireEvent.click(screen.getByRole('option', { name: 'Vietnamese' }))

    expect(updateSettings).toHaveBeenCalledWith({ themeMode: 'dark' })
    expect(updateSettings).toHaveBeenCalledWith({ uiLanguage: 'vi' })
  })
})
