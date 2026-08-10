# Viewer Organ Mapping Debug Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reassign FBX digestive model meshes to the correct clickable organs and add a toggleable viewer debug panel for validating click-to-zoom behavior.

**Architecture:** Keep mesh-to-organ data in `organConfig.ts`, register all loaded FBX meshes in viewer state, and select logical organ ids instead of raw mesh names. Store multi-mesh organs as `Map<string, THREE.Mesh[]>` so highlighting and camera framing operate on the full organ group. Add a local, non-persisted debug panel that reads viewer context and displays mesh mapping evidence.

**Tech Stack:** React 19, TypeScript, Three.js, @react-three/fiber, @react-three/drei, Vitest, Testing Library, existing shadcn/ui `Button` and `Card` primitives, JSON locale catalogs.

---

## File Structure

- Modify `src/components/viewer/organConfig.ts`: own the logical organ list, mesh-name arrays, and lookup helpers.
- Modify `src/components/viewer/viewerContext.ts`: define shared viewer state types, including multi-mesh organ nodes and debug metadata.
- Modify `src/components/viewer/ViewerContext.tsx`: store selected organ, mesh arrays, all model mesh debug rows, last clicked mesh, and debug panel visibility.
- Modify `src/components/viewer/DigestiveModel.tsx`: traverse FBX meshes, register debug metadata, map raw mesh names to logical organ ids, and record clicked mesh names.
- Modify `src/components/viewer/CameraController.tsx`: frame the selected logical organ using all meshes in that organ group.
- Modify `src/components/viewer/OrganHighlighter.tsx`: highlight and restore every mesh in the selected organ group.
- Create `src/components/viewer/ViewerDebugPanel.tsx`: render current selected organ, last clicked mesh, registered mappings, unmapped meshes, and empty meshes.
- Modify `src/components/viewer/ViewerToolbar.tsx`: add a localized debug toggle button.
- Modify `src/components/viewer/ViewerPage.tsx`: render `ViewerDebugPanel` as an overlay.
- Modify `src/lib/locales/en.json` and `src/lib/locales/vi.json`: add labels for debug controls and any new organs.
- Update tests under `src/components/viewer/__tests__/` near the changed components.

---

### Task 1: Organ Config Mapping

**Files:**
- Modify: `src/components/viewer/organConfig.ts`
- Modify: `src/lib/locales/en.json`
- Modify: `src/lib/locales/vi.json`
- Test: `src/components/viewer/__tests__/organConfig.test.ts`

- [ ] **Step 1: Write the failing config tests**

Replace `src/components/viewer/__tests__/organConfig.test.ts` with:

```ts
import { describe, expect, it } from 'vitest'

import { createTranslator } from '@/lib/i18n'
import { ORGAN_LIST, getOrganInfo, getOrganInfoByMeshName } from '../organConfig'

const ACTUAL_FBX_NODE_NAMES = new Set([
  'digestive_system007',
  'digestive_system010',
  'digestive_system',
  'digestive_system001',
  'digestive_system008',
  'digestive_system009',
  'digestive_system002',
  'digestive_system004',
  'digestive_system005',
  'digestive_system003',
  'digestive_system006',
])

describe('organConfig', () => {
  it('maps actual FBX mesh names to selectable organ names', () => {
    expect(ORGAN_LIST.flatMap((organ) => organ.meshNames)).toEqual([
      'digestive_system001',
      'digestive_system003',
      'digestive_system005',
      'digestive_system009',
      'digestive_system008',
      'digestive_system006',
      'digestive_system007',
      'digestive_system010',
      'digestive_system004',
    ])
    expect(ORGAN_LIST.map((organ) => organ.nodeName)).toEqual([
      'da_day',
      'thuc_quan',
      'ruot_non',
      'ruot_gia',
      'gan',
      'tui_mat',
      'tuy',
      'mieng',
    ])
    expect(getOrganInfoByMeshName('digestive_system005')?.nodeName).toBe('thuc_quan')
    expect(getOrganInfoByMeshName('digestive_system003')?.nodeName).toBe('da_day')
    expect(getOrganInfoByMeshName('digestive_system')).toBeUndefined()
    expect(getOrganInfoByMeshName('digestive_system002')).toBeUndefined()
  })

  it('every organ has locale keys and maps to real non-empty FBX mesh names', () => {
    const tEn = createTranslator('en')
    const tVi = createTranslator('vi')

    for (const organ of ORGAN_LIST) {
      expect(organ.nodeName).toBeTruthy()
      expect(organ.meshNames.length).toBeGreaterThan(0)
      for (const meshName of organ.meshNames) {
        expect(ACTUAL_FBX_NODE_NAMES.has(meshName)).toBe(true)
        expect(meshName).not.toBe('digestive_system')
        expect(meshName).not.toBe('digestive_system002')
        expect(getOrganInfoByMeshName(meshName)).toBe(organ)
      }
      expect(organ.displayNameKey).toMatch(/^viewer\.organ\.[^.]+\.name$/)
      expect(organ.descriptionKey).toMatch(/^viewer\.organ\.[^.]+\.description$/)
      expect(tEn(organ.displayNameKey)).not.toBe(organ.displayNameKey)
      expect(tEn(organ.descriptionKey)).not.toBe(organ.descriptionKey)
      expect(tVi(organ.displayNameKey)).not.toBe(organ.displayNameKey)
      expect(tVi(organ.descriptionKey)).not.toBe(organ.descriptionKey)
    }
  })

  it('keeps logical organ ids and raw mesh names unique', () => {
    const organNames = ORGAN_LIST.map((organ) => organ.nodeName)
    const meshNames = ORGAN_LIST.flatMap((organ) => organ.meshNames)

    expect(new Set(organNames).size).toBe(organNames.length)
    expect(new Set(meshNames).size).toBe(meshNames.length)
  })

  it('gets organ info by logical organ id', () => {
    const stomach = getOrganInfo('da_day')

    expect(stomach?.meshNames).toEqual(['digestive_system001', 'digestive_system003'])
    expect(getOrganInfo('nonexistent_organ')).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run the config test to verify it fails**

Run: `pnpm test src/components/viewer/__tests__/organConfig.test.ts`

Expected: FAIL if `meshNames`, `getOrganInfoByMeshName`, or the new locale keys are missing.

- [ ] **Step 3: Implement the mapping helpers**

Replace `src/components/viewer/organConfig.ts` with:

```ts
import type { TranslationKey } from '@/lib/i18n'

