export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
}

interface RawQuizQuestion {
  question?: unknown
  options?: unknown
  correct_answer?: unknown
}

interface ValidRawQuizQuestion {
  question: string
  options: string[]
  correct_answer: number
}

export const QUIZ_QUESTIONS_URL = '/Questions/questions.json'

function isValidRawQuestion(question: RawQuizQuestion): question is ValidRawQuizQuestion {
  const correctAnswer = question.correct_answer

  return (
    typeof question.question === 'string' &&
    question.question.trim().length > 0 &&
    Array.isArray(question.options) &&
    question.options.length >= 2 &&
    question.options.every((option) => typeof option === 'string' && option.trim().length > 0) &&
    typeof correctAnswer === 'number' &&
    Number.isInteger(correctAnswer) &&
    correctAnswer >= 0 &&
    correctAnswer < question.options.length
  )
}

export function normalizeQuizQuestions(rawQuestions: unknown): QuizQuestion[] {
  if (!Array.isArray(rawQuestions)) return []

  return rawQuestions
    .filter(isValidRawQuestion)
    .map((question, index) => ({
      id: `${index}-${question.question}`,
      question: question.question.trim(),
      options: question.options.map((option) => option.trim()),
      correctAnswer: question.correct_answer,
    }))
}

export async function loadQuizQuestions(fetcher: typeof fetch = fetch): Promise<QuizQuestion[]> {
  const response = await fetcher(QUIZ_QUESTIONS_URL)
  if (!response.ok) {
    throw new Error(`Failed to load quiz questions: ${response.status}`)
  }

  const questions = normalizeQuizQuestions(await response.json())
  if (questions.length === 0) {
    throw new Error('No quiz questions are available.')
  }

  return questions
}

export function pickRandomQuestions(
  questions: readonly QuizQuestion[],
  count: number,
  random: () => number = Math.random,
): QuizQuestion[] {
  const targetCount = Math.max(0, Math.min(count, questions.length))
  const shuffled = [...questions]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }

  return shuffled.slice(0, targetCount)
}
