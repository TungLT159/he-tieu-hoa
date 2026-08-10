# 3D Digestive System Viewer — Core Design

**Phase:** Group 1 — Core 3D/2D Viewer  
**Created:** 2026-08-05  
**Status:** Draft

---

## 1. Overview

Build a 3D interactive viewer for the digestive system model (`hetieuhoa.fbx`, ~4 MB) as a new page within the existing Tauri + React starter app. The viewer supports free 3D navigation, click-to-select organs with fly-to camera animation, info card overlay, and organ highlighting.

### Scope (this spec)

| In scope | Out of scope (future groups) |
|----------|------------------------------|
| 3D free navigation (orbit, pan, zoom) | 2D mode toggle |
| Click organ → select + fly-to + info card | Audio narration / multi-language voices |
| Organ highlight on selection | AI chatbot |
| Reset to overview | VR / TV / interactive screen integration |
| Loading / error states | Auto-presentation mode |
| Organ data from config file | Drawing annotations / screenshot tools |
| Light/dark theme compatibility | Video lecture side-by-side |
| | USB portable / one-click installer |

---

## 2. Technical Approach

**Choice: react-three-fiber + drei (R3F).**

Rationale: The existing codebase is React-based with shadcn/ui. R3F provides a declarative React API over Three.js that maps naturally to the existing component patterns. Drei provides battle-tested building blocks (OrbitControls, Html overlay, camera lerp, raycasting hooks). FBX is loaded via `useFBX` (drei) which wraps Three.js `FBXLoader`.

### Dependencies to add

```
three
@react-three/fiber
@react-three/drei
three-stdlib          (for FBXLoader typings; drei bundles the loader)
@types/three          (dev)
```

---

## 3. Architecture

### 3.1 Directory structure

```
src/components/viewer/
  DigestiveCanvas.tsx       -- R3F <Canvas> wrapper: camera, lights, scene
  DigestiveModel.tsx        -- useFBX() load model, traverse organ nodes
  OrganClickHandler.tsx     -- Raycaster on click, dispatch organ selection
  CameraController.tsx      -- OrbitControls + lerp fly-to animation
  OrganHighlighter.tsx      -- Highlight selected mesh (emissive / outline)
  OrganInfoCard.tsx         -- Shadcn <Card> overlay with organ info
  ViewerToolbar.tsx         -- Toolbar: reset view, toggle helpers
  organConfig.ts            -- Map nodeName → displayName, description
  hooks/
    useOrganSelection.ts    -- Selected organ state + setters
    useCameraTarget.ts      -- Current camera target (overview | organName)
    useModelNodes.ts        -- Map<string, THREE.Mesh> of organ nodes
  __tests__/
    DigestiveModel.test.tsx
    organConfig.test.ts
```

```
src/app/
  routes.tsx                -- Add /viewer route

public/models/
  hetieuhoa.fbx             -- Copied from src-tauri/resources/

src/lib/locales/
  en.json                   -- Add viewer.* keys
  vi.json                   -- Add viewer.* keys
```

### 3.2 Component tree

```
<ViewerPage>
  <ViewerContext.Provider>
    <DigestiveCanvas>              ← R3F Canvas (100vw x 100vh)
      <ambientLight />
      <directionalLight />
      <CameraController />         ← OrbitControls + lerp
      <Suspense fallback={null}>
        <DigestiveModel>           ← useFBX + traverse
          <OrganClickHandler />    ← onPointerDown + raycast
          <OrganHighlighter />     ← emissive on selected mesh
        </DigestiveModel>
      </Suspense>
      <Environment preset="studio" />
      <Html fullscreen>
        <OrganInfoCard />          ← absolute positioned, shadcn Card
      </Html>
    </DigestiveCanvas>
    <Loader />                     ← drei loading spinner
    <ViewerToolbar />              ← absolute top-right, DOM
  </ViewerContext.Provider>
</ViewerPage>
```

### 3.3 Interaction flow

```
[User clicks on model]
  → OrganClickHandler: raycaster.intersectObjects(organMeshes)
  → Hit found? → context.setSelectedOrgan(nodeName)
    ├─ CameraController: lerp camera to organ position, set pivot
    ├─ OrganHighlighter: set mesh.material.emissive
    └─ OrganInfoCard: show info from organConfig[nodeName]
  → Hit miss (background)?
    └─ context.setSelectedOrgan(null)
      ├─ CameraController: lerp back to default overview position
      ├─ OrganHighlighter: clear emissive
      └─ OrganInfoCard: hide
```

---

## 4. Data

### 4.1 Organ config (`organConfig.ts`)

```ts
interface OrganInfo {
  nodeName: string;
  displayName: string;
  displayNameEn: string;
  description: string;
  descriptionEn: string;
  audioFile?: string;       // placeholder for group 2 (audio narration)
}

export const ORGAN_MAP: Record<string, OrganInfo> = {
  "da_day": {
    nodeName: "da_day",
    displayName: "Dạ dày",
    displayNameEn: "Stomach",
    description: "Cơ quan tiêu hóa chính...",
    descriptionEn: "The main digestive organ...",
  },
  // ... additional organs
};
```