export interface OrganInfo {
  nodeName: string
  meshNames: string[]
  displayNameKey: TranslationKey
  descriptionKey: TranslationKey
}

export const ORGAN_LIST: OrganInfo[] = [
  {
    nodeName: 'da_day',
    meshNames: ['digestive_system001', 'digestive_system003'],
    displayNameKey: 'viewer.organ.daDay.name',
    descriptionKey: 'viewer.organ.daDay.description',
  },
  {
    nodeName: 'thuc_quan',
    meshNames: ['digestive_system005'],
    displayNameKey: 'viewer.organ.thucQuan.name',
    descriptionKey: 'viewer.organ.thucQuan.description',
  },
  {
    nodeName: 'ruot_non',
    meshNames: ['digestive_system009'],
    displayNameKey: 'viewer.organ.ruotNon.name',
    descriptionKey: 'viewer.organ.ruotNon.description',
  },
  {
    nodeName: 'ruot_gia',
    meshNames: ['digestive_system008'],
    displayNameKey: 'viewer.organ.ruotGia.name',
    descriptionKey: 'viewer.organ.ruotGia.description',
  },
  {
    nodeName: 'gan',
    meshNames: ['digestive_system006'],
    displayNameKey: 'viewer.organ.gan.name',
    descriptionKey: 'viewer.organ.gan.description',
  },
  {
    nodeName: 'tui_mat',
    meshNames: ['digestive_system007'],
    displayNameKey: 'viewer.organ.tuiMat.name',
    descriptionKey: 'viewer.organ.tuiMat.description',
  },
  {
    nodeName: 'tuy',
    meshNames: ['digestive_system010'],
    displayNameKey: 'viewer.organ.tuy.name',
    descriptionKey: 'viewer.organ.tuy.description',
  },
  {
    nodeName: 'mieng',
    meshNames: ['digestive_system004'],
    displayNameKey: 'viewer.organ.mieng.name',
    descriptionKey: 'viewer.organ.mieng.description',
  },
]

const ORGAN_INFO_BY_NODE_NAME = new Map(ORGAN_LIST.map((organ) => [organ.nodeName, organ]))
const ORGAN_INFO_BY_MESH_NAME = new Map(
  ORGAN_LIST.flatMap((organ) => organ.meshNames.map((meshName) => [meshName, organ] as const)),
)

export const ORGAN_NODE_NAMES = new Set(ORGAN_LIST.flatMap((organ) => organ.meshNames))

export function getOrganInfo(nodeName: string): OrganInfo | undefined {
  return ORGAN_INFO_BY_NODE_NAME.get(nodeName)
}

