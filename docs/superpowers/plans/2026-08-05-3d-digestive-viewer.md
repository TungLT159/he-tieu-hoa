# 3D Digestive System Viewer — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an interactive 3D digestive system viewer page to the Tauri + React starter app using react-three-fiber.

**Architecture:** A new `/viewer` route renders a full-viewport R3F Canvas with FBX model loaded via drei's `useFBX`. Organ meshes (already named in the FBX hierarchy) are clickable via raycasting. Selection triggers camera fly-to, organ highlight, and a shadcn Card overlay. State is managed through a `ViewerContext`.

**Tech Stack:** React 19, react-three-fiber, @react-three/drei, three-stdlib, Tauri v2, shadcn/ui, Tailwind CSS v4, vitest, Playwright

**Spec:** `docs/superpowers/specs/2026-08-05-3d-digestive-viewer-design.md`

---

### File Map

| Action | Path | Purpose |
|--------|------|---------|
| Create | `public/models/` | Host FBX in dev |
| Create | `src/components/viewer/organConfig.ts` | Organ name/description map |
| Create | `src/components/viewer/ViewerContext.tsx` | Shared state context |
| Create | `src/components/viewer/DigestiveModel.tsx` | FBX loader + node registry |
| Create | `src/components/viewer/CameraController.tsx` | OrbitControls + fly-to |
| Create | `src/components/viewer/OrganHighlighter.tsx` | Emissive highlight |
| Create | `src/components/viewer/BackgroundClickPlane.tsx` | Deselection on background click |
| Create | `src/components/viewer/OrganInfoCard.tsx` | Info overlay |
| Create | `src/components/viewer/ViewerToolbar.tsx` | Toolbar controls |
| Create | `src/components/viewer/DigestiveCanvas.tsx` | R3F Canvas assembly |
| Create | `src/components/viewer/ViewerPage.tsx` | Page wrapper |
| Create | `src/components/viewer/__tests__/organConfig.test.ts` | Config tests |
| Create | `src/components/viewer/__tests__/ViewerPage.test.tsx` | Page render tests |
| Modify | `src/app/routes.tsx` | Add /viewer route |
| Modify | `src/lib/locales/en.json` | Add viewer keys |
| Modify | `src/lib/locales/vi.json` | Add viewer keys (Vietnamese) |
| Copy | `src-tauri/resources/hetieuhoa.fbx → public/models/` | Dev asset |

---

### Task 1: Install dependencies and copy FBX asset

**Files:**
- Create: `public/models/` (directory)

- [ ] **Step 1: Install npm dependencies**

```bash
pnpm add three @react-three/fiber @react-three/drei three-stdlib
pnpm add -D @types/three
```

