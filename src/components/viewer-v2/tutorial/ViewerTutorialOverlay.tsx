import { ArrowLeft, ArrowRight, SpeakerHigh, X } from '@phosphor-icons/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useStarterSettings } from '@/app/StarterSettingsContext'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { createTranslator } from '@/lib/i18n'
import { cn } from '@/lib/utils'

import { useViewerV2 } from '../viewerV2Context'
import type { TutorialPlacement, TutorialStep } from './tutorialSteps'
import { getTutorialAudioSrc, TUTORIAL_STEPS } from './tutorialSteps'

interface ViewerTutorialOverlayProps {
  steps?: TutorialStep[]
}

interface TargetRect {
  top: number
  left: number
  width: number
  height: number
}

interface CardSize {
  width: number
  height: number
}

const CARD_WIDTH = 320
const FALLBACK_CARD_HEIGHT = 124
const VIEWPORT_PADDING = 16
const TARGET_PADDING = 8

function clamp(value: number, min: number, max: number) {
  if (max < min) return min
  return Math.min(Math.max(value, min), max)
}

function readTargetRect(targetId: string): TargetRect | null {
  const target = document.querySelector<HTMLElement>(`[data-tutorial-target="${targetId}"]`)
  if (!target) return null

  target.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  const rect = target.getBoundingClientRect()
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
  }
}

function applyFocusScale(rect: TargetRect | null, focusScale?: number): TargetRect | null {
  if (!rect || !focusScale || focusScale >= 1) return rect

  const width = rect.width * focusScale
  const height = rect.height * focusScale

  return {
    top: rect.top + (rect.height - height) / 2,
    left: rect.left + (rect.width - width) / 2,
    width,
    height,
  }
}

function getCardPosition(rect: TargetRect | null, placement: TutorialPlacement, cardSize: CardSize) {
  const viewportWidth = window.innerWidth || 1024
  const viewportHeight = window.innerHeight || 768
  const fallbackCardWidth = Math.min(CARD_WIDTH, viewportWidth - VIEWPORT_PADDING * 2)
  const cardWidth = cardSize.width || fallbackCardWidth
  const cardHeight = cardSize.height || FALLBACK_CARD_HEIGHT

  if (!rect || placement === 'center') {
    return {
      top: clamp(viewportHeight / 2 - cardHeight / 2, VIEWPORT_PADDING, viewportHeight - cardHeight - VIEWPORT_PADDING),
      left: clamp(viewportWidth / 2 - cardWidth / 2, VIEWPORT_PADDING, viewportWidth - cardWidth - VIEWPORT_PADDING),
      transform: 'none',
    }
  }

  const centeredTop = rect.top + rect.height / 2 - cardHeight / 2
  const centeredLeft = rect.left + rect.width / 2 - cardWidth / 2
  const positions = {
    top: {
      top: rect.top - cardHeight - TARGET_PADDING,
      left: centeredLeft,
      transform: 'none',
    },
    right: {
      top: centeredTop,
      left: rect.left + rect.width + TARGET_PADDING,
      transform: 'none',
    },
    bottom: {
      top: rect.top + rect.height + TARGET_PADDING,
      left: centeredLeft,
      transform: 'none',
    },
    left: {
      top: centeredTop,
      left: rect.left - cardWidth - TARGET_PADDING,
      transform: 'none',
    },
  }

  const position = positions[placement]
  return {
    ...position,
    top: clamp(position.top, VIEWPORT_PADDING, viewportHeight - cardHeight - VIEWPORT_PADDING),
    left: clamp(position.left, VIEWPORT_PADDING, viewportWidth - cardWidth - VIEWPORT_PADDING),
  }
}

