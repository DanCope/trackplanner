# Feature 3: Piece Definitions & SVG Rendering

Define the two MVP pieces (short straight, 45° curve) with their port positions and SVG paths. Create reusable components to render pieces at arbitrary positions and rotations.

## Context

This feature creates the visual foundation. Each piece has:

- **Type:** straight or curve
- **Ports:** entry and exit points with directions and relative positions
- **SVG path:** visual representation

Pieces are rendered as SVG `<g>` elements with `transform` attributes, allowing efficient rotation and translation.

## Design Decisions

1. **Origin:** Center of piece (for rotation math simplicity)
2. **Port visualization:** Colored circles (open=amber, connected=green)
3. **SVG scaling:** 2px per mm (from config)
4. **Component API:** Props for position, rotation, piece definition, selection state

## Files to Create

| File                                       | Type      | Purpose                                     |
| ------------------------------------------ | --------- | ------------------------------------------- |
| `src/lib/pieces/definitions.ts`            | Data      | shortStraight and curve45 piece definitions |
| `src/lib/pieces/definitions.test.ts`       | Tests     | Verify port positions and geometry          |
| `src/lib/pieces/index.ts`                  | Barrel    | Export piece definitions                    |
| `src/lib/components/TrackPiece.svelte`     | Component | Render placed piece with transform          |
| `src/lib/components/TrackPiece.test.ts`    | Tests     | Test rendering and props                    |
| `src/lib/components/PortIndicator.svelte`  | Component | Render colored port dot                     |
| `src/lib/components/PortIndicator.test.ts` | Tests     | Test port indicator states                  |

## Piece Specifications

### Short Straight (54 mm)

- Origin: center of piece
- Port A: `{ x: 0, y: -27 }`, direction `S` (entry)
- Port B: `{ x: 0, y: 27 }`, direction `N` (exit)
- Width: ~10 mm
- SVG: rectangle

### 45° Curve (143 mm radius)

- Origin: entry port position
- Port A: `{ x: 0, y: 0 }`, direction `S` (entry)
- Port B: computed from arc endpoint (right-turning by default)
- Radius: 143 mm
- SVG: arc path
- Exit direction: 45° rotation of entry direction

## Acceptance Criteria

- [ ] Both piece definitions created with correct port positions
- [ ] SVG paths render correctly in both pieces
- [ ] TrackPiece component renders with correct position/rotation
- [ ] PortIndicator shows correct color based on state
- [ ] Pieces can be rendered at all 8 rotations
- [ ] Unit tests verify port symmetry and directions
- [ ] Component tests verify rendering

## Dependencies

- Feature 2: Data model, geometry utilities
- Feature 1: Scaffolding (SvelteKit project base)
