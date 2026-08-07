import { StarterSettingsContext } from '@/app/StarterSettingsContext'
import { DEFAULT_STARTER_SETTINGS } from '@/app/settingsStorage'
import { renderStarter } from '@/test/starterRender'
import { fireEvent, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { VideoPlayerPanel } from '../VideoPlayerPanel'

function renderPanel(onClose = vi.fn()) {
  return renderStarter(
    <StarterSettingsContext.Provider
      value={{
        appVersion: '0.1.0',
        locale: 'en',
        resolvedThemeMode: 'light',
        settings: DEFAULT_STARTER_SETTINGS,
        updateSettings: vi.fn(),
      }}
    >
      <VideoPlayerPanel onClose={onClose} />
    </StarterSettingsContext.Provider>,
  )
}

describe('VideoPlayerPanel', () => {
  it('renders a localized close button', () => {
    renderPanel()

    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    renderPanel(onClose)

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(onClose).toHaveBeenCalled()
  })

  it('renders a localized region with the video player', () => {
    renderPanel()

    const region = screen.getByRole('region', { name: 'Learning Video' })

    expect(within(region).getByText('Learning Video')).toBeInTheDocument()
    expect(within(region).getByText('Your browser cannot play this learning video.')).toBeInTheDocument()
    expect(within(region).getByTestId('learning-video')).toBeInTheDocument()
  })

  it('uses controls and the expected video source', () => {
    renderPanel()

    const video = screen.getByTestId('learning-video')

    expect(video).toHaveAttribute('controls')
    expect(video).toHaveAttribute('src', '/videos/he-tieu-hoa.mp4')
  })
})
