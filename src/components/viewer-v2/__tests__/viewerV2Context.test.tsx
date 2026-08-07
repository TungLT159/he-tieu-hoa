import { renderHook } from '@testing-library/react'
import { act } from 'react'
import * as THREE from 'three'
import { describe, expect, it } from 'vitest'

import { ViewerV2Provider } from '../ViewerV2Provider'
import { useViewerV2 } from '../viewerV2Context'

describe('ViewerV2Context', () => {
  it('provides default selectedOrgan as null', () => {
    const { result } = renderHook(() => useViewerV2(), {
      wrapper: ViewerV2Provider,
    })
    expect(result.current.selectedOrgan).toBeNull()
  })

  it('setSelectedOrgan updates the organ', () => {
    const { result } = renderHook(() => useViewerV2(), {
      wrapper: ViewerV2Provider,
    })
    act(() => {
      result.current.setSelectedOrgan('da_day')
    })
    expect(result.current.selectedOrgan).toBe('da_day')
  })

  it('provides default isModelLoaded as false', () => {
    const { result } = renderHook(() => useViewerV2(), {
      wrapper: ViewerV2Provider,
    })
    expect(result.current.isModelLoaded).toBe(false)
  })

  it('provides default cameraTarget as overview', () => {
    const { result } = renderHook(() => useViewerV2(), {
      wrapper: ViewerV2Provider,
    })
    expect(result.current.cameraTarget).toBe('overview')
  })

  it('registerOrganNode adds the same mesh for the same organ only once', () => {
    const { result } = renderHook(() => useViewerV2(), {
      wrapper: ViewerV2Provider,
    })
    const mockMesh = { uuid: 'test-uuid' } as THREE.Mesh
    act(() => {
      result.current.registerOrganNode('da_day', mockMesh)
      result.current.registerOrganNode('da_day', mockMesh)
    })
    expect(result.current.organNodes.get('da_day')).toEqual([mockMesh])
  })

  it('unregisterOrganNode removes a mesh while keeping other meshes for the organ', () => {
    const { result } = renderHook(() => useViewerV2(), {
      wrapper: ViewerV2Provider,
    })
    const firstMesh = { uuid: 'first-uuid' } as THREE.Mesh
    const secondMesh = { uuid: 'second-uuid' } as THREE.Mesh

    act(() => {
      result.current.registerOrganNode('da_day', firstMesh)
      result.current.registerOrganNode('da_day', secondMesh)
      result.current.unregisterOrganNode('da_day', firstMesh)
    })

    expect(result.current.organNodes.get('da_day')).toEqual([secondMesh])
  })

  it('unregisterOrganNode removes the organ key when its last mesh is removed', () => {
    const { result } = renderHook(() => useViewerV2(), {
      wrapper: ViewerV2Provider,
    })
    const mesh = { uuid: 'test-uuid' } as THREE.Mesh

    act(() => {
      result.current.registerOrganNode('da_day', mesh)
      result.current.unregisterOrganNode('da_day', mesh)
    })

    expect(result.current.organNodes.has('da_day')).toBe(false)
  })

  it('requestViewReset increments resetViewVersion and clears selectedOrgan', () => {
    const { result } = renderHook(() => useViewerV2(), {
      wrapper: ViewerV2Provider,
    })
    act(() => {
      result.current.setSelectedOrgan('da_day')
    })
    const v1 = result.current.resetViewVersion
    act(() => {
      result.current.requestViewReset()
    })
    expect(result.current.resetViewVersion).toBeGreaterThan(v1)
    expect(result.current.selectedOrgan).toBeNull()
  })

  it('defaults background to #1a1a2e and modelColor to null', () => {
    const { result } = renderHook(() => useViewerV2(), {
      wrapper: ViewerV2Provider,
    })
    expect(result.current.backgroundColor).toBe('#1a1a2e')
    expect(result.current.modelColor).toBeNull()
  })

  it('default menu and dialog states are null/false', () => {
    const { result } = renderHook(() => useViewerV2(), {
      wrapper: ViewerV2Provider,
    })
    expect(result.current.activeSheet).toBeNull()
    expect(result.current.activeDialog).toBeNull()
    expect(result.current.isMenuOpen).toBe(true)
    expect(result.current.isSpinning).toBe(false)
    expect(result.current.flyCameraActive).toBe(false)
  })

  it('defaults qualityPreset to medium', () => {
    const { result } = renderHook(() => useViewerV2(), {
      wrapper: ViewerV2Provider,
    })
    expect(result.current.qualityPreset).toBe('medium')
  })

  it('defaults volume to 80', () => {
    const { result } = renderHook(() => useViewerV2(), {
      wrapper: ViewerV2Provider,
    })
    expect(result.current.volume).toBe(80)
  })

  it('defaults voice to bac', () => {
    const { result } = renderHook(() => useViewerV2(), {
      wrapper: ViewerV2Provider,
    })
    expect(result.current.voice).toBe('bac')
  })

  it('defaults annotationTool to pen', () => {
    const { result } = renderHook(() => useViewerV2(), {
      wrapper: ViewerV2Provider,
    })
    expect(result.current.annotationTool).toBe('pen')
  })

  it('defaults flyCameraOrganPopup to null', () => {
    const { result } = renderHook(() => useViewerV2(), {
      wrapper: ViewerV2Provider,
    })
    expect(result.current.flyCameraOrganPopup).toBeNull()
  })

  it('defaults flyCameraPaused to false', () => {
    const { result } = renderHook(() => useViewerV2(), {
      wrapper: ViewerV2Provider,
    })
    expect(result.current.flyCameraPaused).toBe(false)
  })

})
