import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { StarterSettingsContext } from '@/app/StarterSettingsContext'
import { DEFAULT_STARTER_SETTINGS } from '@/app/settingsStorage'
import { renderStarter } from '@/test/starterRender'
import { GuidePage } from '../GuidePage'

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <div data-testid="mock-canvas" {...props}>
      {children}
    </div>
  ),
}))

vi.mock('@react-three/drei', () => ({
  Loader: () => <div data-testid="mock-loader" />,
}))

vi.mock('@/components/viewer-v2/scene/SceneSetup', () => ({
  SceneSetup: () => <div data-testid="mock-scene-setup" />,
}))

describe('GuidePage', () => {
  it('renders the v2 viewer with the tutorial walkthrough', () => {
    renderStarter(
      <MemoryRouter>
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
        </StarterSettingsContext.Provider>
      </MemoryRouter>,
    )

    expect(screen.getByTestId('mock-canvas')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Rotate Model' })).toBeInTheDocument()
    expect(screen.getByRole('dialog', { name: '3D interaction area' })).toBeInTheDocument()
  })

  it('passes the persisted narration voice into guide mode', () => {
    const updateSettings = vi.fn()
    renderStarter(
      <MemoryRouter>
        <StarterSettingsContext.Provider
          value={{
            appVersion: '0.1.0',
            locale: 'en',
            resolvedThemeMode: 'light',
            settings: { ...DEFAULT_STARTER_SETTINGS, narrationVoice: 'nam' },
            updateSettings,
          }}
        >
          <GuidePage />
        </StarterSettingsContext.Provider>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Settings' }))

    expect(screen.getByRole('radio', { name: 'Southern' })).toBeChecked()
  })
})
