# Feature 6: Piece Rotation (Pre-Placement)

Allow users to rotate pieces before placing them, enabling connection from different ports.

## Context

While dragging, user can rotate in 45° increments using the R key or scroll wheel. This lets them choose which port to connect from (e.g., straight piece facing N vs S).

## Files to Create/Modify

| File                                   | Type      | Action                          |
| -------------------------------------- | --------- | ------------------------------- |
| `src/lib/components/PiecePanel.svelte` | Component | Modify: add rotation hint       |
| `src/lib/stores/drag.svelte.ts`        | Store     | Already has `preRotation` field |
| Keydown handler                        | JS        | Listen for R key during drag    |

## Acceptance Criteria

- [ ] R key increments pre-rotation by 45°
- [ ] Rotation wraps at 360°
- [ ] Preview shows rotated piece
- [ ] Snap accounts for pre-rotation
- [ ] Pieces placed with correct final rotation

## Dependencies

- Feature 5: Drag system
