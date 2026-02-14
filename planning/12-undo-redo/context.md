# Feature 12: Undo/Redo

## Purpose

Allow users to undo and redo actions, enabling fearless experimentation. This is especially important now that pieces can be moved (F10) — accidental moves should be trivially reversible.

## Dependencies

- **F4 (Layout Store)** ✅ — Piece management
- **F10 (Drag Placed Pieces)** — Move actions should be undoable
- **F11 (Save/Load)** — Undo/redo should trigger auto-save

## Design Decisions

### Architecture: Command Pattern

Each user action is encapsulated as an `Action` object with `execute()` and `undo()` methods. An `UndoStore` maintains two stacks:

```typescript
interface Action {
  type: string;
  execute(): void;
  undo(): void;
}

class UndoStore {
  undoStack = $state<Action[]>([]);
  redoStack = $state<Action[]>([]);

  push(action: Action): void;     // Execute and push to undo stack, clear redo
  undo(): void;                    // Pop from undo, call undo(), push to redo
  redo(): void;                    // Pop from redo, call execute(), push to undo
  canUndo: boolean;                // Derived: undoStack.length > 0
  canRedo: boolean;                // Derived: redoStack.length > 0
  clear(): void;                   // Reset both stacks
}
```

### Action Types

| Action              | execute()                                       | undo()                                       |
| ------------------- | ----------------------------------------------- | -------------------------------------------- |
| `AddPieceAction`    | Add piece to layout, create connections         | Remove piece, disconnect                     |
| `RemovePieceAction` | Remove piece, disconnect                        | Re-add piece, restore connections            |
| `MovePieceAction`   | Move piece to new position with new connections | Restore to old position with old connections |

### Snapshot vs. Command

Two approaches exist:

1. **Snapshot:** Save entire layout state before/after each action. Simple but memory-heavy.
2. **Command:** Each action knows how to undo itself. More code but O(1) memory per action.

**Choice: Command pattern** — layouts can get large, and the action set is small and well-defined.

### Integration Points

Currently, pieces are added/removed directly via `layoutStore.addPiece()` / `layoutStore.removePiece()`. For undo/redo:

- All mutations must go through `undoStore.push(new XxxAction(...))` instead of calling layoutStore directly
- The `Canvas.svelte` drop handler and `Toolbar.svelte` delete handler need to create Action objects
- Move-drag (F10) creates `MovePieceAction` on drop

### Connection State in Undo

The trickiest part: connections are bidirectional (both pieces reference each other). When undoing a piece addition:

1. Remove the piece
2. Remove connection references from all neighbor pieces

When undoing a piece removal (re-adding):

1. Re-add the piece with its original connections
2. Restore connection references on all neighbor pieces

The `Action` objects must store enough connection info to restore both sides.

### Stack Limits

Cap the undo stack at **50 actions** to prevent unbounded memory growth. When the stack is full, drop the oldest action.

### Keyboard Shortcuts

- `Ctrl+Z` — Undo
- `Ctrl+Y` or `Ctrl+Shift+Z` — Redo

## Affected Files

| File                                | Action | Description                                             |
| ----------------------------------- | ------ | ------------------------------------------------------- |
| `src/lib/stores/undo.svelte.ts`     | Create | UndoStore with action stack                             |
| `src/lib/stores/undo.test.ts`       | Create | Unit tests for undo/redo logic                          |
| `src/lib/stores/actions.ts`         | Create | Action classes (Add, Remove, Move)                      |
| `src/lib/stores/actions.test.ts`    | Create | Unit tests for action execute/undo                      |
| `src/lib/components/Canvas.svelte`  | Modify | Wrap placement in AddPieceAction                        |
| `src/lib/components/Toolbar.svelte` | Modify | Add undo/redo buttons, wrap delete in RemovePieceAction |
| `src/routes/+page.svelte`           | Modify | Add Ctrl+Z/Y keyboard handlers                          |

## Acceptance Criteria

1. Placing a piece can be undone (piece disappears, connections removed)
2. Undoing a placement can be redone (piece reappears with connections)
3. Deleting a piece can be undone (piece reappears with all connections)
4. Moving a piece can be undone (piece returns to original position with original connections)
5. Undo/redo buttons in toolbar, disabled when stack is empty
6. `Ctrl+Z` undoes, `Ctrl+Y` / `Ctrl+Shift+Z` redoes
7. New actions clear the redo stack
8. Stack capped at 50 actions
9. Auto-save triggers after undo/redo
10. All existing tests continue to pass
11. Build succeeds with no errors

## Risks

- **Connection restoration complexity** — Undoing a removal must restore connections on both the removed piece AND its neighbors. This requires storing the full connection state of affected neighbors at action creation time.
- **Action ordering with rapid mutations** — If save/load (F11) loads a layout, it should clear the undo stack (can't undo a load).
- **Move action granularity** — A move is conceptually one action but involves remove + add + disconnect + reconnect. The `MovePieceAction` must encapsulate all of this atomically.
