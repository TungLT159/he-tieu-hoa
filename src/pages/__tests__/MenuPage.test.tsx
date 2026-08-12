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

function renderMenuPage() {
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
  })

  it('navigates to /viewer when start button is clicked', async () => {
    renderMenuPage()

    fireEvent.click(screen.getByRole('button', { name: /start|bắt đầu/i }))

    expect(mockNavigate).toHaveBeenCalledWith('/viewer')
  })

  it('navigates to /guide when guide button is clicked', async () => {
    renderMenuPage()

    fireEvent.click(screen.getByRole('button', { name: /guide|hướng dẫn/i }))

    expect(mockNavigate).toHaveBeenCalledWith('/guide')
  })

  it('opens settings sheet when settings button is clicked', async () => {
    renderMenuPage()

    fireEvent.click(screen.getByRole('button', { name: /settings|cài đặt/i }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
