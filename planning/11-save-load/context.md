# Feature 11: Save/Load Layouts

## Purpose

Persist layouts to `localStorage` so users don't lose their work when closing the browser. Also enables working on multiple layouts.

## Dependencies

- **F4 (Canvas & Layout Store)** ✅ — LayoutStore with pieces array
- No dependency on F9 or F10 (viewport state and move-drag are independent)

## Design Decisions

### Storage Backend: localStorage

- Simple, synchronous, no permissions needed
- ~5MB per origin — more than enough for hundreds of layouts
- Data survives browser restarts but not browser reinstall/clear
- No server needed — compatible with static site

### Serialization Format

`PlacedPiece` has two JSON-unfriendly fields:

1. `connections: Map<string, string>` — Maps don't serialize to JSON
2. `definition: PieceDefinition` — Object reference, should be stored as a type string

Serialized format:

```typescript
interface SerializedPiece {
  id: string;
  type: string;          // e.g., 'shortStraight', 'curve45', 'longStraight', 'turnout', 'bridge'
  position: Vec2;
  rotation: number;
  connections: Record<string, string>;  // Plain object instead of Map
}

interface SerializedLayout {
  version: 1;            // Schema version for future migrations
  name: string;
  createdAt: string;     // ISO date
  updatedAt: string;     // ISO date
  pieces: SerializedPiece[];
}
```

### Piece Definition Resolution

On load, the `type` string is mapped back to a `PieceDefinition` using a registry:

```typescript
const PIECE_REGISTRY: Record<string, PieceDefinition> = {
  shortStraight,
  longStraight,
  curve45,
  turnout,
  bridge,
};
```

Each `PieceDefinition` needs a `key` field (or we use a separate mapping). Simplest approach: add an `id` string to `PieceDefinition` that matches the registry key.

### Save/Load UX

**Auto-save (primary):** Save to `localStorage` on every piece placement/deletion/move. Key: `trackplanner:autosave`. This gives seamless persistence.

**Named saves (secondary):** User can save/load named layouts via a simple dropdown. Key: `trackplanner:layouts:{name}`.

**v1.0 scope:** Auto-save only. Named saves can come in a future version if needed.

### Layout Key in localStorage

```
trackplanner:autosave → SerializedLayout (JSON string)
```

### Auto-save Trigger

Use a `$effect` in the Canvas or page-level component that watches `layoutStore.pieces` and serializes on change. Debounce to avoid excessive writes (100ms).

### Load on Startup

In the root `+page.svelte` or an `onMount`, check for `trackplanner:autosave` in localStorage. If found, deserialize and populate `layoutStore`.

### Error Handling

- Corrupted data: catch JSON parse errors, log warning, start fresh
- Unknown piece type: skip pieces with unrecognized types, log warning
- Version mismatch: future-proof with `version` field for schema migrations

## Affected Files

| File                                  | Action | Description                                       |
| ------------------------------------- | ------ | ------------------------------------------------- |
| `src/lib/utils/serialization.ts`      | Create | Serialize/deserialize functions                   |
| `src/lib/utils/serialization.test.ts` | Create | Round-trip tests                                  |
| `src/lib/pieces/definitions.ts`       | Modify | Add `id` field to each definition                 |
| `src/lib/pieces/registry.ts`          | Create | Piece type string → definition map                |
| `src/lib/types/pieces.ts`             | Modify | Add `id` to PieceDefinition, add serialized types |
| `src/routes/+page.svelte`             | Modify | Auto-save effect, load on mount                   |
| `src/lib/components/Toolbar.svelte`   | Modify | Add save status indicator                         |

## Acceptance Criteria

1. Layout is automatically saved to localStorage on any change
2. Layout is automatically restored from localStorage on page load
3. Refreshing the page preserves the layout exactly
4. Corrupted localStorage data doesn't crash the app (graceful fallback)
5. Unknown piece types in saved data are skipped (forward compatibility)
6. Connections are preserved through save/load cycle
7. Auto-save is debounced (no performance impact from rapid changes)
8. All existing tests continue to pass
9. Build succeeds with no errors
