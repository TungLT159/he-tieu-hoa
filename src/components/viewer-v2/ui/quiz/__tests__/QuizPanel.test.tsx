import { renderStarter } from '@/test/starterRender'
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { StarterSettingsContext } from '@/app/StarterSettingsContext'
import { DEFAULT_STARTER_SETTINGS } from '@/app/settingsStorage'

import { QuizPanel } from '../QuizPanel'

const sampleQuestions = [
  {
    question: 'Question one?',
    options: ['Correct one', 'Wrong one'],
    correct_answer: 0,
  },
  {
    question: 'Question two?',
    options: ['Wrong two', 'Correct two'],
    correct_answer: 1,
  },
  {
    question: 'Question three?',
    options: ['Correct three', 'Wrong three'],
    correct_answer: 0,
  },
  {
    question: 'Question four?',
    options: ['Correct four', 'Wrong four'],
    correct_answer: 0,
  },
  {
    question: 'Question five?',
    options: ['Correct five', 'Wrong five'],
    correct_answer: 0,
  },
]

function renderQuizPanel(onClose = vi.fn(), loadingDelayMs?: number) {
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
      <QuizPanel onClose={onClose} loadingDelayMs={loadingDelayMs} />
    </StarterSettingsContext.Provider>,
  )
}

describe('QuizPanel', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(sampleQuestions),
      }),
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('loads the question source and creates a quiz after fake loading', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    renderQuizPanel(undefined, 0)

    await act(async () => {
      await Promise.resolve()
    })

    expect(screen.getByText('5 questions available in the source.')).toBeInTheDocument()
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Create Questions' }))
    })

    expect(screen.getByText('Answered 0/5')).toBeInTheDocument()
    expect(screen.getAllByRole('group')).toHaveLength(5)
  })

  it('checks selected answers and shows the final score after submit', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    renderQuizPanel(undefined, 0)

    await act(async () => {
      await Promise.resolve()
    })

    expect(screen.getByText('5 questions available in the source.')).toBeInTheDocument()
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Create Questions' }))
    })

    const firstQuestion = screen.getByRole('radiogroup', { name: 'Question one?' })
    const secondQuestion = screen.getByRole('radiogroup', { name: 'Question two?' })
    fireEvent.click(within(firstQuestion).getByRole('radio', { name: 'Correct one' }))
    fireEvent.click(within(secondQuestion).getByRole('radio', { name: 'Wrong two' }))

    for (const label of ['Correct three', 'Correct four', 'Correct five']) {
      fireEvent.click(screen.getByRole('radio', { name: label }))
    }

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))

    expect(screen.getByText('Score 4/5')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create New Question Set' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'New Random Set' })).not.toBeInTheDocument()
  })

  it('resets to setup after creating again', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    renderQuizPanel(undefined, 0)

    await act(async () => {
      await Promise.resolve()
    })

    expect(screen.getByText('5 questions available in the source.')).toBeInTheDocument()
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Create Questions' }))
    })

    for (const label of ['Correct one', 'Correct two', 'Correct three', 'Correct four', 'Correct five']) {
      fireEvent.click(screen.getByRole('radio', { name: label }))
    }
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))
    fireEvent.click(screen.getByRole('button', { name: 'Create New Question Set' }))

    expect(screen.getByText('Answered 0/5')).toBeInTheDocument()
    expect(screen.queryByText('Score 5/5')).not.toBeInTheDocument()
  })

  it('shows a friendly error when the question source fails', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as Response)

    renderQuizPanel()

    await waitFor(() => {
      expect(screen.getByText('Could not load quiz questions. Please check /Questions/questions.json.')).toBeInTheDocument()
    })
  })
})
