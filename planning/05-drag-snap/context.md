# Feature 5: Drag & Snap

Implement drag-to-place interaction with automatic snapping to open ports. This is the core gameplay mechanic.

## Context

Drag flow:

1. User starts dragging from piece palette
2. Ghost piece follows cursor
3. System checks for nearby open ports
4. If match found: highlight target, snap ghost to exact position
5. On drop: place piece, create connection

## Files to Create

| File                                    | Type      | Purpose                                            |
| --------------------------------------- | --------- | -------------------------------------------------- |
| `src/lib/stores/drag.svelte.ts`         | Store     | Drag state: active piece type, cursor, snap target |
| `src/lib/components/PiecePanel.svelte`  | Component | Draggable piece palette                            |
| `src/lib/components/DragPreview.svelte` | Component | Ghost piece following cursor                       |
| `src/lib/utils/snap.ts`                 | Utilities | Compute snapped position/rotation from ports       |
| `src/lib/utils/snap.test.ts`            | Tests     | Snap math for all 8 directions                     |
| `src/routes/+page.svelte`               | Modify    | Layout with panel + canvas                         |

## Acceptance Criteria

- [ ] Can drag items from panel
- [ ] Preview follows cursor
- [ ] Snap targets highlight on proximity
- [ ] Preview snaps to computed position
- [ ] Pieces placed with correct position/rotation
- [ ] Connections created automatically
- [ ] First piece drops at cursor (no snap)

## Dependencies

- Features 2, 3, 4: Geometry, pieces, canvas, store
