# Feature 12 Tasks: Undo/Redo

## 12.1: Create UndoStore

**File:** `src/lib/stores/undo.svelte.ts`

```typescript
export interface Action {
  readonly type: string;
  execute(): void;
  undo(): void;
}

const MAX_UNDO_STACK = 50;

export class UndoStore {
  undoStack = $state<Action[]>([]);
  redoStack = $state<Action[]>([]);

  get canUndo(): boolean { return this.undoStack.length > 0; }
  get canRedo(): boolean { return this.redoStack.length > 0; }

  push(action: Action): void {
    action.execute();
    this.undoStack = [...this.undoStack, action].slice(-MAX_UNDO_STACK);
    this.redoStack = []; // New action clears redo
  }

  undo(): void {
    const action = this.undoStack.at(-1);
    if (!action) return;
    action.undo();
    this.undoStack = this.undoStack.slice(0, -1);
    this.redoStack = [...this.redoStack, action];
  }

  redo(): void {
    const action = this.redoStack.at(-1);
    if (!action) return;
    action.execute();
    this.redoStack = this.redoStack.slice(0, -1);
    this.undoStack = [...this.undoStack, action];
  }

  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }
}

export const undoStore = new UndoStore();
```

**Deliverable:** UndoStore with stack management.

---

## 12.2: Create Action Classes

**File:** `src/lib/stores/actions.ts`

### AddPieceAction

```typescript
class AddPieceAction implements Action {
  type = 'add-piece';
  constructor(
    private piece: PlacedPiece,
    private connectionPairs: Array<{ pieceAId: string; portAId: string; pieceBId: string; portBId: string }>,
    private layoutStore: LayoutStore
  ) {}

  execute(): void {
    this.layoutStore.addPiece(this.piece);
    // Establish all connections (both sides)
    for (const pair of this.connectionPairs) { ... }
  }

  undo(): void {
    // Remove connections from neighbors, then remove piece
    this.layoutStore.removePiece(this.piece.id);
  }
}
```

### RemovePieceAction

```typescript
class RemovePieceAction implements Action {
  type = 'remove-piece';
  constructor(
    private piece: PlacedPiece,           // Snapshot of piece before removal
    private neighborConnections: ...,      // Connections to restore on neighbors
    private layoutStore: LayoutStore
  ) {}

  execute(): void {
    this.layoutStore.removePiece(this.piece.id);
  }

  undo(): void {
    this.layoutStore.addPiece(deepClonePiece(this.piece));
    // Restore connections on neighbor pieces
  }
}
```

### MovePieceAction

```typescript
class MovePieceAction implements Action {
  type = 'move-piece';
  constructor(
    private pieceId: string,
    private oldState: { position: Vec2; rotation: number; connections: Map<string, string> },
    private newState: { position: Vec2; rotation: number; connections: Map<string, string> },
    private oldNeighborConnections: ...,
    private newNeighborConnections: ...,
    private layoutStore: LayoutStore
  ) {}

  execute(): void { /* apply newState */ }
  undo(): void { /* apply oldState */ }
}
```

**Helper:** `deepClonePiece(piece)` — clones a PlacedPiece including a new Map for connections.

**Deliverable:** All action types with execute/undo logic.

---

## 12.3: Unit Test UndoStore

**File:** `src/lib/stores/undo.test.ts`

Test cases:

1. Initial state: empty stacks, canUndo=false, canRedo=false
2. Push action: execute() called, action on undoStack, canUndo=true
3. Undo: undo() called, moved to redoStack, canRedo=true
4. Redo: execute() called again, moved back to undoStack
5. Push after undo: redoStack cleared
6. Stack overflow: >50 pushes, oldest dropped
7. Undo on empty: no-op, no error
8. Redo on empty: no-op, no error
9. Clear: both stacks empty

**Deliverable:** Comprehensive UndoStore tests.

---

## 12.4: Unit Test Action Classes

**File:** `src/lib/stores/actions.test.ts`

Test each action type independently with a real LayoutStore:

1. **AddPieceAction.execute():** Piece appears in store, connections established
2. **AddPieceAction.undo():** Piece removed, neighbor connections cleaned
3. **RemovePieceAction.execute():** Piece removed from store
4. **RemovePieceAction.undo():** Piece restored with connections
5. **MovePieceAction.execute():** Piece at new position with new connections
6. **MovePieceAction.undo():** Piece at old position with old connections
7. **Round-trip:** execute → undo → execute → undo returns to original state

**Deliverable:** All action types tested for correctness.

---

## 12.5: Integrate into Canvas (Piece Placement)

**File:** `src/lib/components/Canvas.svelte`

Modify `handleCanvasMouseUp`:

- Instead of calling `layoutStore.addPiece(newPiece)` directly, create an `AddPieceAction` and push it to `undoStore`
- The action's `execute()` handles the addPiece + connections
- This changes the flow from imperative to command-based

Similar for move-drag drops: create `MovePieceAction` instead of directly manipulating the store.

**Deliverable:** Piece placement goes through undo system.

---

## 12.6: Integrate into Toolbar (Delete & Buttons)

**File:** `src/lib/components/Toolbar.svelte`

1. Modify delete handler: create `RemovePieceAction` and push to `undoStore`
2. Add undo/redo buttons:

```svelte
<button onclick={() => undoStore.undo()} disabled={!undoStore.canUndo}> Undo </button>
<button onclick={() => undoStore.redo()} disabled={!undoStore.canRedo}> Redo </button>
```

**Deliverable:** Delete is undoable, undo/redo buttons in toolbar.

---

## 12.7: Keyboard Shortcuts & Final Verification

**File:** `src/routes/+page.svelte`

Add to existing keydown handler:

```typescript
if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
  e.preventDefault();
  undoStore.undo();
} else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
  e.preventDefault();
  undoStore.redo();
}
```

**Verification:**

1. Place a piece → Ctrl+Z → piece gone → Ctrl+Y → piece back
2. Delete a piece → Ctrl+Z → piece restored with all connections
3. Move a piece → Ctrl+Z → piece at original position with original connections
4. 5× place → 3× undo → place new → redo stack cleared
5. Undo/redo buttons reflect stack state (enabled/disabled)
6. Auto-save triggers after undo/redo (if F11 is complete)
7. `pnpm test:unit` — all pass
8. `pnpm build` — succeeds

**Deliverable:** Undo/redo feature complete with keyboard shortcuts.