### 4.2 Viewer state (`ViewerContext`)

```ts
interface ViewerState {
  selectedOrgan: string | null;
  organNodes: Map<string, THREE.Mesh>;
  cameraTarget: 'overview' | string;
  isTransitioning: boolean;
  showInfoCard: boolean;
  isModelLoaded: boolean;
  loadError: string | null;
}
```

---

## 5. Route & Integration

### 5.1 Route definition (add to `routes.tsx`)

```ts
{
  id: 'viewer',
  path: '/viewer',
  labelKey: 'nav.viewer',
  commandKey: 'nav.viewer',
  keywords: ['3d', 'model', 'organ', 'digestive', 'viewer'],
  icon: Cube,
  element: <ViewerPage />,
}
```

### 5.2 ViewerPage layout

The ViewerPage overrides the default AppShell content layout: Canvas fills the viewport, info card and toolbar are absolutely positioned overlays on top.

```tsx
function ViewerPage() {
  return (
    <main className="relative w-screen h-[calc(100vh-var(--header-height))] overflow-hidden">
      <DigestiveCanvas />
      <ViewerToolbar />
    </main>
  );
}
```

### 5.3 Locale keys

Add to `en.json` and `vi.json`:

| Key | en | vi |
|-----|-----|-----|
| `nav.viewer` | 3D Viewer | Mô hình 3D |
| `viewer.loading` | Loading model... | Đang tải mô hình... |
| `viewer.loadError` | Failed to load model | Không thể tải mô hình |
| `viewer.overview` | Overview | Tổng thể |
| `viewer.resetView` | Reset view | Về góc nhìn mặc định |
| `viewer.noOrganSelected` | Click an organ to view details | Click vào cơ quan để xem chi tiết |
| `viewer.screenshot` | Screenshot | Chụp ảnh |
| `viewer.returnToOverview` | Return to overview | Quay lại tổng thể |

---

## 6. Asset Serving

FBX file location: `src-tauri/resources/hetieuhoa.fbx` (already exists).

- **Development:** Copy to `public/models/hetieuhoa.fbx`. Vite dev server serves it at `/models/hetieuhoa.fbx`.
- **Production:** Tauri embeds `resources/` via its resource system. Use `@tauri-apps/api/core.convertFileSrc()` or the `tauri://localhost` asset protocol to resolve the URL.

```ts
function resolveModelUrl(): string {
  if (import.meta.env.DEV) {
    return '/models/hetieuhoa.fbx';
  }
  return convertFileSrc('models/hetieuhoa.fbx');
}
```

---

## 7. Camera Controller Detail

### Default mode: OrbitControls

- Left drag: rotate
- Scroll: zoom (clamped min/max)
- Right/middle drag: pan

### Fly-to mode (triggered by organ selection)

```
1. Calculate target position: mesh.worldPosition + offset along camera direction
2. Lerp camera.position → target over ~1s using useFrame
3. Simultaneously lerp controls.target → mesh.worldPosition
4. Set isTransitioning = true during animation (disable OrbitControls input)
5. On complete: set isTransitioning = false
```

### Reset to overview

Same lerp pattern, moving camera to default position and controls.target to model center.

---

## 8. Organ Highlighting

Two approaches, to be determined during implementation:

- **A (Simple):** Replace selected mesh material with a clone that has `emissive` set to the highlight color. Restore original material on deselect.
- **B (Post-processing):** Use `OutlinePass` or `Selection` from drei/post-processing. Better visual but requires EffectComposer.

Start with approach A; switch to B if visual quality is insufficient.

---

## 9. Error & Edge Cases

| Case | Behavior |
|------|----------|
| FBX file not found (404) | Show `<EmptyState>` component with retry button |
| FBX corrupt / parse error | Show error message, log details to console |
| FBX has no named children | Render normally, disable click-to-select, show notice |
| User clicks rapidly on multiple organs | Abort current lerp, start new one (latest wins) |
| Window resize | R3F Canvas auto-resizes; OrbitControls auto-adjust |
| Low FPS device | target 30fps min; disable shadows/environment if needed |
| Theme change (light/dark) | Info card follows shadcn theme; model lighting independent |

---

## 10. Testing Strategy

| Layer | Tool | What to test |
|-------|------|--------------|
| `organConfig.ts` | Vitest | All node names valid, no duplicates, displayName/description present |
| `DigestiveModel` | Vitest + @react-three/test-renderer | Model loads, traverse finds named nodes |
| `OrganClickHandler` | Vitest | Raycast logic, selection dispatch |
| ViewerPage | Playwright smoke | Page loads without crash, canvas renders |

---

## 11. Open Questions (deferred)

- Exact node names in the FBX hierarchy → determined at runtime by traversing the loaded model
- Organ highlight approach → start with emissive (A), evaluate post-processing (B)
- 2D view mode → deferred to future group
- Audio file paths and format → deferred to group 2
