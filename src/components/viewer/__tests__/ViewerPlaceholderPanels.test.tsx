import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { StarterSettingsContext } from '@/app/StarterSettingsContext'
import type { StarterSettingsContextValue } from '@/app/StarterSettingsContext'
import type { StarterSettings } from '@/app/settingsStorage'
import type { AppLocale } from '@/lib/i18n'

import { ViewerProvider } from '../ViewerContext.tsx'
import { ViewerChatbot } from '../ViewerChatbot'
import { ViewerGenAIDialog } from '../ViewerGenAIDialog'
import { ViewerQuizDialog } from '../ViewerQuizDialog'
import { ViewerVideoDialog } from '../ViewerVideoDialog'
import { useViewer } from '../viewerContext'

function createMockSettingsContext(
  overrides: Partial<StarterSettingsContextValue> = {},
): StarterSettingsContextValue {
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
    updateSettings: () => {},
    ...overrides,
  }
}

function PlaceholderTriggers() {
  const { setActiveDialog, setActiveSheet } = useViewer()

  return (
    <>
      <button type="button" onClick={() => setActiveDialog('quiz')}>
        Open quiz
      </button>
      <button type="button" onClick={() => setActiveSheet('chatbot')}>
        Open chatbot
      </button>
      <button type="button" onClick={() => setActiveDialog('genai')}>
        Open genai
      </button>
      <button type="button" onClick={() => setActiveDialog('video')}>
        Open video
      </button>
    </>
  )
}

function renderPlaceholderPanels(locale: AppLocale = 'vi') {
  return render(
    <StarterSettingsContext.Provider value={createMockSettingsContext({ locale })}>
      <ViewerProvider>
        <PlaceholderTriggers />
        <ViewerQuizDialog />
        <ViewerChatbot />
        <ViewerGenAIDialog />
        <ViewerVideoDialog />
      </ViewerProvider>
    </StarterSettingsContext.Provider>,
  )
}

describe('viewer placeholder panels', () => {
  it('opens and closes the quiz dialog from active dialog state', () => {
    renderPlaceholderPanels()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Open quiz' }))
    expect(screen.getByRole('heading', { name: 'Câu hỏi trắc nghiệm' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Đóng' })).toBeInTheDocument()
    expect(screen.getByText('Tính năng đang được phát triển.')).toBeInTheDocument()

    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens and closes the chatbot sheet from active sheet state with a localized close label', () => {
    renderPlaceholderPanels()

    fireEvent.click(screen.getByRole('button', { name: 'Open chatbot' }))
    expect(screen.getByRole('heading', { name: 'Chatbot AI' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Đóng' })).toBeInTheDocument()
    expect(screen.getByText('Tính năng đang được phát triển.')).toBeInTheDocument()

    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens and closes the GenAI dialog from active dialog state', () => {
    renderPlaceholderPanels()

    fireEvent.click(screen.getByRole('button', { name: 'Open genai' }))
    expect(screen.getByRole('heading', { name: 'Mô tả hệ tiêu hóa' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Đóng' })).toBeInTheDocument()
    expect(screen.getByText('Tính năng đang được phát triển.')).toBeInTheDocument()

    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens the learning video dialog from active dialog state', () => {
    renderPlaceholderPanels('en')

    fireEvent.click(screen.getByRole('button', { name: 'Open video' }))

    expect(screen.getByRole('heading', { name: 'Learning Video' })).toBeInTheDocument()
    expect(screen.getByText('Play the learning video from the public videos folder.')).toBeInTheDocument()
    expect(screen.getByText('If the video file is not available yet, this panel remains ready for preview.')).toBeInTheDocument()
    expect(screen.getByText('Your browser cannot play this learning video.')).toBeInTheDocument()
    expect(screen.getByTitle('Learning Video')).toHaveAttribute('src', '/videos/learning.mp4')
  })

  it('renders English placeholder copy and close labels', () => {
    renderPlaceholderPanels('en')

    fireEvent.click(screen.getByRole('button', { name: 'Open quiz' }))
    expect(screen.getByRole('heading', { name: 'Quiz' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
    expect(screen.getByText('This feature is under development.')).toBeInTheDocument()
    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' })

    fireEvent.click(screen.getByRole('button', { name: 'Open chatbot' }))
    expect(screen.getByRole('heading', { name: 'AI Chatbot' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
    expect(screen.getByText('This feature is under development.')).toBeInTheDocument()
    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' })

    fireEvent.click(screen.getByRole('button', { name: 'Open genai' }))
    expect(screen.getByRole('heading', { name: 'Digestive System Description' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
    expect(screen.getByText('This feature is under development.')).toBeInTheDocument()
  })
})
