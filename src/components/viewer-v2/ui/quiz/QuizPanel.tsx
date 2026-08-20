import { CheckCircle, Question, XCircle } from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'

import { useStarterSettings } from '@/app/StarterSettingsContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { createTranslator } from '@/lib/i18n'
import { cn } from '@/lib/utils'

import { loadQuizQuestions, pickRandomQuestions, type QuizQuestion } from './quizQuestions'

const DEFAULT_QUESTION_COUNT = 10
const QUESTION_COUNT_OPTIONS = [5, 10, 15, 20]
const FAKE_LOADING_MS = 800

interface QuizPanelProps {
  onClose: () => void
  loadingDelayMs?: number
}

type QuizStage = 'setup' | 'loading' | 'answering' | 'submitted' | 'error'
type AnswerMap = Record<string, number>

export function QuizPanel({ onClose, loadingDelayMs = FAKE_LOADING_MS }: QuizPanelProps) {
  const { locale } = useStarterSettings()
  const t = useMemo(() => createTranslator(locale), [locale])
  const titleId = 'viewer-quiz-panel-title'
  const [stage, setStage] = useState<QuizStage>('setup')
  const [allQuestions, setAllQuestions] = useState<QuizQuestion[]>([])
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
  const [questionCount, setQuestionCount] = useState(DEFAULT_QUESTION_COUNT)
  const [answers, setAnswers] = useState<AnswerMap>({})
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    loadQuizQuestions()
      .then((questions) => {
        if (!isMounted) return
        setAllQuestions(questions)
        setQuestionCount(Math.min(DEFAULT_QUESTION_COUNT, questions.length))
      })
      .catch(() => {
        if (!isMounted) return
        setError(t('viewer.quiz.loadError'))
        setStage('error')
      })

    return () => {
      isMounted = false
    }
  }, [t])

  const countOptions = useMemo(() => {
    if (allQuestions.length === 0) return QUESTION_COUNT_OPTIONS

    const availableOptions = QUESTION_COUNT_OPTIONS.filter((count) => count <= allQuestions.length)
    const options = availableOptions.length > 0 ? availableOptions : [allQuestions.length]
    return options.includes(allQuestions.length) ? options : [...options, allQuestions.length]
  }, [allQuestions.length])

  const answeredCount = Object.keys(answers).length
  const score = quizQuestions.reduce((total, question) => {
    return answers[question.id] === question.correctAnswer ? total + 1 : total
  }, 0)

  const createQuiz = () => {
    if (allQuestions.length === 0) {
      setError(t('viewer.quiz.loadError'))
      setStage('error')
      return
    }

    setStage('loading')
    setAnswers({})
    setError(null)

    const finishLoading = () => {
      setQuizQuestions(pickRandomQuestions(allQuestions, questionCount))
      setStage('answering')
    }

    if (loadingDelayMs <= 0) {
      finishLoading()
      return
    }

    window.setTimeout(finishLoading, loadingDelayMs)
  }

  const resetQuiz = () => {
    setQuizQuestions([])
    setAnswers({})
    setError(null)
    setStage('setup')
  }

  const submitQuiz = () => {
    setStage('submitted')
  }

  const renderSetup = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="quiz-question-count">{t('viewer.quiz.questionCount')}</Label>
        <Select
          value={String(questionCount)}
          onValueChange={(value) => setQuestionCount(Number(value))}
          disabled={allQuestions.length === 0}
        >
          <SelectTrigger id="quiz-question-count" className="w-full" aria-label={t('viewer.quiz.questionCount')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {countOptions.map((count) => (
              <SelectItem key={count} value={String(count)}>
                {t('viewer.quiz.countOption', { count })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <p className="text-sm text-muted-foreground">
        {allQuestions.length > 0
          ? t('viewer.quiz.availableQuestions', { count: allQuestions.length })
          : t('viewer.quiz.loadingSource')}
      </p>
      <Button type="button" className="w-full" disabled={allQuestions.length === 0} onClick={createQuiz}>
        {t('viewer.quiz.create')}
      </Button>
    </div>
  )

  const renderLoading = () => (
    <div className="space-y-4" role="status" aria-live="polite">
      <p className="text-sm font-medium">{t('viewer.quiz.loading')}</p>
      <div className="space-y-3">
        <Skeleton className="h-5 w-11/12" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-4/5" />
      </div>
    </div>
  )

  const renderQuestion = (question: QuizQuestion, index: number) => {
    const selectedAnswer = answers[question.id]
    const isSubmitted = stage === 'submitted'

    return (
      <fieldset key={question.id} className="space-y-3 rounded-md border bg-background/70 p-3">
        <legend className="px-1 text-sm font-semibold">
          {t('viewer.quiz.questionNumber', { current: index + 1, total: quizQuestions.length })}
        </legend>
        <p className="text-sm leading-6 text-foreground">{question.question}</p>
        <RadioGroup
          value={selectedAnswer === undefined ? '' : String(selectedAnswer)}
          onValueChange={(value) => {
            if (isSubmitted) return
            setAnswers((currentAnswers) => ({
              ...currentAnswers,
              [question.id]: Number(value),
            }))
          }}
          aria-label={question.question}
          className="gap-2"
        >
          {question.options.map((option, optionIndex) => {
            const optionId = `${question.id}-${optionIndex}`
            const isCorrectOption = optionIndex === question.correctAnswer
            const isSelectedOption = selectedAnswer === optionIndex

            return (
              <div
                key={optionId}
                className={cn(
                  'flex items-start gap-2 rounded-md border px-3 py-2 text-sm',
                  isSubmitted && isCorrectOption && 'border-green-500/70 bg-green-500/10',
                  isSubmitted && isSelectedOption && !isCorrectOption && 'border-destructive/70 bg-destructive/10',
                )}
              >
                <RadioGroupItem
                  id={optionId}
                  value={String(optionIndex)}
                  disabled={isSubmitted}
                  className="mt-0.5"
                />
                <Label htmlFor={optionId} className="flex-1 cursor-pointer leading-5">
                  {option}
                </Label>
                {isSubmitted && isCorrectOption ? <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" aria-hidden /> : null}
                {isSubmitted && isSelectedOption && !isCorrectOption ? (
                  <XCircle className="mt-0.5 h-4 w-4 text-destructive" aria-hidden />
                ) : null}
              </div>
            )
          })}
        </RadioGroup>
      </fieldset>
    )
  }

  const renderQuiz = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 rounded-md bg-muted px-3 py-2 text-sm">
        <span>{t('viewer.quiz.progress', { answered: answeredCount, total: quizQuestions.length })}</span>
        {stage === 'submitted' ? (
          <span className="font-semibold">{t('viewer.quiz.score', { score, total: quizQuestions.length })}</span>
        ) : null}
      </div>
      <div className="max-h-[min(64vh,620px)] space-y-3 overflow-y-auto pr-1">
        {quizQuestions.map(renderQuestion)}
      </div>
      {stage === 'submitted' ? (
        <Button type="button" className="w-full" onClick={createQuiz}>
            {t('viewer.quiz.recreate')}
        </Button>
      ) : (
        <Button type="button" className="w-full" disabled={answeredCount < quizQuestions.length} onClick={submitQuiz}>
          {t('viewer.quiz.submit')}
        </Button>
      )}
    </div>
  )

  const renderError = () => (
    <div className="space-y-4">
      <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
        {error ?? t('viewer.quiz.loadError')}
      </p>
      <Button type="button" variant="secondary" onClick={resetQuiz}>
        {t('viewer.quiz.tryAgain')}
      </Button>
    </div>
  )

  return (
    <Card
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      className="absolute left-1/2 top-1/2 z-30 max-h-[calc(100%-2rem)] w-[min(calc(100%-2rem),1040px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-card/95 shadow-xl backdrop-blur"
    >
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 border-b pb-3">
        <CardTitle id={titleId} className="flex min-w-0 items-center gap-2 text-base font-semibold">
          <Question className="h-5 w-5 shrink-0" aria-hidden />
          <span className="truncate">{t('viewer.quiz.title')}</span>
        </CardTitle>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          {t('common.close')}
        </Button>
      </CardHeader>
      <CardContent className="overflow-y-auto p-4">
        {stage === 'setup' ? renderSetup() : null}
        {stage === 'loading' ? renderLoading() : null}
        {stage === 'answering' || stage === 'submitted' ? renderQuiz() : null}
        {stage === 'error' ? renderError() : null}
      </CardContent>
    </Card>
  )
}
