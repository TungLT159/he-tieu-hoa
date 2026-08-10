import { useCallback, useState } from 'react'
import type { ReactNode } from 'react'
import type * as THREE from 'three'

import { ViewerContext } from './viewerContext'
import type { ActiveDialog, ActiveSheet, ViewerMeshDebugInfo } from './viewerContext'

interface ViewerProviderProps {
  children: ReactNode
}

export function ViewerProvider({ children }: ViewerProviderProps) {
  const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null)
  const [organNodes, setOrganNodes] = useState(() => new Map<string, THREE.Mesh[]>())
  const [modelMeshes, setModelMeshes] = useState<ViewerMeshDebugInfo[]>([])
  const [lastClickedMeshName, setLastClickedMeshName] = useState<string | null>(null)
  const [isDebugPanelOpen, setIsDebugPanelOpen] = useState(false)
  const [cameraTarget, setCameraTarget] = useState<'overview' | string>('overview')
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

  const registerOrganNode = useCallback((name: string, mesh: THREE.Mesh) => {
    setOrganNodes((currentNodes) => {
      const meshes = currentNodes.get(name) ?? []
      if (meshes.includes(mesh)) return currentNodes

      const nextNodes = new Map(currentNodes)
      nextNodes.set(name, [...meshes, mesh])
      return nextNodes
    })
  }, [])

  const registerModelMesh = useCallback((mesh: ViewerMeshDebugInfo) => {
    setModelMeshes((currentMeshes) => [
      ...currentMeshes.filter((currentMesh) => currentMesh.meshUuid !== mesh.meshUuid),
      mesh,
    ])
  }, [])

  const requestViewReset = useCallback(() => {
    setSelectedOrgan(null)
    setResetViewVersion((version) => version + 1)
  }, [])

  return (
    <ViewerContext.Provider
      value={{
        selectedOrgan,
        setSelectedOrgan,
        organNodes,
        registerOrganNode,
        modelMeshes,
        registerModelMesh,
        lastClickedMeshName,
        setLastClickedMeshName,
        isDebugPanelOpen,
        setIsDebugPanelOpen,
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
      }}
    >
      {children}
    </ViewerContext.Provider>
  )
}
