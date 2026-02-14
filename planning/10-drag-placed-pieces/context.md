# Feature 10: Drag Placed Pieces (Reposition)

## Purpose

Allow users to move pieces after they've been placed. This is critical for layout iteration — currently the only way to reposition a piece is to delete it and re-place it from scratch, losing all mental context about where it was.

## Dependencies

- **F5 (Drag & Snap)** ✅ — Drag and snap infrastructure
- **F7 (Selection & Delete)** ✅ — Piece selection
- **F9 (Canvas Viewport)** — Coordinate transforms must account for zoom/pan

## Design Decisions

### Interaction Flow

1. User clicks a placed piece to select it (existing behavior)
2. User clicks and drags the selected piece
3. The piece disconnects from all neighbors
4. A drag preview appears (reusing existing DragPreview)
5. The piece follows the cursor, with snap detection active
6. On drop: piece is placed at new position with new connections
7. On drop outside canvas or Escape: piece returns to original position (cancel)

### Why Only Selected Pieces?

Requiring selection first (rather than "drag any piece immediately") avoids ambiguity:

- Click without drag = select (existing behavior)
- Click on selected + drag = move
- Click on unselected piece = select (not move)

This prevents accidental moves and keeps the interaction model simple.

### DragStore Extensions

Add to the existing `DragStore`:

```typescript
sourcePieceId = $state<string | null>(null);     // Non-null = moving existing piece
originalPosition = $state<Vec2 | null>(null);     // For cancel/restore
originalRotation = $state<number>(0);             // For cancel/restore
originalConnections = $state<Map<string, string> | null>(null); // For cancel/restore
```

New methods:

- `startMoveDrag(piece: PlacedPiece)` — Populates source info, disconnects piece, removes from layout, starts drag
- `cancelDrag()` — Restores piece to original position (if move drag)

### Connection Cleanup

When starting a move:

1. Save original connection state (for restore on cancel)
2. Call `disconnectPiece(piece, allPieces)` — this already exists in `connections.ts`
3. Remove piece from `layoutStore.pieces` temporarily

### Drop Handling

On successful drop:

- If `sourcePieceId` is set: reuse the original piece ID (so undo/redo can track it)
- If snapped: create new connections as with new piece placement
- If not snapped (free placement): place at cursor position with pre-rotation

On cancel (Escape or drop outside canvas):

- Restore piece to original position, rotation, and connections
- Re-add to layout

### Drag Preview Reuse

The existing `DragPreview` component already renders a ghost piece at the drag position. No changes needed — it reads from `dragStore.activePieceDefinition` which will be set for both new and move drags.

### TrackPiece Interaction

Need to add mousedown handler to `TrackPiece` that initiates move drag when the piece is already selected:

```typescript
const handleMouseDown = (event: MouseEvent): void => {
  if (isSelected) {
    event.preventDefault();
    event.stopPropagation();
    onStartMove?.();
  }
};
```

## Affected Files

| File                                   | Action | Description                               |
| -------------------------------------- | ------ | ----------------------------------------- |
| `src/lib/stores/drag.svelte.ts`        | Modify | Add move-drag state and methods           |
| `src/lib/stores/drag.test.ts`          | Modify | Test move-drag flow                       |
| `src/lib/components/Canvas.svelte`     | Modify | Handle move-drag drops, pass onStartMove  |
| `src/lib/components/TrackPiece.svelte` | Modify | Add mousedown handler for move initiation |
| `src/lib/components/PiecePanel.svelte` | Minor  | Ensure coord transforms still work        |
| `src/lib/utils/connections.ts`         | None   | `disconnectPiece` already exists          |

## Acceptance Criteria

1. Clicking and dragging a selected piece starts a move operation
2. The piece visually follows the cursor during drag
3. All connections are removed when move starts (ports turn amber)
4. The piece snaps to open ports during drag (same as new piece)
5. On drop, new connections are created at the new position
6. Pressing Escape during drag restores the piece to its original position and connections
7. Non-selected pieces cannot be dragged (click selects first)
8. Piece ID is preserved after move (important for future undo/redo)
9. All existing tests continue to pass
10. Build succeeds with no errors

## Edge Cases

- **Moving a piece that closes a loop:** After move, the loop is broken. The moved piece may close a different loop at its new position.
- **Moving the only piece:** Should work — disconnection is a no-op, piece goes to free placement mode.
- **Moving while zoomed/panned:** Coordinate transforms must be correct (handled by F9's viewBox approach).
- **Double-click to move:** Shouldn't trigger — only mousedown+drag on selected piece.
