# Pancreas Rear Camera Design

**Created:** 2026-08-06
**Status:** Approved for implementation planning

## Overview

When the user clicks the pancreas (`tuy`) in the 3D digestive viewer, the camera should fly to a rear-facing viewpoint so the pancreas is easier to observe. Other organs keep the existing default click-to-zoom camera behavior.

## Goals

- Add an organ-specific camera offset for `tuy` only.
- Keep the existing camera bounds calculation and fly-to animation.
- Preserve current behavior for all other organs.
- Add a focused camera controller test proving `tuy` uses the rear viewpoint.

## Approach

Add a small static camera-view configuration keyed by logical organ id. The first entry is `tuy`, with a rear z offset. `CameraController` continues to compute the selected organ bounds, center, max dimension, and distance. It then uses the configured normalized offset for that organ when present; otherwise it uses the current default offset.

Initial offsets:

| Organ id | Offset meaning |
| --- | --- |
| `tuy` | Rear viewpoint: same target center, camera behind the model on negative z |
| all others | Existing default viewpoint: slightly above and in front on positive z |

## Testing

Update `CameraController.test.tsx` to verify:

- Selecting `tuy` moves camera to the rear side of the organ bounds.
- Existing selected-organ behavior still uses the current default forward-side camera placement for non-`tuy` organs.

## Out Of Scope

- UI controls for choosing camera side.
- Per-organ camera tuning beyond `tuy`.
- Changing model orientation, mesh mapping, highlighting, or info cards.
