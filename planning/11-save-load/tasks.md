# Feature 11 Tasks: Save/Load Layouts

## 11.1: Define Serialization Types

**File:** `src/lib/types/pieces.ts`

Add serialization interfaces:

```typescript
export interface SerializedPiece {
  id: string;
  definitionId: string;       // Key into piece registry
  position: Vec2;
  rotation: number;
  connections: Record<string, string>;  // Plain object (Map → Record)
}

export interface SerializedLayout {
  version: 1;
  name: string;
  createdAt: string;
  updatedAt: string;
  pieces: SerializedPiece[];
}
```

Add optional `id` field to `PieceDefinition`:

```typescript
export interface PieceDefinition {
  id: string;               // Unique key for serialization (e.g., 'shortStraight')
  type: 'straight' | 'curve' | 'turnout' | 'bridge';
  ports: Port[];
  svgPath: string;
}
```

**Deliverable:** Type system supports serialization.

---

## 11.2: Add IDs to Piece Definitions & Create Registry

**File:** `src/lib/pieces/definitions.ts`

Add `id` field to each definition:

```typescript
export const shortStraight: PieceDefinition = {
  id: 'shortStraight',
  type: 'straight',
  ...
};
```

Repeat for `longStraight`, `curve45`, `turnout`, `bridge`.

**File:** `src/lib/pieces/registry.ts`

```typescript
import type { PieceDefinition } from '$lib/types';
import { shortStraight, longStraight, curve45, turnout, bridge } from './definitions';

export const PIECE_REGISTRY: Record<string, PieceDefinition> = {
  shortStraight,
  longStraight,
  curve45,
  turnout,
  bridge,
};

export function getPieceDefinition(id: string): PieceDefinition | undefined {
  return PIECE_REGISTRY[id];
}
```

**Deliverable:** Every piece definition has a stable ID, and a registry maps IDs to definitions.

---

## 11.3: Implement Serialization Functions

**File:** `src/lib/utils/serialization.ts`

```typescript
export function serializeLayout(pieces: PlacedPiece[], name?: string): SerializedLayout;
export function deserializeLayout(data: SerializedLayout): PlacedPiece[];
export function saveToLocalStorage(pieces: PlacedPiece[]): void;
export function loadFromLocalStorage(): PlacedPiece[] | null;
```

Key implementation details:

**`serializeLayout`:**

- Convert each `PlacedPiece` to `SerializedPiece`
- `definition` → `definitionId` (use `piece.definition.id`)
- `connections` Map → plain `Record` via `Object.fromEntries()`

**`deserializeLayout`:**

- Look up `definitionId` in `PIECE_REGISTRY` → skip if not found (log warning)
- Convert `connections` Record → `new Map(Object.entries(...))`
- Return array of `PlacedPiece`

**`saveToLocalStorage`:**

- Call `serializeLayout`, then `localStorage.setItem('trackplanner:autosave', JSON.stringify(...))`
- Wrap in try/catch for quota errors

**`loadFromLocalStorage`:**

- `localStorage.getItem('trackplanner:autosave')`
- Parse JSON, validate `version` field
- Call `deserializeLayout`
- Return null on any error (log warning)

**Deliverable:** Complete serialize/deserialize pipeline.

---

## 11.4: Unit Test Serialization

**File:** `src/lib/utils/serialization.test.ts`

Test cases:

1. **Round-trip:** Serialize a layout, deserialize it, verify pieces match
2. **Connections preserved:** Piece with connections → serialize → deserialize → Map has same entries
3. **Unknown piece type skipped:** Inject a piece with `definitionId: 'unknown'` → deserialize returns fewer pieces, no error
4. **Empty layout:** Serialize/deserialize empty array → empty array
5. **Version field present:** Serialized output has `version: 1`
6. **Corrupted JSON:** `loadFromLocalStorage` with invalid JSON → returns null
7. **Missing data:** `loadFromLocalStorage` when key doesn't exist → returns null
8. **Multiple piece types:** Layout with straight + curve + turnout all survive round-trip

**Mock localStorage** with a simple in-memory implementation or use Vitest's `vi.stubGlobal`.

**Deliverable:** Comprehensive serialization tests.

---

## 11.5: Integrate Auto-Save and Load-on-Mount

**File:** `src/routes/+page.svelte`

**Load on mount:**

```typescript
onMount(() => {
  const pieces = loadFromLocalStorage();
  if (pieces && pieces.length > 0) {
    for (const piece of pieces) {
      layoutStore.addPiece(piece);
    }
    // Update nextPieceId to avoid ID collisions
    nextPieceId = Math.max(...pieces.map(p => parseInt(p.id.replace('piece-', '')) || 0)) + 1;
  }
});
```

Note: `nextPieceId` is currently tracked in `Canvas.svelte`. For save/load to work, it may need to move to a shared location or be derived from loaded piece IDs.

**Auto-save with debounce:**

```typescript
let saveTimeout: ReturnType<typeof setTimeout>;
$effect(() => {
  // Track pieces reactively
  const pieces = layoutStore.pieces;
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveToLocalStorage(pieces);
  }, 100);
});
```

**Deliverable:** Layout persists across page refreshes.

---

## 11.6: Add Save Indicator & Final Verification

**File:** `src/lib/components/Toolbar.svelte`

Add a subtle save status indicator:

```svelte
<span class="text-xs text-green-600">✓ Saved</span>
```

Flash briefly after each auto-save to give user confidence their work is persisted.

**Verification:**

1. Place several pieces → refresh page → pieces are restored
2. Connections are preserved after refresh
3. Delete a piece → refresh → deletion is persisted
4. Clear localStorage manually → refresh → app starts fresh (no error)
5. Inject malformed JSON in localStorage → refresh → app starts fresh (no crash)
6. Place 50+ pieces → auto-save doesn't cause visible lag
7. `pnpm test:unit` — all pass
8. `pnpm build` — succeeds

**Deliverable:** Save/load feature complete with visual feedback.
