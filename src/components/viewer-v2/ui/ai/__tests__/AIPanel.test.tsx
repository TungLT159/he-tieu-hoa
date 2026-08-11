import { StarterSettingsContext } from '@/app/StarterSettingsContext'
import { DEFAULT_STARTER_SETTINGS } from '@/app/settingsStorage'
import { renderStarter } from '@/test/starterRender'
import { fireEvent, screen } from '@testing-library/react'
import type { ComponentProps, ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { AIPanel } from '../AIPanel'

function TestIcon(props: ComponentProps<'svg'>) {
  return <svg data-testid="ai-panel-icon" {...props} />
}

function renderAIPanel(
  props: Partial<ComponentProps<typeof AIPanel>> = {},
  children: ReactNode = <p>Panel body</p>,
) {
  const onClose = vi.fn()

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
      <AIPanel
        open={props.open ?? true}
        onClose={props.onClose ?? onClose}
        title={props.title ?? 'AI Assistant'}
        icon={props.icon ?? TestIcon}
        tabs={props.tabs}
        activeTab={props.activeTab}
        onTabChange={props.onTabChange}
      >
        {children}
      </AIPanel>
    </StarterSettingsContext.Provider>,
  )

  return { onClose: props.onClose ?? onClose }
}

describe('AIPanel', () => {
  it('renders a responsive theme-aware right sheet with title and localized close control', () => {
    const { onClose } = renderAIPanel()

    const dialog = screen.getByRole('dialog', { name: 'AI Assistant' })

    expect(dialog).toHaveClass('w-full', 'sm:w-[40vw]', 'sm:max-w-[500px]', 'bg-card/95', 'backdrop-blur')
    expect(screen.getByTestId('ai-panel-icon')).toHaveAttribute('aria-hidden', 'true')

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('renders body content inside a scrollable area that fills remaining height', () => {
    renderAIPanel()

    const scrollArea = screen.getByText('Panel body').closest('[data-slot="scroll-area"]')

    expect(scrollArea).toHaveClass('min-h-0', 'flex-1')
  })

  it('renders optional tabs and reports tab changes', () => {
    const onTabChange = vi.fn()
    renderAIPanel({
      activeTab: 'chat',
      onTabChange,
      tabs: [
        { value: 'chat', label: 'Chat' },
        { value: 'image', label: 'Image' },
      ],
    })

    expect(screen.getByRole('tablist')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Chat' })).toHaveAttribute('data-state', 'active')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel body')

    fireEvent.keyDown(screen.getByRole('tab', { name: 'Image' }), { key: 'Enter' })

    expect(onTabChange).toHaveBeenCalledWith('image')
  })
})
