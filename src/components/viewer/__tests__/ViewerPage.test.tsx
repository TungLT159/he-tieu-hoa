import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { StarterSettingsContext } from '@/app/StarterSettingsContext'
import type { StarterSettingsContextValue } from '@/app/StarterSettingsContext'
import type { StarterSettings } from '@/app/settingsStorage'
import type { AppLocale } from '@/lib/i18n'

import { ViewerPage } from '../ViewerPage'

vi.mock('@react-three/fiber', () => ({
  Canvas: () => <div data-testid="canvas" />,
}))

vi.mock('@react-three/drei', () => ({
  Loader: () => null,
  OrbitControls: () => null,
}))

vi.mock('../DigestiveModel', () => ({
  DigestiveModel: () => null,
}))

function createMockSettingsContext(overrides: Partial<StarterSettingsContextValue> = {}): StarterSettingsContextValue {
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

function renderPage() {
  return render(
    <StarterSettingsContext.Provider value={createMockSettingsContext()}>
      <ViewerPage />
    </StarterSettingsContext.Provider>,
  )
}

describe('ViewerPage', () => {
  it('renders the side menu', () => {
    renderPage()

    expect(screen.getByLabelText('Thu gọn')).toBeInTheDocument()
  })

  it('renders the 3D canvas', () => {
    renderPage()

    expect(screen.getByTestId('canvas')).toBeInTheDocument()
  })

  it('has horizontal flex layout', () => {
    renderPage()

    const section = document.querySelector('section')

    expect(section?.className).toContain('flex')
  })
})
