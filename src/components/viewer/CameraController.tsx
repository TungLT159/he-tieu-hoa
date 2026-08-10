import { OrbitControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useCallback, useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

import { ORGAN_LIST } from './organConfig'
import { useViewer } from './viewerContext'

const DEFAULT_POSITION = new THREE.Vector3(0, 2, 8)
const DEFAULT_TARGET = new THREE.Vector3(0, 0.5, 0)
const DEFAULT_CAMERA_OFFSET = new THREE.Vector3(0, 0.4, 1)
const ORGAN_CAMERA_OFFSETS = new Map<string, THREE.Vector3>([
  ['tuy', new THREE.Vector3(0, 0.4, -1)],
])
const FLY_DURATION = 1.0
const TOUR_STOP_DURATION_MS = 3000
const TOUR_ORGAN_ORDER = [
  'mieng',
  'thuc_quan',
  'da_day',
  'ruot_non',
  'ruot_gia',
  'gan',
  'tui_mat',
  'tuy',
] as const satisfies ReadonlyArray<(typeof ORGAN_LIST)[number]['nodeName']>

export function CameraController() {
  const { camera } = useThree()
  const {
    selectedOrgan,
    setSelectedOrgan,
    organNodes,
    cameraTarget,
    setCameraTarget,
    isTransitioning,
    setIsTransitioning,
    resetViewVersion,
    flyCameraActive,
    setFlyCameraActive,
  } = useViewer()
  const controlsRef = useRef<OrbitControlsImpl | null>(null)
  const lerpStart = useRef(0)
  const startPosition = useRef(DEFAULT_POSITION.clone())
  const endPosition = useRef(DEFAULT_POSITION.clone())
  const startTarget = useRef(DEFAULT_TARGET.clone())
  const endTarget = useRef(DEFAULT_TARGET.clone())
  const handledResetViewVersion = useRef(resetViewVersion)
  const tourStep = useRef<number | null>(null)
  const tourSelectedOrgan = useRef<string | null>(null)

  const animateCamera = useCallback(
    (target: 'overview' | string) => {
      const controls = controlsRef.current
      startPosition.current.copy(camera.position)
      startTarget.current.copy(controls?.target ?? DEFAULT_TARGET)

      const selectedNodes = target === 'overview' ? undefined : organNodes.get(target)
      if (selectedNodes?.length) {
        const box = new THREE.Box3()
        selectedNodes.forEach((selectedNode) => box.expandByObject(selectedNode))
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())
        const maxDimension = Math.max(size.x, size.y, size.z)
        const distance = Math.max(maxDimension * 2.5, 3)
        const cameraOffset = ORGAN_CAMERA_OFFSETS.get(target) ?? DEFAULT_CAMERA_OFFSET

        endTarget.current.copy(center)
        endPosition.current.set(
          center.x + distance * cameraOffset.x,
          center.y + distance * cameraOffset.y,
          center.z + distance * cameraOffset.z,
        )
      } else {
        endPosition.current.copy(DEFAULT_POSITION)
        endTarget.current.copy(DEFAULT_TARGET)
      }

      lerpStart.current = performance.now() / 1000
      setIsTransitioning(true)
    },
    [camera.position, organNodes, setIsTransitioning],
  )

  useEffect(() => {
    if (resetViewVersion !== handledResetViewVersion.current) return

    const nextTarget = selectedOrgan ?? 'overview'
    if (nextTarget !== 'overview' && !organNodes.get(nextTarget)?.length) return
    if (nextTarget === cameraTarget) return

    setCameraTarget(nextTarget)
    animateCamera(nextTarget)
  }, [animateCamera, cameraTarget, organNodes, resetViewVersion, selectedOrgan, setCameraTarget])

  useEffect(() => {
    if (resetViewVersion === handledResetViewVersion.current) return

    tourStep.current = null
    tourSelectedOrgan.current = null
    if (flyCameraActive) setFlyCameraActive(false)
    handledResetViewVersion.current = resetViewVersion
    if (selectedOrgan) setSelectedOrgan(null)
    if (cameraTarget !== 'overview') setCameraTarget('overview')
    animateCamera('overview')
  }, [
    animateCamera,
    cameraTarget,
    flyCameraActive,
    resetViewVersion,
    selectedOrgan,
    setCameraTarget,
    setFlyCameraActive,
    setSelectedOrgan,
  ])

  useEffect(() => {
    if (!flyCameraActive) {
      tourStep.current = null
      tourSelectedOrgan.current = null
      return
    }

    if (tourStep.current === null) {
      tourStep.current = 0
      const firstOrgan = TOUR_ORGAN_ORDER[0]
      tourSelectedOrgan.current = firstOrgan
      setSelectedOrgan(firstOrgan)
      return
    }

    if (selectedOrgan !== tourSelectedOrgan.current) {
      tourStep.current = null
      tourSelectedOrgan.current = null
      setFlyCameraActive(false)
    }
  }, [flyCameraActive, selectedOrgan, setFlyCameraActive, setSelectedOrgan])

  useEffect(() => {
    if (!flyCameraActive || tourStep.current === null) return undefined

    const timeoutId = window.setTimeout(() => {
      const nextStep = (tourStep.current ?? 0) + 1

      if (nextStep >= TOUR_ORGAN_ORDER.length) {
        tourStep.current = null
        tourSelectedOrgan.current = null
        setSelectedOrgan(null)
        setCameraTarget('overview')
        animateCamera('overview')
        setFlyCameraActive(false)
        return
      }

      tourStep.current = nextStep
      const nextOrgan = TOUR_ORGAN_ORDER[nextStep]
      tourSelectedOrgan.current = nextOrgan
      setSelectedOrgan(nextOrgan)
    }, TOUR_STOP_DURATION_MS)

    return () => window.clearTimeout(timeoutId)
  }, [animateCamera, flyCameraActive, selectedOrgan, setCameraTarget, setFlyCameraActive, setSelectedOrgan])

  useFrame(() => {
    if (!isTransitioning) return

    const controls = controlsRef.current
    const elapsed = performance.now() / 1000 - lerpStart.current
    const t = Math.min(elapsed / FLY_DURATION, 1)
    const easedT = t * t * (3 - 2 * t)

    camera.position.lerpVectors(startPosition.current, endPosition.current, easedT)
    controls?.target.lerpVectors(startTarget.current, endTarget.current, easedT)
    controls?.update()

    if (t >= 1) setIsTransitioning(false)
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enabled={!isTransitioning}
      target={DEFAULT_TARGET.toArray()}
      minDistance={1}
      maxDistance={20}
      makeDefault
    />
  )
}
