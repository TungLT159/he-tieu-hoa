import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { StarterSettingsContext } from '@/app/StarterSettingsContext'
import { DEFAULT_STARTER_SETTINGS } from '@/app/settingsStorage'
import { renderStarter } from '@/test/starterRender'
import { GuidePage } from '../GuidePage'

describe('GuidePage', () => {
  it('renders a placeholder title', () => {
    renderStarter(
      <StarterSettingsContext.Provider
        value={{
          appVersion: '0.1.0',
          locale: 'en',
          resolvedThemeMode: 'light',
          settings: DEFAULT_STARTER_SETTINGS,
          updateSettings: vi.fn(),
        }}
      >
        <GuidePage />
      </StarterSettingsContext.Provider>,
    )

    expect(screen.getByRole('heading')).toBeInTheDocument()
  })
})
