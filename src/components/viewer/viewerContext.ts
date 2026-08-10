import { createContext, useContext } from 'react'
import type * as THREE from 'three'

export interface ViewerMeshDebugInfo {
  meshUuid: string
  meshName: string
  organName: string | null
  vertexCount: number
  isSelectable: boolean
  isEmpty: boolean
}

export type ActiveSheet = 'chatbot' | 'settings' | null
export type ActiveDialog = 'info' | 'quiz' | 'genai' | 'video' | null

export interface ViewerContextValue {
  selectedOrgan: string | null
  setSelectedOrgan: (name: string | null) => void
  organNodes: Map<string, THREE.Mesh[]>
  registerOrganNode: (name: string, mesh: THREE.Mesh) => void
  modelMeshes: ViewerMeshDebugInfo[]
  registerModelMesh: (mesh: ViewerMeshDebugInfo) => void
  lastClickedMeshName: string | null
  setLastClickedMeshName: (meshName: string | null) => void
  isDebugPanelOpen: boolean
  setIsDebugPanelOpen: (isOpen: boolean) => void
  cameraTarget: 'overview' | string
  setCameraTarget: (target: 'overview' | string) => void
  isTransitioning: boolean
  setIsTransitioning: (isTransitioning: boolean) => void
  isModelLoaded: boolean
  setIsModelLoaded: (isModelLoaded: boolean) => void
  loadError: string | null
  setLoadError: (loadError: string | null) => void
  resetViewVersion: number
  requestViewReset: () => void
  isMenuOpen: boolean
  setIsMenuOpen: (open: boolean) => void
  activeSheet: ActiveSheet
  setActiveSheet: (sheet: ActiveSheet) => void
  activeDialog: ActiveDialog
  setActiveDialog: (dialog: ActiveDialog) => void
  isFullscreen: boolean
  setIsFullscreen: (fullscreen: boolean) => void
  isDrawing: boolean
  setIsDrawing: (drawing: boolean) => void
  drawColor: string
  setDrawColor: (color: string) => void
  backgroundColor: string
  setBackgroundColor: (color: string) => void
  modelColor: string | null
  setModelColor: (color: string | null) => void
  isSpinning: boolean
  setIsSpinning: (spinning: boolean) => void
  flyCameraActive: boolean
  setFlyCameraActive: (active: boolean) => void
}

export const ViewerContext = createContext<ViewerContextValue | null>(null)

export function useViewer(): ViewerContextValue {
  const value = useContext(ViewerContext)
  if (!value) throw new Error('useViewer must be used within ViewerProvider')
  return value
}