- [ ] **Step 2: Copy FBX to public/models/**

```bash
New-Item -ItemType Directory -Path "public\models" -Force | Out-Null
Copy-Item -LiteralPath "src-tauri\resources\hetieuhoa.fbx" -Destination "public\models\hetieuhoa.fbx"
```

- [ ] **Step 3: Verify dev server serves the asset**

Run: `pnpm dev`
Open: `http://localhost:5202/models/hetieuhoa.fbx`
Expected: File downloads (binary FBX content served)

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml public/models/
git commit -m "feat: add three.js dependencies and FBX asset"
```

---

### Task 2: Create organ config and ViewerContext

**Files:**
- Create: `src/components/viewer/organConfig.ts`
- Create: `src/components/viewer/ViewerContext.tsx`
- Create: `src/components/viewer/__tests__/organConfig.test.ts`

- [ ] **Step 1: Write failing test for organConfig**

```ts
// src/components/viewer/__tests__/organConfig.test.ts
import { describe, it, expect } from 'vitest'
import { ORGAN_LIST, getOrganInfo } from '../organConfig'

describe('organConfig', () => {
  it('has at least one organ defined', () => {
    expect(ORGAN_LIST.length).toBeGreaterThan(0)
  })

  it('every organ has required fields', () => {
    for (const organ of ORGAN_LIST) {
      expect(organ.nodeName).toBeTruthy()
      expect(organ.displayName).toBeTruthy()
      expect(organ.displayNameEn).toBeTruthy()
      expect(organ.description).toBeTruthy()
      expect(organ.descriptionEn).toBeTruthy()
    }
  })

  it('nodeNames are unique', () => {
    const names = ORGAN_LIST.map((o) => o.nodeName)
    expect(new Set(names).size).toBe(names.length)
  })

  it('getOrganInfo returns organ by nodeName', () => {
    const first = ORGAN_LIST[0]
    expect(getOrganInfo(first.nodeName)).toBe(first)
  })

  it('getOrganInfo returns undefined for unknown nodeName', () => {
    expect(getOrganInfo('nonexistent_organ')).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/components/viewer/__tests__/organConfig.test.ts
```
Expected: FAIL — module not found

- [ ] **Step 3: Create organConfig.ts**

```ts
// src/components/viewer/organConfig.ts
export interface OrganInfo {
  nodeName: string
  displayName: string
  displayNameEn: string
  description: string
  descriptionEn: string
}

export const ORGAN_LIST: OrganInfo[] = [
  {
    nodeName: 'da_day',
    displayName: 'Dạ dày',
    displayNameEn: 'Stomach',
    description:
      'Dạ dày là cơ quan tiêu hóa hình túi, nằm giữa thực quản và ruột non. Dạ dày tiết acid và enzyme để phân hủy thức ăn thành dạng lỏng.',
    descriptionEn:
      'The stomach is a J-shaped digestive organ located between the esophagus and small intestine. It secretes acid and enzymes to break down food into a liquid form.',
  },
  {
    nodeName: 'thuc_quan',
    displayName: 'Thực quản',
    displayNameEn: 'Esophagus',
    description:
      'Thực quản là ống cơ nối từ họng xuống dạ dày, vận chuyển thức ăn bằng nhu động.',
    descriptionEn:
      'The esophagus is a muscular tube connecting the throat to the stomach, transporting food via peristalsis.',
  },
  {
    nodeName: 'ruot_non',
    displayName: 'Ruột non',
    displayNameEn: 'Small Intestine',
    description:
      'Ruột non là đoạn dài nhất của ống tiêu hóa, nơi diễn ra phần lớn quá trình tiêu hóa và hấp thụ chất dinh dưỡng.',
    descriptionEn:
      'The small intestine is the longest part of the digestive tract where most digestion and nutrient absorption occurs.',
  },
  {
    nodeName: 'ruot_gia',
    displayName: 'Ruột già',
    displayNameEn: 'Large Intestine',
    description:
      'Ruột già hấp thụ nước và muối khoáng từ thức ăn đã tiêu hóa, tạo thành phân và đào thải ra ngoài.',
    descriptionEn:
      'The large intestine absorbs water and electrolytes from digested food, forming and eliminating feces.',
  },
  {
    nodeName: 'gan',
    displayName: 'Gan',
    displayNameEn: 'Liver',
    description:
      'Gan là cơ quan lớn nhất trong cơ thể, có chức năng lọc máu, sản xuất mật, chuyển hóa chất dinh dưỡng và giải độc.',
    descriptionEn:
      'The liver is the largest internal organ, responsible for filtering blood, producing bile, metabolizing nutrients, and detoxification.',
  },
  {
    nodeName: 'tui_mat',
    displayName: 'Túi mật',
    displayNameEn: 'Gallbladder',
    description:
      'Túi mật là cơ quan nhỏ hình quả lê, lưu trữ và cô đặc mật do gan sản xuất để tiêu hóa chất béo.',
    descriptionEn:
      'The gallbladder is a small pear-shaped organ that stores and concentrates bile produced by the liver for fat digestion.',
  },
  {
    nodeName: 'tuy',
    displayName: 'Tụy',
    displayNameEn: 'Pancreas',
    description:
      'Tụy vừa là tuyến nội tiết (insulin) vừa là tuyến ngoại tiết (enzyme tiêu hóa), đóng vai trò quan trọng trong tiêu hóa và điều hòa đường huyết.',
    descriptionEn:
      'The pancreas functions as both an endocrine (insulin) and exocrine (digestive enzymes) gland, critical for digestion and blood sugar regulation.',
  },
]

const organMap = new Map<string, OrganInfo>(
  ORGAN_LIST.map((o) => [o.nodeName, o]),
)

export function getOrganInfo(nodeName: string): OrganInfo | undefined {
  return organMap.get(nodeName)
}

export const ORGAN_NODE_NAMES = new Set(ORGAN_LIST.map((o) => o.nodeName))
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/components/viewer/__tests__/organConfig.test.ts
```
Expected: PASS

- [ ] **Step 5: Create ViewerContext.tsx**

```tsx
// src/components/viewer/ViewerContext.tsx
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type * as THREE from 'three'

interface ViewerContextValue {
  selectedOrgan: string | null
  setSelectedOrgan: (name: string | null) => void
  organNodes: Map<string, THREE.Mesh>
  registerOrganNode: (name: string, mesh: THREE.Mesh) => void
  cameraTarget: 'overview' | string
  setCameraTarget: (target: 'overview' | string) => void
  isTransitioning: boolean
  setIsTransitioning: (value: boolean) => void
  isModelLoaded: boolean
  setIsModelLoaded: (value: boolean) => void
  loadError: string | null
  setLoadError: (error: string | null) => void
}

const ViewerContext = createContext<ViewerContextValue | null>(null)

export function ViewerProvider({ children }: { children: ReactNode }) {
  const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null)
  const [organNodes, setOrganNodes] = useState<Map<string, THREE.Mesh>>(new Map())
  const [cameraTarget, setCameraTarget] = useState<'overview' | string>('overview')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isModelLoaded, setIsModelLoaded] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const registerOrganNode = useCallback((name: string, mesh: THREE.Mesh) => {
    setOrganNodes((prev) => {
      const next = new Map(prev)
      next.set(name, mesh)
      return next
    })
  }, [])

  return (
    <ViewerContext.Provider
      value={{
        selectedOrgan,
        setSelectedOrgan,
        organNodes,
        registerOrganNode,
        cameraTarget,
        setCameraTarget,
        isTransitioning,
        setIsTransitioning,
        isModelLoaded,
        setIsModelLoaded,
        loadError,
        setLoadError,
      }}
    >
      {children}
    </ViewerContext.Provider>
  )
}

export function useViewer(): ViewerContextValue {
  const ctx = useContext(ViewerContext)
  if (!ctx) throw new Error('useViewer must be used within ViewerProvider')
  return ctx
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/viewer/organConfig.ts src/components/viewer/ViewerContext.tsx src/components/viewer/__tests__/organConfig.test.ts
git commit -m "feat: add organ config and ViewerContext"
```

---

### Task 3: Create DigestiveModel (FBX loader)

**Files:**
- Create: `src/components/viewer/DigestiveModel.tsx`

- [ ] **Step 1: Create DigestiveModel.tsx**

```tsx
// src/components/viewer/DigestiveModel.tsx
import { useFBX } from '@react-three/drei'
import { useEffect, useCallback } from 'react'
import * as THREE from 'three'
import { useViewer } from './ViewerContext'
import { ORGAN_NODE_NAMES } from './organConfig'

function resolveModelUrl(): string {
  if (import.meta.env.DEV) {
    return '/models/hetieuhoa.fbx'
  }
  return '/models/hetieuhoa.fbx'
}

export function DigestiveModel() {
  const { registerOrganNode, setIsModelLoaded, setLoadError, setSelectedOrgan } = useViewer()

  const fbx = useFBX(resolveModelUrl())

  useEffect(() => {
    if (!fbx) return

    let foundOrgans = false
    fbx.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh && ORGAN_NODE_NAMES.has(child.name)) {
        child.userData.organName = child.name
        registerOrganNode(child.name, child)
        foundOrgans = true
      }
    })

    setIsModelLoaded(true)
    setLoadError(null)

    if (!foundOrgans) {
      console.warn('No named organ meshes found in FBX. Click-to-select disabled.')
    }
  }, [fbx, registerOrganNode, setIsModelLoaded, setLoadError])

  const handlePointerDown = useCallback(
    (e: any) => {
      const obj = e.object
      if (obj instanceof THREE.Mesh && obj.userData?.organName) {
        setSelectedOrgan(obj.userData.organName)
      }
    },
    [setSelectedOrgan],
  )

  return <primitive object={fbx} onPointerDown={handlePointerDown} />
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/viewer/DigestiveModel.tsx
git commit -m "feat: add DigestiveModel FBX loader"
```

---

### Task 4: Create CameraController

**Files:**
- Create: `src/components/viewer/CameraController.tsx`

- [ ] **Step 1: Create CameraController.tsx**

```tsx
// src/components/viewer/CameraController.tsx
import { OrbitControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useRef, useCallback, useEffect } from 'react'
import * as THREE from 'three'
import { useViewer } from './ViewerContext'

const DEFAULT_POSITION = new THREE.Vector3(0, 2, 8)
const DEFAULT_TARGET = new THREE.Vector3(0, 0.5, 0)
const FLY_DURATION = 1.0

export function CameraController() {
  const { selectedOrgan, organNodes, cameraTarget, setCameraTarget, isTransitioning, setIsTransitioning } =
    useViewer()
  const controlsRef = useRef<any>(null)
  const { camera } = useThree()
  const lerpStart = useRef(0)
  const startPos = useRef(new THREE.Vector3())
  const startTarget = useRef(new THREE.Vector3())
  const endPos = useRef(new THREE.Vector3())
  const endTarget = useRef(new THREE.Vector3())

  const animateCamera = useCallback(() => {
    const controls = controlsRef.current
    if (!controls) return

    if (selectedOrgan) {
      const mesh = organNodes.get(selectedOrgan)
      if (!mesh) return

      const worldPos = new THREE.Vector3()
      mesh.getWorldPosition(worldPos)
      const box = new THREE.Box3().setFromObject(mesh)
      const size = new THREE.Vector3()
      box.getSize(size)
      const maxDim = Math.max(size.x, size.y, size.z)

      startPos.current.copy(camera.position)
      startTarget.current.copy(controls.target)
      endTarget.current.copy(worldPos)
      const dir = new THREE.Vector3().subVectors(camera.position, worldPos).normalize()
      endPos.current.copy(worldPos).addScaledVector(dir, maxDim * 2.5 + 2)
    } else {
      startPos.current.copy(camera.position)
      startTarget.current.copy(controls.target)
      endPos.current.copy(DEFAULT_POSITION)
      endTarget.current.copy(DEFAULT_TARGET)
    }

    lerpStart.current = performance.now() / 1000
    setIsTransitioning(true)
  }, [selectedOrgan, organNodes, camera, setIsTransitioning])

  useEffect(() => {
    const target = selectedOrgan ?? 'overview'
    if (target !== cameraTarget) {
      setCameraTarget(target)
      animateCamera()
    }
  }, [selectedOrgan, cameraTarget, setCameraTarget, animateCamera])

  useFrame(() => {
    const controls = controlsRef.current
    if (!controls) return

    if (isTransitioning) {
      const elapsed = performance.now() / 1000 - lerpStart.current
      const t = Math.min(elapsed / FLY_DURATION, 1.0)
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t

      camera.position.lerpVectors(startPos.current, endPos.current, ease)
      controls.target.lerpVectors(startTarget.current, endTarget.current, ease)
      controls.update()

      if (t >= 1.0) {
        setIsTransitioning(false)
      }
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enabled={!isTransitioning}
      target={DEFAULT_TARGET.clone()}
      minDistance={1}
      maxDistance={20}
      makeDefault
    />
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/viewer/CameraController.tsx
git commit -m "feat: add CameraController with fly-to animation"
```

Click handling is built into DigestiveModel (`onPointerDown` on `<primitive>`) and DigestiveCanvas (`onPointerMissed` on `<Canvas>`). See Task 3 and Task 8 for details.

---

### Task 5: Create OrganHighlighter

**Files:**
- Create: `src/components/viewer/OrganHighlighter.tsx`

- [ ] **Step 1: Create OrganHighlighter.tsx**

```tsx
// src/components/viewer/OrganHighlighter.tsx
import { useEffect, useRef } from 'react'
import type * as THREE from 'three'
import { useViewer } from './ViewerContext'

const HIGHLIGHT_EMISSIVE = 0x44ff88
const HIGHLIGHT_EMISSIVE_INTENSITY = 0.6

export function OrganHighlighter() {
  const { selectedOrgan, organNodes } = useViewer()
  const prevMaterials = useRef<Map<string, THREE.Material | THREE.Material[]>>(new Map())

  useEffect(() => {
    for (const [name, mesh] of organNodes) {
      if (!prevMaterials.current.has(name)) {
        prevMaterials.current.set(name, mesh.material)
      }

      if (name === selectedOrgan) {
        const mat = mesh.material as THREE.MeshStandardMaterial
        mesh.material = mat.clone()
        ;(mesh.material as THREE.MeshStandardMaterial).emissive?.set(HIGHLIGHT_EMISSIVE)
        ;(mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = HIGHLIGHT_EMISSIVE_INTENSITY
      } else {
        const original = prevMaterials.current.get(name)
        if (original) {
          mesh.material = original
        }
      }
    }

    return () => {
      for (const [name, mesh] of organNodes) {
        const original = prevMaterials.current.get(name)
        if (original && mesh.material !== original) {
          mesh.material = original
        }
      }
    }
  }, [selectedOrgan, organNodes])

  return null
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/viewer/OrganHighlighter.tsx
git commit -m "feat: add OrganHighlighter with emissive highlight"
```

---

### Task 6: Create OrganInfoCard

**Files:**
- Create: `src/components/viewer/OrganInfoCard.tsx`

- [ ] **Step 1: Create OrganInfoCard.tsx**

```tsx
// src/components/viewer/OrganInfoCard.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowUUpLeft } from '@phosphor-icons/react'
import { useViewer } from './ViewerContext'
import { getOrganInfo } from './organConfig'
import { useStarterSettings } from '@/app/StarterSettingsContext'
import { createTranslator } from '@/lib/i18n'

export function OrganInfoCard() {
  const { selectedOrgan, setSelectedOrgan } = useViewer()
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)
  const isVi = locale === 'vi'
  const organ = selectedOrgan ? getOrganInfo(selectedOrgan) : null

  if (!selectedOrgan || !organ) {
    return null
  }

  return (
    <div className="absolute bottom-6 left-6 z-10 max-w-sm">
      <Card className="shadow-lg border-2 border-emerald-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">
            {isVi ? organ.displayName : organ.displayNameEn}
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            {isVi ? organ.description : organ.descriptionEn}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedOrgan(null)}
          >
            <ArrowUUpLeft className="mr-1 h-4 w-4" />
            {t('viewer.returnToOverview')}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/viewer/OrganInfoCard.tsx
git commit -m "feat: add OrganInfoCard overlay"
```

---

### Task 7: Create ViewerToolbar

**Files:**
- Create: `src/components/viewer/ViewerToolbar.tsx`

- [ ] **Step 1: Create ViewerToolbar.tsx**

```tsx
// src/components/viewer/ViewerToolbar.tsx
import { Button } from '@/components/ui/button'
import { ArrowsClockwise } from '@phosphor-icons/react'
import { useViewer } from './ViewerContext'
import { useStarterSettings } from '@/app/StarterSettingsContext'
import { createTranslator } from '@/lib/i18n'

export function ViewerToolbar() {
  const { setSelectedOrgan, isTransitioning } = useViewer()
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)

  return (
    <div className="absolute top-4 right-4 z-10 flex gap-2">
      <Button
        variant="secondary"
        size="sm"
        disabled={isTransitioning}
        onClick={() => setSelectedOrgan(null)}
      >
        <ArrowsClockwise className="mr-1 h-4 w-4" />
        {t('viewer.resetView')}
      </Button>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/viewer/ViewerToolbar.tsx
git commit -m "feat: add ViewerToolbar"
```

---

### Task 8: Create DigestiveCanvas (R3F assembly)

**Files:**
- Create: `src/components/viewer/DigestiveCanvas.tsx`
- Create: `src/components/viewer/BackgroundClickPlane.tsx`

- [ ] **Step 1: Create BackgroundClickPlane.tsx**

```tsx
// src/components/viewer/BackgroundClickPlane.tsx
import { useViewer } from './ViewerContext'

export function BackgroundClickPlane() {
  const { setSelectedOrgan } = useViewer()

  return (
    <mesh
      visible={false}
      onPointerDown={() => setSelectedOrgan(null)}
      position={[0, 0, -10]}
    >
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  )
}
```

- [ ] **Step 2: Create DigestiveCanvas.tsx**

```tsx
// src/components/viewer/DigestiveCanvas.tsx
import { Canvas } from '@react-three/fiber'
import { Environment, Loader } from '@react-three/drei'
import { Suspense } from 'react'
import { DigestiveModel } from './DigestiveModel'
import { CameraController } from './CameraController'
import { OrganHighlighter } from './OrganHighlighter'
import { BackgroundClickPlane } from './BackgroundClickPlane'

export function DigestiveCanvas() {
  return (
    <>
      <Canvas
        camera={{ position: [0, 2, 8], fov: 50 }}
        className="w-full h-full"
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#1a1a2e']} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
        <directionalLight position={[-5, 0, -3]} intensity={0.4} />
        <Suspense fallback={null}>
          <DigestiveModel />
          <OrganHighlighter />
        </Suspense>
        <BackgroundClickPlane />
        <CameraController />
        <Environment preset="studio" />
      </Canvas>
      <Loader
        containerStyles={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />
    </>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/viewer/DigestiveCanvas.tsx src/components/viewer/BackgroundClickPlane.tsx
git commit -m "feat: add DigestiveCanvas R3F assembly"
```

---

### Task 9: Create ViewerPage and add route

**Files:**
- Create: `src/components/viewer/ViewerPage.tsx`
- Create: `src/components/viewer/__tests__/ViewerPage.test.tsx`
- Modify: `src/app/routes.tsx`
- Modify: `src/lib/locales/en.json`
- Modify: `src/lib/locales/vi.json`

- [ ] **Step 1: Write failing test for ViewerPage**

```tsx
// src/components/viewer/__tests__/ViewerPage.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
// This historical plan predated the viewer-only app and its router removal.
import { ViewerPage } from '../ViewerPage'

vi.mock('@/app/StarterSettingsContext', () => ({
  useStarterSettings: () => ({
    locale: 'vi',
    appVersion: '0.1.0',
    resolvedThemeMode: 'dark',
    settings: {},
    updateSettings: vi.fn(),
  }),
}))

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="r3f-canvas">{children}</div>
  ),
}))

vi.mock('@react-three/drei', () => ({
  Environment: () => null,
  Loader: () => null,
  useFBX: () => null,
}))

describe('ViewerPage', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <MemoryRouter>
        <ViewerPage />
      </MemoryRouter>,
    )
    expect(container).toBeTruthy()
  })

  it('shows reset button', () => {
    render(
      <MemoryRouter>
        <ViewerPage />
      </MemoryRouter>,
    )
    expect(screen.getByText('Về góc nhìn mặc định')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/components/viewer/__tests__/ViewerPage.test.tsx
```
Expected: FAIL — module not found

- [ ] **Step 3: Create ViewerPage.tsx**

```tsx
// src/components/viewer/ViewerPage.tsx
import { ViewerProvider } from './ViewerContext'
import { DigestiveCanvas } from './DigestiveCanvas'
import { ViewerToolbar } from './ViewerToolbar'
import { OrganInfoCard } from './OrganInfoCard'

export function ViewerPage() {
  return (
    <ViewerProvider>
      <main className="relative w-full h-[calc(100vh-3.5rem)] overflow-hidden">
        <DigestiveCanvas />
        <OrganInfoCard />
        <ViewerToolbar />
      </main>
    </ViewerProvider>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/components/viewer/__tests__/ViewerPage.test.tsx
```
Expected: PASS

- [ ] **Step 5: Add locale keys to en.json**

Insert after line 8 (`"nav.settings": "Settings",`):

```
  "nav.viewer": "3D Viewer",
```

Insert before the closing `}`:

```
  "viewer.resetView": "Reset view",
  "viewer.returnToOverview": "Return to overview",
```

Use `src/lib/locales/en.json` — insert after line 8:
```json
  "nav.viewer": "3D Viewer",
```

And insert before line 238 (`}`):
```json
  "viewer.resetView": "Reset view",
  "viewer.returnToOverview": "Return to overview"
```

- [ ] **Step 6: Add locale keys to vi.json**

Insert after line 8 (`"nav.settings": "Cài đặt",`):

```json
  "nav.viewer": "Mô hình 3D",
```

Insert before the closing `}`:
```json
  "viewer.resetView": "Về góc nhìn mặc định",
  "viewer.returnToOverview": "Quay lại tổng thể"
```

- [ ] **Step 7: Add route to routes.tsx**

Modify `src/app/routes.tsx`:

Change line 1 (add `Cube` to import):
```ts
import { ChartLineUp, Cube, GearSix, SquaresFour } from '@phosphor-icons/react'
```

Change line 9 (add 'viewer' to union):
```ts
export type StarterRouteId = 'dashboard' | 'components' | 'settings' | 'viewer'
```

Add after line 6 (import SettingsPage):
```ts
import { ViewerPage } from '@/components/viewer/ViewerPage'
```

Add route entry before closing `]` (after line 48):
```ts
  {
    id: 'viewer',
    path: '/viewer',
    labelKey: 'nav.viewer',
    commandKey: 'command.goViewer',
    keywords: ['3d', 'model', 'organ', 'digestive', 'viewer'],
    icon: Cube,
    element: <ViewerPage />,
  },
```

- [ ] **Step 8: Add command translation keys to en.json**

Insert before `"command.goDashboard"` (line 221):
```json
  "command.goViewer": "Open 3D Viewer",
```

- [ ] **Step 9: Add command translation keys to vi.json**

Insert before `"command.goDashboard"`:
```json
  "command.goViewer": "Mở mô hình 3D",
```

- [ ] **Step 10: Run locale validation**

```bash
pnpm l10n:validate
```
Expected: PASS (no missing keys)

- [ ] **Step 11: Commit**

```bash
git add src/components/viewer/ViewerPage.tsx src/components/viewer/__tests__/ViewerPage.test.tsx src/app/routes.tsx src/lib/locales/en.json src/lib/locales/vi.json
git commit -m "feat: add ViewerPage with /viewer route and locale keys"
```

---

### Task 10: Verify

**Files:** None (verification only)

- [ ] **Step 1: Run TypeScript check**

```bash
npx tsc --noEmit
```
Expected: No errors

- [ ] **Step 2: Run lint**

```bash
pnpm lint
```
Expected: No warnings or errors

- [ ] **Step 3: Run tests**

```bash
pnpm test
```
Expected: All tests pass

- [ ] **Step 4: Run build**

```bash
pnpm build
```
Expected: Build succeeds without errors

---

### Post-Implementation Notes

1. **FBX node names:** The organ names in `organConfig.ts` (`da_day`, `thuc_quan`, etc.) are guesses. After the model loads, check the console for the `No named organ meshes found` warning and adjust node names to match the actual FBX hierarchy. You can inspect loaded node names by adding `console.log(child.name)` inside `fbx.traverse()`.

2. **Camera default position:** `DEFAULT_POSITION` in `CameraController.tsx` may need adjustment once you see the model's actual scale and orientation in the scene.

3. **Tauri production:** For production build, the FBX URL resolution in `DigestiveModel.tsx` currently uses the same path. When integrating Tauri resources, update `resolveModelUrl()` to use `@tauri-apps/api/core.convertFileSrc()`.

4. **Performance:** If the model is very large or rendering slowly, reduce shadow map size, disable antialias, or lower the pixel ratio in the Canvas `gl` prop.
