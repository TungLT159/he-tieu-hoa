import { OrbitControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useCallback, useEffect, useRef } from 'react'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

import { useViewerV2 } from '../viewerV2Context'
import {
  computeCameraDestination,
  DEFAULT_POSITION,
  DEFAULT_TARGET,
  easeSmoothstep,
} from './cameraMath'
const FLY_DURATION = 1.0

export function CameraController() {
  const { camera } = useThree()
  const {
    cameraTarget,
    flyCameraActive,
    isSpinning,
    isTransitioning,
    organNodes,
    resetViewVersion,
    selectedOrgan,
    setCameraTarget,
    setFlyCameraActive,
    setIsTransitioning,
    setSelectedOrgan,
  } = useViewerV2()
  const controlsRef = useRef<OrbitControlsImpl | null>(null)
  const lerpStart = useRef(0)
  const startPosition = useRef(DEFAULT_POSITION.clone())
  const endPosition = useRef(DEFAULT_POSITION.clone())
  const startTarget = useRef(DEFAULT_TARGET.clone())
  const endTarget = useRef(DEFAULT_TARGET.clone())
  const handledResetViewVersion = useRef(resetViewVersion)

  const animateCamera = useCallback(
    (target: string) => {
      const controls = controlsRef.current
      const destination = computeCameraDestination(target, organNodes)

      startPosition.current.copy(camera.position)
      startTarget.current.copy(controls?.target ?? DEFAULT_TARGET)
      endPosition.current.copy(destination.position)
      endTarget.current.copy(destination.target)
      lerpStart.current = performance.now() / 1000
      setIsTransitioning(true)
    },
    [camera.position, organNodes, setIsTransitioning],
  )

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return

    controls.target.copy(DEFAULT_TARGET)
    controls.update()
  }, [])

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

  useFrame(() => {
    if (!isTransitioning) return

    const controls = controlsRef.current
    const elapsed = performance.now() / 1000 - lerpStart.current
    const t = Math.min(elapsed / FLY_DURATION, 1)
    const easedT = easeSmoothstep(t)

    camera.position.lerpVectors(startPosition.current, endPosition.current, easedT)
    controls?.target.lerpVectors(startTarget.current, endTarget.current, easedT)
    controls?.update()

    if (t >= 1) {
      controls?.target.copy(endTarget.current)
      controls?.update()
      setIsTransitioning(false)
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      autoRotate={isSpinning && !isTransitioning}
      autoRotateSpeed={1.0}
      enabled={!isTransitioning}
      minDistance={1}
      maxDistance={20}
      makeDefault
    />
  )
}
