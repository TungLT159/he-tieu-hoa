import { render } from '@testing-library/react'
import type { ReactNode } from 'react'
import * as THREE from 'three'
import { describe, expect, it, vi } from 'vitest'

import { OrganHighlighter } from '../OrganHighlighter'
import { ViewerContext } from '../viewerContext'
import type { ViewerContextValue } from '../viewerContext'

function createViewerTree(children: ReactNode, overrides: Partial<ViewerContextValue> = {}) {
  return (
    <ViewerContext.Provider
      value={{
        selectedOrgan: null,
        setSelectedOrgan: vi.fn(),
        organNodes: new Map(),
        registerOrganNode: vi.fn(),
        modelMeshes: [],
        registerModelMesh: vi.fn(),
        lastClickedMeshName: null,
        setLastClickedMeshName: vi.fn(),
        isDebugPanelOpen: false,
        setIsDebugPanelOpen: vi.fn(),
        cameraTarget: 'overview',
        setCameraTarget: vi.fn(),
        isTransitioning: false,
        setIsTransitioning: vi.fn(),
        isModelLoaded: false,
        setIsModelLoaded: vi.fn(),
        loadError: null,
        setLoadError: vi.fn(),
        resetViewVersion: 0,
        requestViewReset: vi.fn(),
        ...overrides,
      }}
    >
      {children}
    </ViewerContext.Provider>
  )
}

function renderWithViewer(children: ReactNode, overrides: Partial<ViewerContextValue> = {}) {
  return render(createViewerTree(children, overrides))
}

