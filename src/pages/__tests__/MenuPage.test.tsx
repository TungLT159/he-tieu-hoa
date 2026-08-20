import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { StarterSettingsContext } from '@/app/StarterSettingsContext'
import { DEFAULT_STARTER_SETTINGS } from '@/app/settingsStorage'
import { renderStarter } from '@/test/starterRender'
import { MenuPage } from '../MenuPage'

const mockNavigate = vi.hoisted(() => vi.fn())
const mockClose = vi.hoisted(() => vi.fn().mockResolvedValue(undefined))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@tauri-apps/api/window', () => ({
  getCurrentWindow: () => ({ close: mockClose }),
}))

function renderMenuPage({
  narrationVoice = DEFAULT_STARTER_SETTINGS.narrationVoice,
  updateSettings = vi.fn(),
} = {}) {
  return renderStarter(
    <StarterSettingsContext.Provider
      value={{
        appVersion: '0.1.0',
        locale: 'en',
        resolvedThemeMode: 'light',
        settings: { ...DEFAULT_STARTER_SETTINGS, narrationVoice },
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
    mockClose.mockClear()
  })

  it('renders the title and three buttons', () => {
    renderMenuPage()

    expect(screen.getByRole('heading')).toBeInTheDocument()
    expect(screen.getByAltText('IIT logo')).toBeInTheDocument()
    expect(screen.getByText('Interactive learning space')).toBeInTheDocument()
    expect(screen.getByText('Explore the digestive system through a focused 3D lesson interface.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /start|bắt đầu/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /guide|hướng dẫn/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /exit|thoát/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /settings|cài đặt/i })).toHaveClass('rounded-full')
  })

  it('renders the background image', () => {
    renderMenuPage()

    const bg = document.querySelector('[data-testid="menu-background"]')
    expect(bg).toBeInTheDocument()
    expect(bg).toHaveStyle({ backgroundImage: 'url("/bg_menu_phanmem3d-1.png")' })
  })

  it('renders a reference-style open menu without a glass card', () => {
    renderMenuPage()

    const card = screen.getByTestId('menu-hero-card')
    expect(card).toHaveClass('max-w-[1040px]')
    expect(card).toHaveClass('lg:grid-cols-[minmax(0,1fr)_17rem]')
    expect(card).toHaveClass('items-center')
    expect(card).not.toHaveClass('bg-white/[0.045]')
    expect(card).not.toHaveClass('backdrop-blur-2xl')

    const logo = screen.getByTestId('menu-logo')
    expect(logo).toHaveClass('bg-white')
    expect(screen.getByAltText('IIT logo')).toHaveAttribute('src', '/BG logo IIT.png')
    expect(screen.getByRole('button', { name: /start|bắt đầu/i })).toHaveClass('bg-[#536e99]')
    expect(screen.getByRole('button', { name: /start|bắt đầu/i })).toHaveClass('rounded-md')
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

  it('closes the app when exit button is clicked', async () => {
    renderMenuPage()

    fireEvent.click(screen.getByRole('button', { name: /exit|thoát/i }))

    await vi.waitFor(() => expect(mockClose).toHaveBeenCalledOnce())
  })

  it('opens the viewer settings panel on the menu when settings button is clicked', () => {
    renderMenuPage()

    fireEvent.click(screen.getByRole('button', { name: /settings|cài đặt/i }))

    const dialog = screen.getByRole('dialog', { name: 'Settings' })
    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveClass('absolute')
    expect(dialog).toHaveClass('right-4')
    expect(dialog).toHaveClass('top-4')
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument()
    expect(screen.getByText('Theme')).toBeInTheDocument()
    expect(screen.getByText('Language')).toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: 'Quality' })).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: 'Volume' })).toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: 'Voice' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Model Color' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Background Color' })).toBeInTheDocument()
    expect(screen.getAllByRole('combobox')).toHaveLength(2)
    expect(mockNavigate).not.toHaveBeenCalled()
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

  it('uses the persisted narration voice in the menu settings sheet', () => {
    renderMenuPage({ narrationVoice: 'nam' })

    fireEvent.click(screen.getByRole('button', { name: /settings|cài đặt/i }))

    expect(screen.getByRole('radio', { name: 'Southern' })).toBeChecked()
  })
})
