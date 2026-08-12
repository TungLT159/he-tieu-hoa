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

  it('opens settings sheet with app setting controls when settings button is clicked', () => {
    renderMenuPage()

    fireEvent.click(screen.getByRole('button', { name: /settings|cài đặt/i }))

    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument()
    expect(screen.getByText('Starter preferences for appearance, language, and profile.')).toBeInTheDocument()
    expect(screen.getByText('Theme')).toBeInTheDocument()
    expect(screen.getByText('Language')).toBeInTheDocument()
    expect(screen.getAllByRole('combobox')).toHaveLength(2)
    expect(screen.queryByText('This feature is under development.')).not.toBeInTheDocument()
    expect(screen.queryByText('Instruction content will be available soon.')).not.toBeInTheDocument()
  })

  it('updates persisted settings from the menu settings sheet', () => {
    const updateSettings = vi.fn()
    renderMenuPage({ updateSettings })

    fireEvent.click(screen.getByRole('button', { name: /settings|cài đặt/i }))
    fireEvent.click(screen.getByRole('combobox', { name: 'Theme' }))
    fireEvent.click(screen.getByRole('option', { name: 'Dark' }))
    fireEvent.click(screen.getByRole('combobox', { name: 'Language' }))
    fireEvent.click(screen.getByRole('option', { name: 'Vietnamese' }))

    expect(updateSettings).toHaveBeenCalledWith({ themeMode: 'dark' })
    expect(updateSettings).toHaveBeenCalledWith({ uiLanguage: 'vi' })
  })
})