describe('OrganHighlighter', () => {
  it('highlights the selected organ with cloned emissive materials', () => {
    const selectedMaterial = new THREE.MeshStandardMaterial()
    const idleMaterial = new THREE.MeshStandardMaterial()
    const selectedMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), selectedMaterial)
    const idleMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), idleMaterial)

    renderWithViewer(<OrganHighlighter />, {
      selectedOrgan: 'stomach',
      organNodes: new Map([
        ['stomach', [selectedMesh]],
        ['liver', [idleMesh]],
      ]),
    })

    expect(selectedMesh.material).not.toBe(selectedMaterial)
    expect(selectedMesh.material).toBeInstanceOf(THREE.MeshStandardMaterial)
    expect((selectedMesh.material as THREE.MeshStandardMaterial).emissive.getHex()).toBe(0x44ff88)
    expect((selectedMesh.material as THREE.MeshStandardMaterial).emissiveIntensity).toBe(0.6)
    expect(idleMesh.material).toBe(idleMaterial)
  })

  it('highlights every mesh in the selected organ group', () => {
    const firstMaterial = new THREE.MeshStandardMaterial()
    const secondMaterial = new THREE.MeshStandardMaterial()
    const idleMaterial = new THREE.MeshStandardMaterial()
    const firstMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), firstMaterial)
    const secondMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), secondMaterial)
    const idleMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), idleMaterial)

    renderWithViewer(<OrganHighlighter />, {
      selectedOrgan: 'stomach',
      organNodes: new Map([
        ['stomach', [firstMesh, secondMesh]],
        ['liver', [idleMesh]],
      ]),
    })

    expect(firstMesh.material).not.toBe(firstMaterial)
    expect(secondMesh.material).not.toBe(secondMaterial)
    expect((firstMesh.material as THREE.MeshStandardMaterial).emissive.getHex()).toBe(0x44ff88)
    expect((secondMesh.material as THREE.MeshStandardMaterial).emissive.getHex()).toBe(0x44ff88)
    expect(idleMesh.material).toBe(idleMaterial)
  })

  it('highlights every emissive material in a material array', () => {
    const firstMaterial = new THREE.MeshStandardMaterial()
    const secondMaterial = new THREE.MeshStandardMaterial()
    const originalMaterials = [firstMaterial, secondMaterial]
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), originalMaterials)

    renderWithViewer(<OrganHighlighter />, {
      selectedOrgan: 'stomach',
      organNodes: new Map([['stomach', [mesh]]]),
    })

    expect(mesh.material).not.toBe(originalMaterials)
    expect(Array.isArray(mesh.material)).toBe(true)
    const highlightedMaterials = mesh.material as THREE.MeshStandardMaterial[]
    expect(highlightedMaterials[0]).not.toBe(firstMaterial)
    expect(highlightedMaterials[1]).not.toBe(secondMaterial)
    expect(highlightedMaterials[0].emissive.getHex()).toBe(0x44ff88)
    expect(highlightedMaterials[1].emissive.getHex()).toBe(0x44ff88)
    expect(highlightedMaterials[0].emissiveIntensity).toBe(0.6)
    expect(highlightedMaterials[1].emissiveIntensity).toBe(0.6)
  })

  it('clones non-emissive materials without crashing', () => {
    const material = new THREE.MeshBasicMaterial()
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material)

    renderWithViewer(<OrganHighlighter />, {
      selectedOrgan: 'stomach',
      organNodes: new Map([['stomach', [mesh]]]),
    })

    expect(mesh.material).not.toBe(material)
    expect(mesh.material).toBeInstanceOf(THREE.MeshBasicMaterial)
  })

  it('restores originals and disposes highlighted clones on deselection', () => {
    const material = new THREE.MeshStandardMaterial()
    const disposeOriginal = vi.spyOn(material, 'dispose')
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material)
    const organNodes = new Map([['stomach', [mesh]]])
    const { rerender } = renderWithViewer(<OrganHighlighter />, {
      selectedOrgan: 'stomach',
      organNodes,
    })
    const highlightedMaterial = mesh.material as THREE.MeshStandardMaterial
    const disposeHighlighted = vi.spyOn(highlightedMaterial, 'dispose')

    rerender(createViewerTree(<OrganHighlighter />, { selectedOrgan: null, organNodes }))

    expect(mesh.material).toBe(material)
    expect(disposeHighlighted).toHaveBeenCalledTimes(1)
    expect(disposeOriginal).not.toHaveBeenCalled()
  })

  it('restores generated viewer base material on normal deselection', () => {
    const importedMaterial = new THREE.MeshBasicMaterial()
    const generatedMaterial = new THREE.MeshStandardMaterial()
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), generatedMaterial)
    mesh.userData.viewerOriginalMaterial = importedMaterial
    mesh.userData.viewerBaseMaterial = generatedMaterial
    const organNodes = new Map([['stomach', [mesh]]])
    const { rerender } = renderWithViewer(<OrganHighlighter />, {
      selectedOrgan: 'stomach',
      organNodes,
    })
    const highlightedMaterial = mesh.material as THREE.MeshStandardMaterial
    const disposeHighlighted = vi.spyOn(highlightedMaterial, 'dispose')

    rerender(createViewerTree(<OrganHighlighter />, { selectedOrgan: null, organNodes }))

    expect(mesh.material).toBe(generatedMaterial)
    expect(mesh.material).not.toBe(importedMaterial)
    expect(disposeHighlighted).toHaveBeenCalledTimes(1)
  })

  it('restores every highlighted mesh in a selected organ group on unmount', () => {
    const firstMaterial = new THREE.MeshStandardMaterial()
    const secondMaterial = new THREE.MeshStandardMaterial()
    const firstMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), firstMaterial)
    const secondMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), secondMaterial)
    const { unmount } = renderWithViewer(<OrganHighlighter />, {
      selectedOrgan: 'stomach',
      organNodes: new Map([['stomach', [firstMesh, secondMesh]]]),
    })
    const firstHighlight = firstMesh.material as THREE.MeshStandardMaterial
    const secondHighlight = secondMesh.material as THREE.MeshStandardMaterial
    const disposeFirstHighlight = vi.spyOn(firstHighlight, 'dispose')
    const disposeSecondHighlight = vi.spyOn(secondHighlight, 'dispose')

    unmount()

    expect(firstMesh.material).toBe(firstMaterial)
    expect(secondMesh.material).toBe(secondMaterial)
    expect(disposeFirstHighlight).toHaveBeenCalledTimes(1)
    expect(disposeSecondHighlight).toHaveBeenCalledTimes(1)
  })

  it('restores the imported model material when highlighter unmounts after model cleanup', () => {
    const importedMaterial = new THREE.MeshBasicMaterial()
    const generatedMaterial = new THREE.MeshStandardMaterial()
    const disposeGenerated = vi.spyOn(generatedMaterial, 'dispose')
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), generatedMaterial)
    mesh.userData.viewerOriginalMaterial = importedMaterial
    mesh.userData.viewerBaseMaterial = generatedMaterial
    const { unmount } = renderWithViewer(<OrganHighlighter />, {
      selectedOrgan: 'stomach',
      organNodes: new Map([['stomach', [mesh]]]),
    })
    const highlightedMaterial = mesh.material as THREE.MeshStandardMaterial
    const disposeHighlighted = vi.spyOn(highlightedMaterial, 'dispose')

    mesh.material = importedMaterial
    mesh.userData.viewerModelRestored = true
    generatedMaterial.dispose()
    unmount()

    expect(mesh.material).toBe(importedMaterial)
    expect(mesh.material).not.toBe(generatedMaterial)
    expect(disposeHighlighted).toHaveBeenCalledTimes(1)
    expect(disposeGenerated).toHaveBeenCalledTimes(1)
  })

  it('disposes old highlighted clones when selection changes repeatedly', () => {
    const stomachMaterial = new THREE.MeshStandardMaterial()
    const liverMaterial = new THREE.MeshStandardMaterial()
    const stomachMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), stomachMaterial)
    const liverMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), liverMaterial)
    const organNodes = new Map([
      ['stomach', [stomachMesh]],
      ['liver', [liverMesh]],
    ])
    const { rerender } = renderWithViewer(<OrganHighlighter />, {
      selectedOrgan: 'stomach',
      organNodes,
    })
    const firstStomachHighlight = stomachMesh.material as THREE.MeshStandardMaterial
    const disposeFirstStomachHighlight = vi.spyOn(firstStomachHighlight, 'dispose')

    rerender(createViewerTree(<OrganHighlighter />, { selectedOrgan: 'liver', organNodes }))
    const firstLiverHighlight = liverMesh.material as THREE.MeshStandardMaterial
    const disposeFirstLiverHighlight = vi.spyOn(firstLiverHighlight, 'dispose')

    rerender(createViewerTree(<OrganHighlighter />, { selectedOrgan: 'stomach', organNodes }))

    expect(disposeFirstStomachHighlight).toHaveBeenCalledTimes(1)
    expect(disposeFirstLiverHighlight).toHaveBeenCalledTimes(1)
    expect(stomachMesh.material).not.toBe(firstStomachHighlight)
    expect(stomachMesh.material).not.toBe(stomachMaterial)
    expect(liverMesh.material).toBe(liverMaterial)
  })
})
