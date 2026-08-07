import { useCallback, useEffect, useRef } from 'react'

import { useViewerV2 } from '../viewerV2Context'

export const TOUR_ORGAN_ORDER = [
  'mieng',
  'thuc_quan',
  'da_day',
  'ruot_non',
  'ruot_gia',
  'gan',
  'tui_mat',
  'tuy',
] as const

export function AutoTourController() {
  const {
    flyCameraActive,
    flyCameraOrganPopup,
    flyCameraPaused,
    isTransitioning,
    selectedOrgan,
    setCameraTarget,
    setFlyCameraActive,
    setFlyCameraOrganPopup,
    setFlyCameraPaused,
    setSelectedOrgan,
  } = useViewerV2()
  const tourStep = useRef<number | null>(null)
  const tourSelectedOrgan = useRef<string | null>(null)
  const isSettingTourSelection = useRef(false)

  const resetTour = useCallback(() => {
    tourStep.current = null
    tourSelectedOrgan.current = null
    isSettingTourSelection.current = false
    setFlyCameraPaused(false)
    setFlyCameraOrganPopup(null)
  }, [setFlyCameraOrganPopup, setFlyCameraPaused])

  const advanceTour = useCallback(() => {
    if (!flyCameraActive || !flyCameraPaused || flyCameraOrganPopup !== tourSelectedOrgan.current) return

    setFlyCameraPaused(false)
    setFlyCameraOrganPopup(null)

    const nextStep = (tourStep.current ?? 0) + 1

    if (nextStep >= TOUR_ORGAN_ORDER.length) {
      resetTour()
      setSelectedOrgan(null)
      setCameraTarget('overview')
      setFlyCameraActive(false)
      return
    }

    const nextOrgan = TOUR_ORGAN_ORDER[nextStep]
    tourStep.current = nextStep
    tourSelectedOrgan.current = nextOrgan
    isSettingTourSelection.current = true
    setSelectedOrgan(nextOrgan)
  }, [flyCameraActive, flyCameraOrganPopup, flyCameraPaused, resetTour, setCameraTarget, setFlyCameraActive, setFlyCameraOrganPopup, setFlyCameraPaused, setSelectedOrgan])

  useEffect(() => {
    if (!flyCameraActive) {
      resetTour()
      return
    }

    if (isSettingTourSelection.current) {
      if (selectedOrgan !== tourSelectedOrgan.current) return
      if (isTransitioning) return
      isSettingTourSelection.current = false
      setFlyCameraPaused(true)
      setFlyCameraOrganPopup(tourSelectedOrgan.current)
      return
    }

    if (tourStep.current === null) {
      const firstOrgan = TOUR_ORGAN_ORDER[0]
      tourStep.current = 0
      tourSelectedOrgan.current = firstOrgan
      isSettingTourSelection.current = true
      setSelectedOrgan(firstOrgan)
      return
    }

    if (selectedOrgan !== tourSelectedOrgan.current) {
      resetTour()
      setFlyCameraActive(false)
    }
  }, [flyCameraActive, isTransitioning, resetTour, selectedOrgan, setFlyCameraActive, setFlyCameraOrganPopup, setFlyCameraPaused, setSelectedOrgan])

  useEffect(() => {
    if (!flyCameraActive) return undefined

    window.addEventListener('flycamera-advance', advanceTour)

    return () => window.removeEventListener('flycamera-advance', advanceTour)
  }, [advanceTour, flyCameraActive])

  return null
}
