# Feature 8 Tasks: Bridge Piece

## 8.1: Update PieceDefinition Type

**File:** `src/lib/types/pieces.ts`

Update the `type` field union to include `'bridge'`:

```typescript
type: 'straight' | 'curve' | 'turnout' | 'bridge';
```

**Deliverable:** Type system accepts bridge pieces.

---

## 8.2: Create Bridge Definition

**File:** `src/lib/pieces/definitions.ts`

Add a `bridge` export following the same pattern as `shortStraight` and `longStraight`:

```typescript
const bridgeLength = straightLength * 5; // 270 mm
const bridgeHalfLength = bridgeLength / 2; // 135 mm

export const bridge: PieceDefinition = {
  type: 'bridge',
  ports: [
    { id: 'A', position: { x: 0, y: -bridgeHalfLength }, direction: 'S' },
    { id: 'B', position: { x: 0, y: bridgeHalfLength }, direction: 'N' }
  ],
  svgPath: `M ${-width / 2} ${-bridgeHalfLength} L ${width / 2} ${-bridgeHalfLength} L ${width / 2} ${bridgeHalfLength} L ${-width / 2} ${bridgeHalfLength} Z`
};
```

**Deliverable:** Bridge definition exists with correct geometry.

---

## 8.3: Export Bridge & Add to Panel

**File:** `src/lib/pieces/index.ts` — Add `bridge` to exports.

**File:** `src/lib/components/PiecePanel.svelte` — Add Bridge to the pieces array:

```typescript
{ name: 'Bridge', definition: bridge }
```

**Deliverable:** Bridge appears in the piece panel.

---

## 8.4: Add Bridge Visual Styling

**File:** `src/lib/components/TrackPiece.svelte`

Add a case for `'bridge'` in the `fillColor` derived value:

```typescript
case 'bridge':
  return '#fde68a'; // amber-200 (suggests elevation/ramp)
```

Consider adding a visual indicator that this is a bridge — for example, parallel dashed lines along the length to suggest railings, or a subtle gradient. This is optional polish.

**Deliverable:** Bridge renders with a distinct amber color.

---

## 8.5: Test & Verify

**File:** `src/lib/pieces/definitions.test.ts`

Add tests for the bridge definition:

1. Bridge has exactly 2 ports
2. Port A is at `{ x: 0, y: -135 }` with direction `'S'`
3. Port B is at `{ x: 0, y: 135 }` with direction `'N'`
4. Port A and Port B are 270mm apart (5× short straight)
5. Bridge type is `'bridge'`
6. SVG path is non-empty

**Verification:**

- `pnpm test:unit` — all tests pass
- `pnpm build` — static build succeeds
- Manual test: drag bridge onto canvas, snap to other pieces, verify connections

**Deliverable:** Bridge piece fully functional and tested.