export function getOrganInfoByMeshName(meshName: string): OrganInfo | undefined {
  return ORGAN_INFO_BY_MESH_NAME.get(meshName)
}
```

- [ ] **Step 4: Add locale entries**

In `src/lib/locales/en.json`, keep existing viewer organ keys and add these entries near the other `viewer.organ.*` keys:

```json
"viewer.organ.thucQuan.name": "Esophagus",
"viewer.organ.thucQuan.description": "The esophagus is a muscular tube connecting the throat to the stomach, transporting food via peristalsis.",
"viewer.organ.mieng.name": "Mouth",
"viewer.organ.mieng.description": "The mouth begins digestion by chewing food and mixing it with saliva before it moves toward the esophagus."
```

In `src/lib/locales/vi.json`, add the matching keys:

```json
"viewer.organ.thucQuan.name": "Thực quản",
"viewer.organ.thucQuan.description": "Thực quản là ống cơ nối từ họng xuống dạ dày, vận chuyển thức ăn bằng nhu động.",
"viewer.organ.mieng.name": "Miệng",
"viewer.organ.mieng.description": "Miệng bắt đầu tiêu hóa bằng cách nhai thức ăn và trộn với nước bọt trước khi thức ăn đi xuống thực quản."
```

- [ ] **Step 5: Run tests and locale validation**

Run: `pnpm test src/components/viewer/__tests__/organConfig.test.ts`

Expected: PASS.

Run: `pnpm l10n:validate`

Expected: PASS with locale catalogs synchronized.

- [ ] **Step 6: Commit**

Run:

```bash
git add src/components/viewer/organConfig.ts src/components/viewer/__tests__/organConfig.test.ts src/lib/locales/en.json src/lib/locales/vi.json
git commit -m "fix: map digestive model meshes to organs"
```

---

### Task 2: Viewer State And Digestive Model Registration

**Files:**
- Modify: `src/components/viewer/viewerContext.ts`
- Modify: `src/components/viewer/ViewerContext.tsx`
- Modify: `src/components/viewer/DigestiveModel.tsx`
- Test: `src/components/viewer/__tests__/DigestiveModel.test.tsx`

- [ ] **Step 1: Write failing model registration tests**

Update the provider factory in `src/components/viewer/__tests__/DigestiveModel.test.tsx` so the default viewer value includes these fields:

```ts
organNodes: new Map<string, THREE.Mesh[]>(),
registerOrganNode: vi.fn(),
modelMeshes: [],
registerModelMesh: vi.fn(),
lastClickedMeshName: null,
setLastClickedMeshName: vi.fn(),
isDebugPanelOpen: false,
setIsDebugPanelOpen: vi.fn(),
```

Then replace the existing `DigestiveModel` test body with:

```ts
it('registers all model meshes and selects logical organs from raw mesh clicks', () => {
  const registerOrganNode = vi.fn()
  const registerModelMesh = vi.fn()
  const setSelectedOrgan = vi.fn()
  const setLastClickedMeshName = vi.fn()
  const stomachMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))
  stomachMesh.name = 'digestive_system001'
  const stomachDetailMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))
  stomachDetailMesh.name = 'digestive_system003'
  const emptyMesh = new THREE.Mesh(new THREE.BufferGeometry())
  emptyMesh.name = 'digestive_system002'
  fbx.add(stomachMesh)
  fbx.add(stomachDetailMesh)
  fbx.add(emptyMesh)

  renderWithViewer(<DigestiveModel />, {
    registerOrganNode,
    registerModelMesh,
    setSelectedOrgan,
    setLastClickedMeshName,
  })

  expect(normalizeModelForViewer).toHaveBeenCalledWith(fbx)
  expect(registerModelMesh).toHaveBeenCalledWith({
    meshName: 'digestive_system001',
    organName: 'da_day',
    vertexCount: 24,
    isSelectable: true,
    isEmpty: false,
  })
  expect(registerModelMesh).toHaveBeenCalledWith({
    meshName: 'digestive_system003',
    organName: 'da_day',
    vertexCount: 24,
    isSelectable: true,
    isEmpty: false,
  })
  expect(registerModelMesh).toHaveBeenCalledWith({
    meshName: 'digestive_system002',
    organName: null,
    vertexCount: 0,
    isSelectable: false,
    isEmpty: true,
  })
  expect(registerOrganNode).toHaveBeenCalledWith('da_day', stomachMesh)
  expect(registerOrganNode).toHaveBeenCalledWith('da_day', stomachDetailMesh)

  const handlePointerDown = primitiveProps[0].onPointerDown as (event: {
    object: THREE.Object3D
    stopPropagation: () => void
  }) => void
  const stopPropagation = vi.fn()

  handlePointerDown({ object: stomachDetailMesh, stopPropagation })

  expect(setLastClickedMeshName).toHaveBeenCalledWith('digestive_system003')
  expect(stopPropagation).toHaveBeenCalledTimes(1)
  expect(setSelectedOrgan).toHaveBeenCalledWith('da_day')
})
```

Add one more test:

```ts
it('records unmapped mesh clicks without selecting an organ', () => {
  const setSelectedOrgan = vi.fn()
  const setLastClickedMeshName = vi.fn()
  const unmappedMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))
  unmappedMesh.name = 'other_mesh'
  fbx.add(unmappedMesh)

  renderWithViewer(<DigestiveModel />, { setSelectedOrgan, setLastClickedMeshName })

  const handlePointerDown = primitiveProps[0].onPointerDown as (event: {
    object: THREE.Object3D
    stopPropagation: () => void
  }) => void
  const stopPropagation = vi.fn()

  handlePointerDown({ object: unmappedMesh, stopPropagation })

  expect(setLastClickedMeshName).toHaveBeenCalledWith('other_mesh')
  expect(stopPropagation).not.toHaveBeenCalled()
  expect(setSelectedOrgan).not.toHaveBeenCalled()
})
```

- [ ] **Step 2: Run the model test to verify it fails**

Run: `pnpm test src/components/viewer/__tests__/DigestiveModel.test.tsx`

Expected: FAIL because viewer state and `DigestiveModel` do not yet expose/register debug metadata.

- [ ] **Step 3: Update shared viewer context types**

Replace `src/components/viewer/viewerContext.ts` with:

```ts
import { createContext, useContext } from 'react'
import type * as THREE from 'three'

export interface ViewerMeshDebugInfo {
  meshName: string
  organName: string | null
  vertexCount: number
  isSelectable: boolean
  isEmpty: boolean
}

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
}

export const ViewerContext = createContext<ViewerContextValue | null>(null)

