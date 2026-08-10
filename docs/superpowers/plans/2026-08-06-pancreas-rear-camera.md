# Pancreas Rear Camera Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make pancreas (`tuy`) clicks fly the camera to a rear viewpoint while preserving current camera behavior for all other organs.

**Architecture:** Keep the change local to `CameraController.tsx` by adding a small organ-specific camera offset map. The controller continues to compute selected organ bounds and distance, then applies either the organ-specific normalized offset or the current default offset.

**Tech Stack:** React 19, TypeScript, Three.js, @react-three/fiber, @react-three/drei, Vitest.

---

## File Structure

- Modify `src/components/viewer/CameraController.tsx`: add camera offset config and apply `tuy` rear offset when selected.
- Modify `src/components/viewer/__tests__/CameraController.test.tsx`: add focused tests for pancreas rear viewpoint and default non-pancreas viewpoint.

---

### Task 1: Pancreas Rear Camera Offset

**Files:**
- Modify: `src/components/viewer/CameraController.tsx`
- Test: `src/components/viewer/__tests__/CameraController.test.tsx`

- [ ] **Step 1: Add failing camera tests**

In `src/components/viewer/__tests__/CameraController.test.tsx`, add this test after the existing combined-bounds test:

```ts
it('frames the pancreas from the rear side of the model', async () => {
  const pancreasMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))
  pancreasMesh.position.set(0, 0, 0)

  renderWithViewer(<CameraController />, {
    selectedOrgan: 'tuy',
    organNodes: new Map([['tuy', [pancreasMesh]]]),
    setCameraTarget: vi.fn(),
    isTransitioning: true,
    setIsTransitioning: vi.fn(),
  })

  const { useFrame } = await getFiberMocks()
  vi.mocked(performance.now).mockReturnValue(1000)
  useFrame.mock.calls.at(-1)?.[0]({} as never)

  expect(camera.position.x).toBeCloseTo(0)
  expect(camera.position.y).toBeCloseTo(1.2)
  expect(camera.position.z).toBeCloseTo(-3)
})
```

Add this explicit default behavior test next to it:

```ts
it('keeps the default front-side viewpoint for non-pancreas organs', async () => {
  const liverMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))
  liverMesh.position.set(0, 0, 0)

  renderWithViewer(<CameraController />, {
    selectedOrgan: 'gan',
    organNodes: new Map([['gan', [liverMesh]]]),
    setCameraTarget: vi.fn(),
    isTransitioning: true,
    setIsTransitioning: vi.fn(),
  })

  const { useFrame } = await getFiberMocks()
  vi.mocked(performance.now).mockReturnValue(1000)
  useFrame.mock.calls.at(-1)?.[0]({} as never)

  expect(camera.position.x).toBeCloseTo(0)
  expect(camera.position.y).toBeCloseTo(1.2)
  expect(camera.position.z).toBeCloseTo(3)
})
```

- [ ] **Step 2: Run camera tests to verify failure**

Run: `pnpm test src/components/viewer/__tests__/CameraController.test.tsx`

Expected: FAIL because pancreas still uses the default positive-z camera position.

- [ ] **Step 3: Implement organ-specific camera offsets**

In `src/components/viewer/CameraController.tsx`, add constants near existing camera constants:

```ts
const DEFAULT_CAMERA_OFFSET = new THREE.Vector3(0, 0.4, 1)
const ORGAN_CAMERA_OFFSETS = new Map<string, THREE.Vector3>([
  ['tuy', new THREE.Vector3(0, 0.4, -1)],
])
```

Then replace the current selected-organ end position logic:

```ts
endTarget.current.copy(center)
endPosition.current.set(center.x, center.y + distance * 0.4, center.z + distance)
```

with:

```ts
const cameraOffset = ORGAN_CAMERA_OFFSETS.get(target) ?? DEFAULT_CAMERA_OFFSET

endTarget.current.copy(center)
endPosition.current.set(
  center.x + distance * cameraOffset.x,
  center.y + distance * cameraOffset.y,
  center.z + distance * cameraOffset.z,
)
```

- [ ] **Step 4: Run focused tests**

Run: `pnpm test src/components/viewer/__tests__/CameraController.test.tsx`

Expected: PASS.

- [ ] **Step 5: Run TypeScript check**

Run: `npx tsc --noEmit`

Expected: PASS.

- [ ] **Step 6: Commit**

Run:

```bash
git add src/components/viewer/CameraController.tsx src/components/viewer/__tests__/CameraController.test.tsx docs/superpowers/specs/2026-08-06-pancreas-rear-camera-design.md docs/superpowers/plans/2026-08-06-pancreas-rear-camera.md
git commit -m "fix: focus pancreas from rear camera angle"
```

If the workspace is not a git repository, skip the commit and report that no commit was made.

---

## Self-Review Notes

- Spec coverage: The single task covers the `tuy` rear viewpoint, default behavior preservation, focused tests, and TypeScript verification.
- Placeholder scan: No placeholders or deferred work remain.
- Type consistency: Organ id is consistently `tuy`; offset config uses `THREE.Vector3`; existing camera target flow remains unchanged.
