# Feature 10 Tasks: Drag Placed Pieces

## 10.1: Extend DragStore for Move Mode

**File:** `src/lib/stores/drag.svelte.ts`

Add new state fields for tracking move operations:

```typescript
// Move-drag state (non-null when moving an existing piece)
sourcePieceId = $state<string | null>(null);
originalPosition = $state<Vec2 | null>(null);
originalRotation = $state<number>(0);
originalConnections = $state<Map<string, string> | null>(null);
```

Add `isMoveDrag` derived property:

```typescript
get isMoveDrag(): boolean { return this.sourcePieceId !== null; }
```

Add `startMoveDrag(piece, allPieces)` method:

1. Save original position, rotation, and connections (deep copy the Map)
2. Call `disconnectPiece(piece, allPieces)` from `connections.ts`
3. Set `sourcePieceId = piece.id`
4. Set `activePieceDefinition = piece.definition`
5. Set `preRotation = piece.rotation`
6. Set `isActive = true`
7. Set `selectedPortIndex = 0`

Add `cancelDrag()` method:

1. If `sourcePieceId` is set, return `{ id, position, rotation, connections }` for restoration
2. Call `endDrag()` to reset all state
3. Return null if not a move drag

Update `endDrag()` to also clear move-specific state.

**Deliverable:** DragStore supports move mode with save/restore capability.

---

## 10.2: Unit Test Move-Drag Store

**File:** `src/lib/stores/drag.test.ts`

Add test cases:

1. `startMoveDrag` sets `sourcePieceId`, `isMoveDrag`, and `isActive`
2. `startMoveDrag` preserves original position and rotation
3. `startMoveDrag` deep-copies connections (mutation doesn't affect original)
4. `cancelDrag` returns original state for a move drag
5. `cancelDrag` returns null for a new-piece drag
6. `endDrag` clears all move-specific state
7. `isMoveDrag` is false for new-piece drags

**Deliverable:** Full test coverage of move-drag state management.

---

## 10.3: Add Move Initiation to TrackPiece

**File:** `src/lib/components/TrackPiece.svelte`

Add a new callback prop `onStartMove`:

```typescript
interface Props {
  piece: PlacedPiece;
  isSelected?: boolean;
  onSelect?: () => void;
  onStartMove?: () => void;
}
```

Add mousedown handler on the `<g>` element:

```typescript
const handleMouseDown = (event: MouseEvent): void => {
  if (isSelected && onStartMove) {
    event.preventDefault();
    event.stopPropagation();
    onStartMove();
  }
};
```

This fires only when the piece is already selected — first click selects, second click+drag moves.

**Important:** `stopPropagation` prevents the canvas from interpreting this as a pan gesture.

**Deliverable:** Selected pieces can initiate move on mousedown.

---

## 10.4: Wire Move-Drag in Canvas

**File:** `src/lib/components/Canvas.svelte`

Add a `handleStartMove` function that Canvas passes to each `TrackPiece`:

```typescript
const handleStartMove = (piece: PlacedPiece): void => {
  dragStore.startMoveDrag(piece, layoutStore.pieces);
  layoutStore.removePiece(piece.id);

  // Set up mousemove/mouseup listeners (similar to PiecePanel)
  const handleMouseMove = (event: MouseEvent): void => {
    const worldPos = getWorldPositionFromEvent(event);
    if (worldPos) dragStore.updateCursorPosition(worldPos);
  };

  const handleMouseUp = (): void => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    // Drop is handled by existing handleCanvasMouseUp
  };

  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
};
```

Update the `<TrackPiece>` rendering to pass the move handler:

```svelte
<TrackPiece
	{piece}
	isSelected={selectionStore.isSelected(piece.id)}
	onSelect={() => selectionStore.select(piece.id)}
	onStartMove={() => handleStartMove(piece)}
/>
```

**Deliverable:** Move-drag integrated into Canvas component.

---

## 10.5: Handle Move-Drag Drop

**File:** `src/lib/components/Canvas.svelte`

Update `handleCanvasMouseUp` to handle move-drag drops:

When `dragStore.isMoveDrag`:

- Reuse `dragStore.sourcePieceId` as the piece ID instead of generating a new one
- Otherwise, placement logic is identical to new piece drops

When placing:

```typescript
const pieceId = dragStore.isMoveDrag ? dragStore.sourcePieceId! : `piece-${nextPieceId++}`;
const newPiece: PlacedPiece = {
  id: pieceId,
  definition: dragStore.activePieceDefinition!,
  position,
  rotation,
  connections
};
```

**Deliverable:** Move-drag drops place the piece at new position with original ID.

---

## 10.6: Handle Move-Drag Cancel

**File:** `src/routes/+page.svelte` (keydown handler)

Add Escape key handling for move-drag cancel:

```typescript
if (event.key === 'Escape' && dragStore.isActive) {
  if (dragStore.isMoveDrag) {
    const original = dragStore.cancelDrag();
    if (original) {
      // Restore piece to layout at original position
      layoutStore.addPiece({
        id: original.id,
        definition: dragStore.activePieceDefinition!, // read before cancel clears it
        position: original.position,
        rotation: original.rotation,
        connections: original.connections
      });
      // TODO: Also need to restore connections on neighbor pieces
    }
  } else {
    dragStore.endDrag();
  }
}
```

**Important edge case:** When restoring, we need to re-establish the connections on the neighbor pieces too. The `startMoveDrag` disconnected both sides. Store the full connection pairs so we can restore both directions.

**Deliverable:** Escape cancels move and restores piece to original state.

---

## 10.7: Final Verification

**Verification steps:**

1. Click a piece to select it, then drag → piece moves with cursor
2. Move drag shows snap indicators on nearby open ports
3. Drop onto open port → piece snaps and connects
4. Drop on empty area → piece placed at cursor position
5. Press Escape during move → piece returns to original position with all connections restored
6. Non-selected pieces: click selects but doesn't drag
7. After move, piece ID is unchanged (verify in dev tools or toolbar display)
8. Move works correctly when zoomed/panned (if F9 is complete)
9. All original tests pass: `pnpm test:unit`
10. Build succeeds: `pnpm build`
11. Manual E2E: place 3 connected pieces, move the middle one, verify connections break and re-form

**Deliverable:** Drag-to-move feature complete and verified.
