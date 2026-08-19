import { renderStarter } from '@/test/starterRender'
import { screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { StarterSettingsContext } from '@/app/StarterSettingsContext'
import { DEFAULT_STARTER_SETTINGS } from '@/app/settingsStorage'
import { ViewerV2Page } from '../ViewerV2Page'

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

vi.mock('../scene/SceneSetup', () => ({
  SceneSetup: () => <div data-testid="mock-scene-setup" />,
}))

describe('ViewerV2Page', () => {
  it('renders the v2 viewer canvas and overlay without the old viewer context', () => {
    const { container } = renderStarter(
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
          <ViewerV2Page />
        </StarterSettingsContext.Provider>
      </MemoryRouter>,
    )

    expect(container.querySelector('[data-viewer-canvas="true"]')).toBeInTheDocument()
    expect(screen.getByTestId('mock-canvas')).toHaveAttribute('dpr', '0.75')
    expect(screen.getByTestId('mock-scene-setup')).toBeInTheDocument()
    expect(screen.getByTestId('mock-loader')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Return to overview' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Rotate Model' })).toBeInTheDocument()
  })

  it('opens the viewer settings panel from menu navigation state', () => {
    renderStarter(
      <MemoryRouter initialEntries={[{ pathname: '/viewer', state: { openSettings: true } }]}>
        <StarterSettingsContext.Provider
          value={{
            appVersion: '0.1.0',
            locale: 'en',
            resolvedThemeMode: 'light',
            settings: DEFAULT_STARTER_SETTINGS,
            updateSettings: vi.fn(),
          }}
        >
          <ViewerV2Page />
        </StarterSettingsContext.Provider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument()
  })
})
