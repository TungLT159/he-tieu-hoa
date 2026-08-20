import { describe, expect, it, vi } from 'vitest'

import { loadQuizQuestions, normalizeQuizQuestions, pickRandomQuestions, QUIZ_QUESTIONS_URL } from '../quizQuestions'

describe('quizQuestions', () => {
  it('normalizes valid questions and filters invalid entries', () => {
    const questions = normalizeQuizQuestions([
      {
        question: '  Valid question?  ',
        options: [' A ', 'B'],
        correct_answer: 1,
      },
      {
        question: '',
        options: ['A', 'B'],
        correct_answer: 0,
      },
      {
        question: 'Invalid answer',
        options: ['A', 'B'],
        correct_answer: 3,
      },
    ])

    expect(questions).toEqual([
      {
        id: '0-  Valid question?  ',
        question: 'Valid question?',
        options: ['A', 'B'],
        correctAnswer: 1,
      },
    ])
  })

  it('loads questions from the public questions URL', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ question: 'Q?', options: ['A', 'B'], correct_answer: 0 }]),
    })

    await expect(loadQuizQuestions(fetcher)).resolves.toHaveLength(1)
    expect(fetcher).toHaveBeenCalledWith(QUIZ_QUESTIONS_URL)
  })

  it('throws when the source cannot be loaded', async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: false, status: 404 })

    await expect(loadQuizQuestions(fetcher)).rejects.toThrow('Failed to load quiz questions: 404')
  })

  it('picks a random subset without duplicates', () => {
    const questions = [
      { id: '1', question: 'Q1', options: ['A', 'B'], correctAnswer: 0 },
      { id: '2', question: 'Q2', options: ['A', 'B'], correctAnswer: 0 },
      { id: '3', question: 'Q3', options: ['A', 'B'], correctAnswer: 0 },
    ]

    const pickedQuestions = pickRandomQuestions(questions, 2, () => 0)

    expect(pickedQuestions).toHaveLength(2)
    expect(new Set(pickedQuestions.map((question) => question.id)).size).toBe(2)
  })
})