export function useViewer(): ViewerContextValue {
  const value = useContext(ViewerContext)
  if (!value) throw new Error('useViewer must be used within ViewerProvider')
  return value
}
```

- [ ] **Step 4: Update the viewer provider implementation**

Replace `src/components/viewer/ViewerContext.tsx` with:

```tsx
import { useCallback, useState } from 'react'
import type { ReactNode } from 'react'
import type * as THREE from 'three'

import { ViewerContext } from './viewerContext'
import type { ViewerMeshDebugInfo } from './viewerContext'

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

  const registerOrganNode = useCallback((name: string, mesh: THREE.Mesh) => {
    setOrganNodes((currentNodes) => {
      const nextNodes = new Map(currentNodes)
      const currentMeshes = nextNodes.get(name) ?? []
      if (!currentMeshes.includes(mesh)) nextNodes.set(name, [...currentMeshes, mesh])
      return nextNodes
    })
  }, [])

  const registerModelMesh = useCallback((mesh: ViewerMeshDebugInfo) => {
    setModelMeshes((currentMeshes) => {
      const nextMeshes = currentMeshes.filter((currentMesh) => currentMesh.meshName !== mesh.meshName)
      return [...nextMeshes, mesh]
    })
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
      }}
    >
      {children}
    </ViewerContext.Provider>
  )
}
```

- [ ] **Step 5: Update FBX registration and click handling**

Replace `src/components/viewer/DigestiveModel.tsx` with:

```tsx
import { useFBX } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { useCallback, useEffect } from 'react'
import * as THREE from 'three'

import { normalizeModelForViewer } from './modelTransform'
import { getOrganInfoByMeshName } from './organConfig'
import { useViewer } from './viewerContext'

function resolveModelUrl(): string {
  return '/models/hetieuhoa.fbx'
}

function getVertexCount(mesh: THREE.Mesh): number {
  return mesh.geometry.attributes.position?.count ?? 0
}

export function DigestiveModel() {
  const fbx = useFBX(resolveModelUrl())
  const {
    registerOrganNode,
    registerModelMesh,
    setIsModelLoaded,
    setLastClickedMeshName,
    setLoadError,
    setSelectedOrgan,
  } = useViewer()

  useEffect(() => {
    let foundNamedOrgan = false

    normalizeModelForViewer(fbx)

    fbx.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return

      const organ = getOrganInfoByMeshName(child.name)
      const vertexCount = getVertexCount(child)
      const isSelectable = Boolean(organ) && vertexCount > 0


      registerModelMesh({
        meshName: child.name,
        organName: organ?.nodeName ?? null,
        vertexCount,
        isSelectable,
        isEmpty: vertexCount === 0,
      })

      if (!organ || vertexCount === 0) return

      child.userData.organName = organ.nodeName
      registerOrganNode(organ.nodeName, child)
      foundNamedOrgan = true
    })

    setIsModelLoaded(true)
    setLoadError(null)

    if (!foundNamedOrgan) {
      console.warn('No named organ meshes found in FBX. Click-to-select disabled.')
    }
  }, [fbx, registerModelMesh, registerOrganNode, setIsModelLoaded, setLoadError])

  const handlePointerDown = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      const object = event.object
      if (!(object instanceof THREE.Mesh)) return

      setLastClickedMeshName(object.name)

      if (typeof object.userData.organName !== 'string') return

      event.stopPropagation()
      setSelectedOrgan(object.userData.organName)
    },
    [setLastClickedMeshName, setSelectedOrgan],
  )

  return <primitive object={fbx} onPointerDown={handlePointerDown} />
}
```

- [ ] **Step 6: Run the model tests**

Run: `pnpm test src/components/viewer/__tests__/DigestiveModel.test.tsx`

Expected: PASS.

- [ ] **Step 7: Commit**

Run:

```bash
git add src/components/viewer/viewerContext.ts src/components/viewer/ViewerContext.tsx src/components/viewer/DigestiveModel.tsx src/components/viewer/__tests__/DigestiveModel.test.tsx
git commit -m "feat: track viewer mesh mapping state"
```

---

### Task 3: Multi-Mesh Camera And Highlight Support

**Files:**
- Modify: `src/components/viewer/CameraController.tsx`
- Modify: `src/components/viewer/OrganHighlighter.tsx`
- Test: `src/components/viewer/__tests__/CameraController.test.tsx`
- Test: `src/components/viewer/__tests__/OrganHighlighter.test.tsx`

- [ ] **Step 1: Update test provider defaults**

In both `CameraController.test.tsx` and `OrganHighlighter.test.tsx`, update viewer context defaults from single mesh maps to array maps:

```ts
organNodes: new Map<string, THREE.Mesh[]>(),
modelMeshes: [],
registerModelMesh: vi.fn(),
lastClickedMeshName: null,
setLastClickedMeshName: vi.fn(),
isDebugPanelOpen: false,
setIsDebugPanelOpen: vi.fn(),
```

Then update existing test maps from:

```ts
new Map([['stomach', mesh]])
```

to:

```ts
new Map([['stomach', [mesh]]])
```

- [ ] **Step 2: Add failing highlighter test for grouped organs**

Add this test to `src/components/viewer/__tests__/OrganHighlighter.test.tsx`:

```ts
it('highlights every mesh in the selected organ group', () => {
  const firstMaterial = new THREE.MeshStandardMaterial()
  const secondMaterial = new THREE.MeshStandardMaterial()
  const firstMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), firstMaterial)
  const secondMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), secondMaterial)

  renderWithViewer(<OrganHighlighter />, {
    selectedOrgan: 'da_day',
    organNodes: new Map([['da_day', [firstMesh, secondMesh]]]),
  })

  expect(firstMesh.material).not.toBe(firstMaterial)
  expect(secondMesh.material).not.toBe(secondMaterial)
  expect((firstMesh.material as THREE.MeshStandardMaterial).emissive.getHex()).toBe(0x44ff88)
  expect((secondMesh.material as THREE.MeshStandardMaterial).emissive.getHex()).toBe(0x44ff88)
})
```

- [ ] **Step 3: Add failing camera test for grouped organs**

In `src/components/viewer/__tests__/CameraController.test.tsx`, add a test that uses two meshes in one organ group and expects the transition to start. If the existing test already checks selected organs, change its `organNodes` value to include two meshes:

```ts
const firstMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))
firstMesh.position.set(-2, 0, 0)
const secondMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))
secondMesh.position.set(2, 0, 0)

