import { createContext, useContext } from 'react'
import type * as THREE from 'three'

export type ActiveSheet = 'chatbot' | 'settings' | 'video' | null
export type ActiveDialog = 'info' | 'quiz' | 'genai' | 'video' | null

export type QualityPreset = 'low' | 'medium' | 'high'
export type VoiceOption = 'bac' | 'trung' | 'nam'
export type AnnotationTool = 'pen' | 'eraser'

export interface ViewerV2ContextValue {
  selectedOrgan: string | null
  setSelectedOrgan: (name: string | null) => void
  organNodes: Map<string, THREE.Mesh[]>
  registerOrganNode: (name: string, mesh: THREE.Mesh) => void
  unregisterOrganNode: (name: string, mesh: THREE.Mesh) => void
  cameraTarget: string
  setCameraTarget: (target: string) => void
  isTransitioning: boolean
  setIsTransitioning: (v: boolean) => void
  isModelLoaded: boolean
  setIsModelLoaded: (v: boolean) => void
  loadError: string | null
  setLoadError: (err: string | null) => void
  resetViewVersion: number
  requestViewReset: () => void
  isMenuOpen: boolean
  setIsMenuOpen: (open: boolean) => void
  activeSheet: ActiveSheet
  setActiveSheet: (sheet: ActiveSheet) => void
  activeDialog: ActiveDialog
  setActiveDialog: (dialog: ActiveDialog) => void
  isFullscreen: boolean
  setIsFullscreen: (v: boolean) => void
  isDrawing: boolean
  setIsDrawing: (v: boolean) => void
  drawColor: string
  setDrawColor: (color: string) => void
  backgroundColor: string
  setBackgroundColor: (color: string) => void
  modelColor: string | null
  setModelColor: (color: string | null) => void
  isSpinning: boolean
  setIsSpinning: (v: boolean) => void
  flyCameraActive: boolean
  setFlyCameraActive: (v: boolean) => void
  flyCameraPaused: boolean
  setFlyCameraPaused: (v: boolean) => void
  flyCameraOrganPopup: string | null
  setFlyCameraOrganPopup: (organ: string | null) => void
  qualityPreset: QualityPreset
  setQualityPreset: (q: QualityPreset) => void
  volume: number
  setVolume: (v: number) => void
  voice: VoiceOption
  setVoice: (v: VoiceOption) => void
  annotationTool: AnnotationTool
  setAnnotationTool: (tool: AnnotationTool) => void
}

export const ViewerV2Context = createContext<ViewerV2ContextValue | null>(null)

export function useViewerV2(): ViewerV2ContextValue {
  const value = useContext(ViewerV2Context)
  if (!value) throw new Error('useViewerV2 must be used within ViewerV2Provider')
  return value
}
