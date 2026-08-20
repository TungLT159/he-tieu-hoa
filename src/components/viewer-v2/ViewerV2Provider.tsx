import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type * as THREE from 'three'

import { DEFAULT_NARRATION_VOICE } from '@/lib/narrationVoice'

import { ViewerV2Context } from './viewerV2Context'
import type { ActiveDialog, ActiveSheet, AnnotationTool, QualityPreset, ViewMode, VoiceOption } from './viewerV2Context'

interface ViewerV2ProviderProps {
  children: ReactNode
  initialVoice?: VoiceOption
  onVoiceChange?: (voice: VoiceOption) => void
}

export function ViewerV2Provider({
  children,
  initialVoice = DEFAULT_NARRATION_VOICE,
  onVoiceChange,
}: ViewerV2ProviderProps) {
  const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null)
  const [organNodes, setOrganNodes] = useState(() => new Map<string, THREE.Mesh[]>())
  const [cameraTarget, setCameraTarget] = useState('overview')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isModelLoaded, setIsModelLoaded] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [resetViewVersion, setResetViewVersion] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(true)
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(null)
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawColor, setDrawColor] = useState('#ff0000')
  const [backgroundColor, setBackgroundColor] = useState('#1a1a2e')
  const [modelColor, setModelColor] = useState<string | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [flyCameraActive, setFlyCameraActive] = useState(false)
  const [flyCameraPaused, setFlyCameraPaused] = useState(false)
  const [flyCameraOrganPopup, setFlyCameraOrganPopup] = useState<string | null>(null)
  const [qualityPreset, setQualityPreset] = useState<QualityPreset>('high')
  const [volume, setVolume] = useState(80)
  const [voice, setVoiceState] = useState<VoiceOption>(initialVoice)
  const [annotationTool, setAnnotationTool] = useState<AnnotationTool>('pen')
  const [viewMode, setViewMode] = useState<ViewMode>('3d')

  useEffect(() => {
    setVoiceState(initialVoice)
  }, [initialVoice])

  const setVoice = useCallback((nextVoice: VoiceOption) => {
    setVoiceState(nextVoice)
    onVoiceChange?.(nextVoice)
  }, [onVoiceChange])

  const registerOrganNode = useCallback((name: string, mesh: THREE.Mesh) => {
    setOrganNodes((currentNodes) => {
      const meshes = currentNodes.get(name) ?? []
      if (meshes.includes(mesh)) return currentNodes

      const nextNodes = new Map(currentNodes)
      nextNodes.set(name, [...meshes, mesh])
      return nextNodes
    })
  }, [])

  const unregisterOrganNode = useCallback((name: string, mesh: THREE.Mesh) => {
    setOrganNodes((currentNodes) => {
      const meshes = currentNodes.get(name)
      if (!meshes?.includes(mesh)) return currentNodes

      const nextNodes = new Map(currentNodes)
      const remainingMeshes = meshes.filter((entry) => entry !== mesh)
      if (remainingMeshes.length === 0) {
        nextNodes.delete(name)
      } else {
        nextNodes.set(name, remainingMeshes)
      }

      return nextNodes
    })
  }, [])

  const requestViewReset = useCallback(() => {
    setSelectedOrgan(null)
    setResetViewVersion((v) => v + 1)
  }, [])

  return (
    <ViewerV2Context.Provider
      value={{
        selectedOrgan,
        setSelectedOrgan,
        organNodes,
        registerOrganNode,
        unregisterOrganNode,
        cameraTarget,
        setCameraTarget,
        isTransitioning,
        setIsTransitioning,
        isModelLoaded,
        setIsModelLoaded,
        loadError,
        setLoadError,
        resetViewVersion,
        requestViewReset,
        isMenuOpen,
        setIsMenuOpen,
        activeSheet,
        setActiveSheet,
        activeDialog,
        setActiveDialog,
        isFullscreen,
        setIsFullscreen,
        isDrawing,
        setIsDrawing,
        drawColor,
        setDrawColor,
        backgroundColor,
        setBackgroundColor,
        modelColor,
        setModelColor,
        isSpinning,
        setIsSpinning,
        flyCameraActive,
        setFlyCameraActive,
        flyCameraPaused,
        setFlyCameraPaused,
        flyCameraOrganPopup,
        setFlyCameraOrganPopup,
        qualityPreset,
        setQualityPreset,
        volume,
        setVolume,
        voice,
        setVoice,
        annotationTool,
        setAnnotationTool,
        viewMode,
        setViewMode,
      }}
    >
      {children}
    </ViewerV2Context.Provider>
  )
}