renderWithViewer(<CameraController />, {
  selectedOrgan: 'da_day',
  organNodes: new Map([['da_day', [firstMesh, secondMesh]]]),
  cameraTarget: 'overview',
  setCameraTarget,
  setIsTransitioning,
})

expect(setCameraTarget).toHaveBeenCalledWith('da_day')
expect(setIsTransitioning).toHaveBeenCalledWith(true)
```

- [ ] **Step 4: Run camera/highlighter tests to verify failures**

Run: `pnpm test src/components/viewer/__tests__/CameraController.test.tsx src/components/viewer/__tests__/OrganHighlighter.test.tsx`

Expected: FAIL because implementation still expects `THREE.Mesh` rather than `THREE.Mesh[]`.

- [ ] **Step 5: Update camera controller to frame mesh groups**

In `src/components/viewer/CameraController.tsx`, replace the selected-node block inside `animateCamera` with:

```ts
const selectedNodes = target === 'overview' ? undefined : organNodes.get(target)
if (selectedNodes && selectedNodes.length > 0) {
  const box = new THREE.Box3()
  for (const selectedNode of selectedNodes) {
    box.union(new THREE.Box3().setFromObject(selectedNode))
  }
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  const maxDimension = Math.max(size.x, size.y, size.z)
  const distance = Math.max(maxDimension * 2.5, 3)

  endTarget.current.copy(center)
  endPosition.current.set(center.x, center.y + distance * 0.4, center.z + distance)
} else {
  endPosition.current.copy(DEFAULT_POSITION)
  endTarget.current.copy(DEFAULT_TARGET)
}
```

Also change the selection guard from:

```ts
if (nextTarget !== 'overview' && !organNodes.has(nextTarget)) return
```

to:

```ts
if (nextTarget !== 'overview' && (organNodes.get(nextTarget)?.length ?? 0) === 0) return
```

- [ ] **Step 6: Update highlighter to handle mesh groups**

Replace `src/components/viewer/OrganHighlighter.tsx` with:

```tsx
import { useEffect, useRef } from 'react'
import type * as THREE from 'three'

import { useViewer } from './viewerContext'

const HIGHLIGHT_EMISSIVE = 0x44ff88
const HIGHLIGHT_EMISSIVE_INTENSITY = 0.6

type MeshMaterial = THREE.Mesh['material']
type EmissiveMaterial = THREE.Material & {
  emissive: THREE.Color
  emissiveIntensity: number
}
interface HighlightedMaterialRecord {
  mesh: THREE.Mesh
  original: MeshMaterial
  highlighted: MeshMaterial
}

function materialSupportsEmissive(material: THREE.Material): material is EmissiveMaterial {
  const maybeEmissiveMaterial = material as Partial<EmissiveMaterial>
  return typeof maybeEmissiveMaterial.emissive?.setHex === 'function' && 'emissiveIntensity' in material
}

function disposeMaterial(material: MeshMaterial) {
  if (Array.isArray(material)) {
    material.forEach((currentMaterial) => currentMaterial.dispose())
    return
  }

  material.dispose()
}

function highlightMaterial(material: MeshMaterial): MeshMaterial {
  const materials = Array.isArray(material) ? material : [material]
  const highlightedMaterials = materials.map((currentMaterial) => {
    const highlightedMaterial = currentMaterial.clone()

    if (materialSupportsEmissive(highlightedMaterial)) {
      highlightedMaterial.emissive.setHex(HIGHLIGHT_EMISSIVE)
      highlightedMaterial.emissiveIntensity = HIGHLIGHT_EMISSIVE_INTENSITY
    }

    return highlightedMaterial
  })

  return Array.isArray(material) ? highlightedMaterials : highlightedMaterials[0]
}

function restoreMaterial(record: HighlightedMaterialRecord) {
  record.mesh.material = record.original
  disposeMaterial(record.highlighted)
}

