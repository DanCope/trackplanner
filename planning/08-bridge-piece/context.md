# Feature 8: Bridge Piece

## Purpose

Add a bridge piece representing the Tomy Trainmaster bridge track. The bridge is the length of 5 short straight pieces (270mm) with ports at each end. No Z-elevation modeling — pieces can overlap freely (which is already allowed by the current system).

## Dependencies

- **F2 (Data Model)** ✅ — Vec2, Direction types
- **F3 (Piece Definitions)** ✅ — PieceDefinition pattern, SVG rendering

## Design Decisions

### Length

5 × 54mm (short straight) = **270mm total**. Ports at each end, centered on origin just like the short and long straight pieces.

### Type Classification

Add `'bridge'` to the `PieceDefinition.type` union. This gives the bridge:

- A distinct fill color in `TrackPiece.svelte` (currently straight=blue, curve=rose, turnout=green)
- Future optionality for bridge-specific behavior (z-layer rendering, overlap warnings)

### Visual Appearance

The bridge should look distinct from a regular straight:

- Different fill color (amber/yellow to suggest elevation)
- Optional: dashed border lines or rail markings to visually differentiate from just "a long rectangle"
- Same width as other pieces (10mm in piece coordinates)

### Port Geometry

Identical to short/long straight — two ports at opposite ends, directions S and N:

- Port A: `{ x: 0, y: -135 }`, direction `'S'` (entry, faces south into piece)
- Port B: `{ x: 0, y: 135 }`, direction `'N'` (exit, faces north out of piece)

## Affected Files

| File                                   | Action | Description                   |
| -------------------------------------- | ------ | ----------------------------- |
| `src/lib/types/pieces.ts`              | Modify | Add `'bridge'` to type union  |
| `src/lib/pieces/definitions.ts`        | Modify | Add `bridge` piece definition |
| `src/lib/pieces/index.ts`              | Modify | Export `bridge`               |
| `src/lib/components/PiecePanel.svelte` | Modify | Add Bridge button             |
| `src/lib/components/TrackPiece.svelte` | Modify | Add bridge fill color         |
| `src/lib/pieces/definitions.test.ts`   | Modify | Add bridge geometry tests     |

## Acceptance Criteria

1. Bridge piece appears in the piece panel
2. Bridge can be dragged and placed on the canvas
3. Bridge snaps to open ports of any other piece type
4. Bridge ports connect correctly (verified by green port indicators)
5. Bridge has a visually distinct appearance (different color from straight pieces)
6. Bridge is 270mm long (5× short straight)
7. All existing tests continue to pass
8. Build succeeds with no errors
