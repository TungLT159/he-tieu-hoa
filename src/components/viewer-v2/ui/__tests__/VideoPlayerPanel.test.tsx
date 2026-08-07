import { StarterSettingsContext } from '@/app/StarterSettingsContext'
import { DEFAULT_STARTER_SETTINGS } from '@/app/settingsStorage'
import { renderStarter } from '@/test/starterRender'
import { fireEvent, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { VideoPlayerPanel } from '../VideoPlayerPanel'

function renderPanel(onClose = vi.fn(), locale: 'en' | 'vi' = 'en') {
  return renderStarter(
    <StarterSettingsContext.Provider
      value={{
        appVersion: '0.1.0',
        locale,
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
    expect(within(region).getByTestId('learning-video')).toBeInTheDocument()
  })

  it('uses controls and the expected video source', () => {
    renderPanel()

    const video = screen.getByTestId('learning-video')

    expect(video).toHaveAttribute('controls')
    expect(video).toHaveAttribute('src', '/videos/he-tieu-hoa.mp4')
  })

  it('shows localized fallback text when the video fails to load', () => {
    renderPanel()

    expect(screen.queryByTestId('learning-video-error')).not.toBeInTheDocument()

    fireEvent.error(screen.getByTestId('learning-video'))

    expect(screen.getByTestId('learning-video-error')).toHaveTextContent('Your browser cannot play this learning video.')
  })

  it('adds localized metadata to the captions track', () => {
    const { rerender } = renderPanel()

    const track = screen.getByTestId('learning-video').querySelector('track')

    expect(track).toHaveAttribute('srcLang', 'en')
    expect(track).toHaveAttribute('label', 'English')

    rerender(
      <StarterSettingsContext.Provider
        value={{
          appVersion: '0.1.0',
          locale: 'vi',
          resolvedThemeMode: 'light',
          settings: DEFAULT_STARTER_SETTINGS,
          updateSettings: vi.fn(),
        }}
      >
        <VideoPlayerPanel onClose={vi.fn()} />
      </StarterSettingsContext.Provider>,
    )

    const vietnameseTrack = screen.getByTestId('learning-video').querySelector('track')

    expect(vietnameseTrack).toHaveAttribute('srcLang', 'vi')
    expect(vietnameseTrack).toHaveAttribute('label', 'Tiếng Việt')
  })

  it('gives the video an accessible localized title', () => {
    renderPanel()

    expect(screen.getByTitle('Learning Video')).toBe(screen.getByTestId('learning-video'))
  })
})