export function OrganHighlighter() {
  const { selectedOrgan, organNodes } = useViewer()
  const highlightedMaterials = useRef(new Map<THREE.Mesh, HighlightedMaterialRecord>())

  useEffect(() => {
    const selectedMeshes = selectedOrgan ? (organNodes.get(selectedOrgan) ?? []) : []
    const selectedMeshSet = new Set(selectedMeshes)

    highlightedMaterials.current.forEach((record, mesh) => {
      if (selectedMeshSet.has(mesh)) return
      restoreMaterial(record)
      highlightedMaterials.current.delete(mesh)
    })

    for (const mesh of selectedMeshes) {
      if (highlightedMaterials.current.has(mesh)) continue

      const highlightedMaterial = highlightMaterial(mesh.material)
      highlightedMaterials.current.set(mesh, {
        mesh,
        original: mesh.material,
        highlighted: highlightedMaterial,
      })
      mesh.material = highlightedMaterial
    }

    return () => {
      highlightedMaterials.current.forEach(restoreMaterial)
      highlightedMaterials.current.clear()
    }
  }, [organNodes, selectedOrgan])

  return null
}
```

- [ ] **Step 7: Run camera/highlighter tests**

Run: `pnpm test src/components/viewer/__tests__/CameraController.test.tsx src/components/viewer/__tests__/OrganHighlighter.test.tsx`

Expected: PASS.

- [ ] **Step 8: Commit**

Run:

```bash
git add src/components/viewer/CameraController.tsx src/components/viewer/OrganHighlighter.tsx src/components/viewer/__tests__/CameraController.test.tsx src/components/viewer/__tests__/OrganHighlighter.test.tsx
git commit -m "fix: support multi-mesh organ focus"
```

---

### Task 4: Debug Panel UI And Toolbar Toggle

**Files:**
- Create: `src/components/viewer/ViewerDebugPanel.tsx`
- Modify: `src/components/viewer/ViewerToolbar.tsx`
- Modify: `src/components/viewer/ViewerPage.tsx`
- Modify: `src/lib/locales/en.json`
- Modify: `src/lib/locales/vi.json`
- Test: `src/components/viewer/__tests__/ViewerDebugPanel.test.tsx`
- Test: `src/components/viewer/__tests__/ViewerToolbar.test.tsx`
- Test: `src/components/viewer/__tests__/ViewerPage.test.tsx`

- [ ] **Step 1: Write the debug panel test**

Create `src/components/viewer/__tests__/ViewerDebugPanel.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import * as THREE from 'three'
import { describe, expect, it, vi } from 'vitest'

import { StarterSettingsContext } from '@/app/StarterSettingsContext'
import { DEFAULT_STARTER_SETTINGS } from '@/app/settingsStorage'
import { ViewerDebugPanel } from '../ViewerDebugPanel'
import { ViewerContext } from '../viewerContext'
import type { ViewerContextValue } from '../viewerContext'

