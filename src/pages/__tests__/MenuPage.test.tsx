import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { StarterSettingsContext } from '@/app/StarterSettingsContext'
import { DEFAULT_STARTER_SETTINGS } from '@/app/settingsStorage'
import { renderStarter } from '@/test/starterRender'
import { MenuPage } from '../MenuPage'

const mockNavigate = vi.hoisted(() => vi.fn())

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

function renderMenuPage({ updateSettings = vi.fn() } = {}) {
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
      <MenuPage />
    </StarterSettingsContext.Provider>,
  )
}

describe('MenuPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it('renders the title and three buttons', () => {
    renderMenuPage()

    expect(screen.getByRole('heading')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /start|bắt đầu/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /guide|hướng dẫn/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /settings|cài đặt/i })).toBeInTheDocument()
  })

  it('renders the background image', () => {
    renderMenuPage()

    const bg = document.querySelector('[data-testid="menu-background"]')
    expect(bg).toBeInTheDocument()
    expect(bg).toHaveStyle({ backgroundImage: 'url("/bg_menu_phanmem3d-1.png")' })
  })

  it('renders an upgraded hero card sized for the menu window', () => {
    renderMenuPage()

    const card = screen.getByTestId('menu-hero-card')
    expect(card).toHaveClass('w-[min(760px,calc(100vw-48px))]')
    expect(card).toHaveClass('md:px-16')
    expect(card).toHaveClass('md:py-14')
    expect(card).toHaveClass('bg-white/[0.045]')
    expect(card).toHaveClass('backdrop-blur-2xl')
  })

  it('navigates to /viewer when start button is clicked', () => {
    renderMenuPage()

    fireEvent.click(screen.getByRole('button', { name: /start|bắt đầu/i }))

    expect(mockNavigate).toHaveBeenCalledWith('/viewer')
  })

  it('navigates to /guide when guide button is clicked', () => {
    renderMenuPage()

    fireEvent.click(screen.getByRole('button', { name: /guide|hướng dẫn/i }))

    expect(mockNavigate).toHaveBeenCalledWith('/guide')
  })

  it('navigates to the viewer and requests the settings panel when settings button is clicked', () => {
    renderMenuPage()

    fireEvent.click(screen.getByRole('button', { name: /settings|cài đặt/i }))

    expect(mockNavigate).toHaveBeenCalledWith('/viewer', { state: { openSettings: true } })
  })
})