export function ViewerTutorialOverlay({ steps = TUTORIAL_STEPS }: ViewerTutorialOverlayProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isActive, setIsActive] = useState(true)
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null)
  const [cardSize, setCardSize] = useState<CardSize>({ width: 0, height: 0 })
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const cardRef = useRef<HTMLDivElement | null>(null)
  const {
    requestViewReset,
    setActiveDialog,
    setActiveSheet,
    setIsDrawing,
    setIsMenuOpen,
    setViewMode,
    voice,
    volume,
  } = useViewerV2()
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)
  const step = steps[currentIndex]
  const progress = steps.length > 0 ? ((currentIndex + 1) / steps.length) * 100 : 0

  const applyStepAction = useCallback((nextStep: TutorialStep) => {
    const action = nextStep.action
    if (!action) return

    if (action.type === 'reset') {
      setActiveDialog(null)
      setActiveSheet(null)
      setIsDrawing(false)
      requestViewReset()
      return
    }

    if (action.type === 'menu') {
      setIsMenuOpen(action.value)
      return
    }

    if (action.type === 'drawing') {
      setActiveDialog(null)
      setActiveSheet(null)
      setIsDrawing(action.value)
      return
    }

    if (action.type === 'viewMode') {
      setActiveDialog(null)
      setActiveSheet(null)
      setIsDrawing(false)
      setViewMode(action.value)
      return
    }

    if (action.type === 'sheet') {
      setActiveDialog(null)
      setIsDrawing(false)
      setActiveSheet(action.value)
      return
    }

    setIsDrawing(false)
    setActiveSheet(null)
    setActiveDialog(action.value)
  }, [requestViewReset, setActiveDialog, setActiveSheet, setIsDrawing, setIsMenuOpen, setViewMode])

  const updateTargetRect = useCallback(() => {
    if (!step) return
    setTargetRect(readTargetRect(step.targetId))
  }, [step])

  const playCurrentAudio = useCallback(() => {
    if (!step) return

    audioRef.current?.pause()
    const audio = new Audio(getTutorialAudioSrc(voice, step.audioFile))
    audio.volume = clamp(volume / 100, 0, 1)
    audioRef.current = audio
    void audio.play().catch(() => undefined)
  }, [step, voice, volume])

  const updateCardSize = useCallback(() => {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return

    setCardSize((size) => {
      if (size.width === rect.width && size.height === rect.height) return size
      return { width: rect.width, height: rect.height }
    })
  }, [])

  useEffect(() => {
    if (!isActive || !step) return

    applyStepAction(step)
    const timeout = window.setTimeout(() => {
      updateTargetRect()
      playCurrentAudio()
    }, 80)

    return () => window.clearTimeout(timeout)
  }, [applyStepAction, currentIndex, isActive, playCurrentAudio, step, updateTargetRect])

  useEffect(() => {
    if (!isActive) return

    const handleResize = () => {
      updateTargetRect()
      updateCardSize()
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', updateTargetRect, true)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', updateTargetRect, true)
    }
  }, [isActive, updateCardSize, updateTargetRect])

  useEffect(() => {
    if (!isActive || !step) return

    const frame = window.requestAnimationFrame(updateCardSize)
    return () => window.cancelAnimationFrame(frame)
  }, [currentIndex, isActive, step, updateCardSize])

  useEffect(() => {
    return () => {
      audioRef.current?.pause()
      audioRef.current = null
    }
  }, [])

  const focusRect = useMemo(
    () => applyFocusScale(targetRect, step?.focusScale),
    [step?.focusScale, targetRect],
  )

  const cardPosition = useMemo(
    () => getCardPosition(focusRect, step?.placement ?? 'center', cardSize),
    [cardSize, focusRect, step?.placement],
  )

  if (!isActive || !step) return null

  const spotlight = focusRect
    ? {
        top: focusRect.top - TARGET_PADDING,
        left: focusRect.left - TARGET_PADDING,
        width: focusRect.width + TARGET_PADDING * 2,
        height: focusRect.height + TARGET_PADDING * 2,
      }
    : null
  const isFirstStep = currentIndex === 0
  const isLastStep = currentIndex === steps.length - 1

  const closeTutorial = () => {
    audioRef.current?.pause()
    setIsActive(false)
    setActiveDialog(null)
    setActiveSheet(null)
    setIsDrawing(false)
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-50" aria-live="polite">
      <div className="absolute inset-0 bg-black/55" />
      {spotlight ? (
        <div
          data-testid="tutorial-spotlight"
          className="absolute rounded-xl border-2 border-primary bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.55),0_0_26px_rgba(255,255,255,0.65)] transition-all duration-200"
          style={spotlight}
        />
      ) : null}
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="false"
        aria-labelledby="viewer-tutorial-title"
        data-testid="viewer-tutorial-card"
        className={cn(
          'pointer-events-auto absolute w-[min(20rem,calc(100vw-2rem))] rounded-lg border border-border bg-card p-4 text-card-foreground shadow-2xl',
          focusRect && step.placement !== 'center' && 'before:absolute before:size-3 before:rotate-45 before:border before:border-border before:bg-card',
          step.placement === 'right' && 'before:left-[-0.42rem] before:top-1/2 before:-translate-y-1/2 before:border-r-0 before:border-t-0',
          step.placement === 'left' && 'before:right-[-0.42rem] before:top-1/2 before:-translate-y-1/2 before:border-b-0 before:border-l-0',
          step.placement === 'top' && 'before:bottom-[-0.42rem] before:left-1/2 before:-translate-x-1/2 before:border-l-0 before:border-t-0',
          step.placement === 'bottom' && 'before:left-1/2 before:top-[-0.42rem] before:-translate-x-1/2 before:border-b-0 before:border-r-0',
        )}
        style={{
          ...cardPosition,
          maxHeight: `calc(100vh - ${VIEWPORT_PADDING * 2}px)`,
          overflowY: 'auto',
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">
              {t('viewer.tutorial.stepCounter', { current: currentIndex + 1, total: steps.length })}
            </p>
            <h2 id="viewer-tutorial-title" className="mt-1 text-base font-semibold leading-6">
              {t(step.titleKey)}
            </h2>
          </div>
          <Button type="button" variant="ghost" size="icon-sm" aria-label={t('viewer.tutorial.skip')} onClick={closeTutorial}>
            <X aria-hidden />
          </Button>
        </div>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">{t(step.descriptionKey)}</p>

        <Progress className="mt-4" size="sm" value={progress} />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <Button type="button" variant="outline" size="sm" onClick={playCurrentAudio}>
            <SpeakerHigh aria-hidden />
            {t('viewer.tutorial.replayAudio')}
          </Button>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label={t('viewer.tutorial.previous')}
              disabled={isFirstStep}
              onClick={() => setCurrentIndex((index) => Math.max(index - 1, 0))}
            >
              <ArrowLeft aria-hidden />
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                if (isLastStep) {
                  closeTutorial()
                  return
                }

                setCurrentIndex((index) => Math.min(index + 1, steps.length - 1))
              }}
            >
              {isLastStep ? t('viewer.tutorial.finish') : t('viewer.tutorial.next')}
              {!isLastStep ? <ArrowRight aria-hidden /> : null}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