function renderWithViewer(children: ReactNode, overrides: Partial<ViewerContextValue> = {}) {
  return render(
    <StarterSettingsContext.Provider
      value={{
        appVersion: '0.1.0',
        locale: 'en',
        resolvedThemeMode: 'light',
        settings: DEFAULT_STARTER_SETTINGS,
        updateSettings: vi.fn(),
      }}
    >
      <ViewerContext.Provider
        value={{
          selectedOrgan: 'da_day',
          setSelectedOrgan: vi.fn(),
          organNodes: new Map<string, THREE.Mesh[]>(),
          registerOrganNode: vi.fn(),
          modelMeshes: [
            {
              meshName: 'digestive_system001',
              organName: 'da_day',
              vertexCount: 7830,
              isSelectable: true,
              isEmpty: false,
            },
            {
              meshName: 'digestive_system002',
              organName: null,
              vertexCount: 0,
              isSelectable: false,
              isEmpty: true,
            },
          ],
          registerModelMesh: vi.fn(),
          lastClickedMeshName: 'digestive_system001',
          setLastClickedMeshName: vi.fn(),
          isDebugPanelOpen: true,
          setIsDebugPanelOpen: vi.fn(),
          cameraTarget: 'overview',
          setCameraTarget: vi.fn(),
          isTransitioning: false,
          setIsTransitioning: vi.fn(),
          isModelLoaded: true,
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
    </StarterSettingsContext.Provider>,
  )
}

describe('ViewerDebugPanel', () => {
  it('does not render when closed', () => {
    renderWithViewer(<ViewerDebugPanel />, { isDebugPanelOpen: false })

    expect(screen.queryByText('Mesh debug')).not.toBeInTheDocument()
  })

  it('renders selection, clicked mesh, mapped meshes, and empty meshes', () => {
    renderWithViewer(<ViewerDebugPanel />)

    expect(screen.getByText('Mesh debug')).toBeInTheDocument()
    expect(screen.getByText('Selected organ')).toBeInTheDocument()
    expect(screen.getByText('da_day')).toBeInTheDocument()
    expect(screen.getByText('Last clicked mesh')).toBeInTheDocument()
    expect(screen.getByText('digestive_system001')).toBeInTheDocument()
    expect(screen.getByText('digestive_system002')).toBeInTheDocument()
    expect(screen.getByText('empty')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Update toolbar tests for the toggle**

In `src/components/viewer/__tests__/ViewerToolbar.test.tsx`, add `modelMeshes`, `registerModelMesh`, `lastClickedMeshName`, `setLastClickedMeshName`, `isDebugPanelOpen`, and `setIsDebugPanelOpen` to the default viewer value. Add this test:

```tsx
it('toggles mesh debug visibility', () => {
  const setIsDebugPanelOpen = vi.fn()
  renderViewerToolbar({ isDebugPanelOpen: false, setIsDebugPanelOpen })

  fireEvent.click(screen.getByRole('button', { name: 'Show mesh debug' }))

  expect(setIsDebugPanelOpen).toHaveBeenCalledWith(true)
})
```

- [ ] **Step 3: Update page test for debug panel overlay**

In `src/components/viewer/__tests__/ViewerPage.test.tsx`, add this mock:

```tsx
vi.mock('../ViewerDebugPanel', () => ({
  ViewerDebugPanel: () => <aside data-testid="viewer-debug-panel">Mesh debug</aside>,
}))
```

Then add this expectation inside the existing test:

```ts
expect(within(provider).getByTestId('viewer-debug-panel')).toBeInTheDocument()
```

- [ ] **Step 4: Run debug UI tests to verify failures**

Run: `pnpm test src/components/viewer/__tests__/ViewerDebugPanel.test.tsx src/components/viewer/__tests__/ViewerToolbar.test.tsx src/components/viewer/__tests__/ViewerPage.test.tsx`

Expected: FAIL because `ViewerDebugPanel` and toolbar labels do not exist yet.

- [ ] **Step 5: Implement the debug panel component**

Create `src/components/viewer/ViewerDebugPanel.tsx`:

```tsx
import { useStarterSettings } from '@/app/StarterSettingsContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createTranslator } from '@/lib/i18n'
import { useViewer } from './viewerContext'

export function ViewerDebugPanel() {
  const { isDebugPanelOpen, lastClickedMeshName, modelMeshes, selectedOrgan } = useViewer()
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)

  if (!isDebugPanelOpen) return null

  const selectableMeshes = modelMeshes.filter((mesh) => mesh.isSelectable)
  const unmappedMeshes = modelMeshes.filter((mesh) => !mesh.isSelectable && !mesh.isEmpty)
  const emptyMeshes = modelMeshes.filter((mesh) => mesh.isEmpty)

  return (
    <Card className="absolute right-4 top-16 z-10 max-h-[calc(100%-5rem)] w-[min(28rem,calc(100%-2rem))] overflow-auto bg-card/95 shadow-lg backdrop-blur">
      <CardHeader>
        <CardTitle>{t('viewer.debug.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <dl className="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-2">
          <dt className="font-medium text-muted-foreground">{t('viewer.debug.selectedOrgan')}</dt>
          <dd>{selectedOrgan ?? t('viewer.debug.none')}</dd>
          <dt className="font-medium text-muted-foreground">{t('viewer.debug.lastClickedMesh')}</dt>
          <dd>{lastClickedMeshName ?? t('viewer.debug.none')}</dd>
        </dl>

        <section className="space-y-2">
          <h3 className="font-medium">{t('viewer.debug.mappedMeshes')}</h3>
          <ul className="space-y-1">
            {selectableMeshes.map((mesh) => (
              <li key={mesh.meshName} className="rounded-md bg-muted/60 px-2 py-1">
                <code>{mesh.meshName}</code> -> {mesh.organName} ({mesh.vertexCount})
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="font-medium">{t('viewer.debug.unmappedMeshes')}</h3>
          {unmappedMeshes.length > 0 ? (
            <ul className="space-y-1">
              {unmappedMeshes.map((mesh) => (
                <li key={mesh.meshName} className="rounded-md bg-muted/60 px-2 py-1">
                  <code>{mesh.meshName}</code> ({mesh.vertexCount})
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">{t('viewer.debug.none')}</p>
          )}
        </section>

        <section className="space-y-2">
          <h3 className="font-medium">{t('viewer.debug.emptyMeshes')}</h3>
          {emptyMeshes.length > 0 ? (
            <ul className="space-y-1">
              {emptyMeshes.map((mesh) => (
                <li key={mesh.meshName} className="rounded-md bg-muted/60 px-2 py-1">
                  <code>{mesh.meshName}</code> {t('viewer.debug.empty')}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">{t('viewer.debug.none')}</p>
          )}
        </section>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 6: Add toolbar toggle**

Modify `src/components/viewer/ViewerToolbar.tsx` so it reads and toggles debug state:

```tsx
import { ArrowsClockwise, Bug } from '@phosphor-icons/react'

import { useStarterSettings } from '@/app/StarterSettingsContext'
import { Button } from '@/components/ui/button'
import { createTranslator } from '@/lib/i18n'
import { useViewer } from './viewerContext'

export function ViewerToolbar() {
  const { isDebugPanelOpen, isTransitioning, requestViewReset, setIsDebugPanelOpen } = useViewer()
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)

  return (
    <div className="absolute right-4 top-4 z-10 flex gap-2">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        aria-pressed={isDebugPanelOpen}
        onClick={() => setIsDebugPanelOpen(!isDebugPanelOpen)}
      >
        <Bug aria-hidden="true" />
        {isDebugPanelOpen ? t('viewer.debug.hide') : t('viewer.debug.show')}
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={isTransitioning}
        onClick={requestViewReset}
      >
        <ArrowsClockwise aria-hidden="true" />
        {t('viewer.resetView')}
      </Button>
    </div>
  )
}
```

- [ ] **Step 7: Render debug panel on the viewer page**

Modify `src/components/viewer/ViewerPage.tsx`:

```tsx
import { DigestiveCanvas } from './DigestiveCanvas'
import { OrganInfoCard } from './OrganInfoCard'
import { ViewerDebugPanel } from './ViewerDebugPanel'
import { ViewerProvider } from './ViewerContext.tsx'
import { ViewerToolbar } from './ViewerToolbar'

export function ViewerPage() {
  return (
    <ViewerProvider>
      <section className="relative h-full min-h-[24rem] w-full overflow-hidden">
        <DigestiveCanvas />
        <OrganInfoCard />
        <ViewerToolbar />
        <ViewerDebugPanel />
      </section>
    </ViewerProvider>
  )
}
```

- [ ] **Step 8: Add debug locale labels**

Add these keys to `src/lib/locales/en.json` near the other viewer keys:

```json
"viewer.debug.show": "Show mesh debug",
"viewer.debug.hide": "Hide mesh debug",
"viewer.debug.title": "Mesh debug",
"viewer.debug.selectedOrgan": "Selected organ",
"viewer.debug.lastClickedMesh": "Last clicked mesh",
"viewer.debug.mappedMeshes": "Mapped meshes",
"viewer.debug.unmappedMeshes": "Unmapped meshes",
"viewer.debug.emptyMeshes": "Empty meshes",
"viewer.debug.empty": "empty",
"viewer.debug.none": "None"
```

Add these keys to `src/lib/locales/vi.json`:

```json
"viewer.debug.show": "Hiện debug mesh",
"viewer.debug.hide": "Ẩn debug mesh",
"viewer.debug.title": "Debug mesh",
"viewer.debug.selectedOrgan": "Cơ quan đang chọn",
"viewer.debug.lastClickedMesh": "Mesh vừa click",
"viewer.debug.mappedMeshes": "Mesh đã gán",
"viewer.debug.unmappedMeshes": "Mesh chưa gán",
"viewer.debug.emptyMeshes": "Mesh rỗng",
"viewer.debug.empty": "rỗng",
"viewer.debug.none": "Không có"
```

- [ ] **Step 9: Run debug UI tests and locale validation**

Run: `pnpm test src/components/viewer/__tests__/ViewerDebugPanel.test.tsx src/components/viewer/__tests__/ViewerToolbar.test.tsx src/components/viewer/__tests__/ViewerPage.test.tsx`

Expected: PASS.

Run: `pnpm l10n:validate`

Expected: PASS.

- [ ] **Step 10: Commit**

Run:

```bash
git add src/components/viewer/ViewerDebugPanel.tsx src/components/viewer/ViewerToolbar.tsx src/components/viewer/ViewerPage.tsx src/components/viewer/__tests__/ViewerDebugPanel.test.tsx src/components/viewer/__tests__/ViewerToolbar.test.tsx src/components/viewer/__tests__/ViewerPage.test.tsx src/lib/locales/en.json src/lib/locales/vi.json
git commit -m "feat: add viewer mesh debug panel"
```

---

### Task 5: Full Viewer Verification

**Files:**
- Modify only if tests reveal a directly related issue in `src/components/viewer/`.

- [ ] **Step 1: Run all viewer tests**

Run: `pnpm test src/components/viewer/__tests__`

Expected: PASS.

- [ ] **Step 2: Run localization validation**

Run: `pnpm l10n:validate`

Expected: PASS.

- [ ] **Step 3: Run TypeScript checking**

Run: `npx tsc --noEmit`

Expected: PASS.

- [ ] **Step 4: Run lint**

Run: `pnpm lint`

Expected: PASS.

- [ ] **Step 5: Run smoke test for viewer route behavior**

Run: `pnpm playwright:smoke`

Expected: PASS because the viewer route and shell navigation still load.

- [ ] **Step 6: Manual viewer check**

Run: `pnpm dev`

Open `http://localhost:5202/viewer` and verify:

- Click `digestive_system001` or `digestive_system003` area selects dạ dày and zooms to the same logical organ.
- Click each mapped organ area opens the correct info card.
- Reset view returns to overview.
- Show mesh debug displays selected organ, last clicked mesh, mapped meshes, and empty meshes.
- Hide mesh debug removes the panel without changing selection.

- [ ] **Step 7: Commit verification-only fixes if needed**

If verification required a focused fix, commit it with:

```bash
git add src/components/viewer src/lib/locales/en.json src/lib/locales/vi.json
git commit -m "fix: stabilize viewer organ debug behavior"
```

If no fixes were needed, do not create an empty commit.

---

## Self-Review Notes

- Spec coverage: Tasks cover mesh mapping, multi-mesh organs, click selection, camera zoom, highlighting, debug panel, localization, and verification.
- Placeholder scan: No `TBD`, `TODO`, or deferred implementation placeholders remain in this plan.
- Type consistency: `organNodes` is consistently `Map<string, THREE.Mesh[]>`; `modelMeshes` is consistently `ViewerMeshDebugInfo[]`; debug state names are consistent across context, provider, toolbar, panel, and tests.
