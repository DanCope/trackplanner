# Feature 2: Data Model & Geometry Utilities

Define the type system and math functions that everything else builds on. No UI yet — pure TypeScript with comprehensive unit test coverage.

## Context

This feature establishes the mathematical foundation:

- **Vec2:** 2D vector/point type
- **Direction:** 8-cardinal enum representing port facing directions (N, NE, E, SE, S, SW, W, NW)
- **Geometry utilities:** Functions to rotate vectors, transform directions, compute angles
- **Piece types:** `Port`, `PieceDefinition`, `PlacedPiece` interfaces
- **Configuration:** Plarail standard dimensions (curve radius, straight length)

All work is unit-tested with >90% branch coverage. This is critical because the snap system, rotation, and placement all depend on correct math.

## Design Decisions

1. **Direction encoding:** Union type `"N" | "NE" | ... | "NW"` — human-readable, easily validated
2. **Coordinate system:** Millimeters to match real Plarail dimensions; easy to convert to SVG pixels later
3. **Angles:** Degrees, 0-360, with 0° = East (standard math), but accounting for SVG Y-down coords
4. **Rotation center:** Piece origin (center or anchor point); simplifies transform math
5. **Configuration:** `config.ts` exports dimensions, allowing easy adjustment later without code changes

## Files to Create

| File                             | Type      | Purpose                                     |
| -------------------------------- | --------- | ------------------------------------------- |
| `src/lib/types/geometry.ts`      | Types     | `Vec2`, `Direction`, angle/transform types  |
| `src/lib/types/pieces.ts`        | Types     | `Port`, `PieceDefinition`, `PlacedPiece`    |
| `src/lib/types/index.ts`         | Barrel    | Exports all types                           |
| `src/lib/utils/geometry.ts`      | Utilities | Math functions: rotate, add, distance, etc. |
| `src/lib/utils/geometry.test.ts` | Tests     | Unit tests (>90% branch coverage)           |
| `src/lib/config.ts`              | Config    | Plarail dimensions                          |

## Acceptance Criteria

- [ ] All types defined and exported from `src/lib/types/index.ts`
- [ ] All geometry functions implemented
- [ ] Unit tests pass with >90% branch coverage
- [ ] `pnpm check` passes (strict TypeScript)
- [ ] Rotation math verified for all 8 directions and combinations
- [ ] Direction ↔ angle mapping correct in SVG coords (Y-down)
- [ ] Port definitions ready for Piece definitions (Feature 3)

## Key Formulas

### Direction-to-Angle Mapping (SVG Y-down coordinates)

| Direction | Math Angle | SVG Angle (Y-down) | Radians |
| --------- | ---------- | ------------------ | ------- |
| E         | 0°         | 0°                 | 0       |
| SE        | 45°        | 45°                | π/4     |
| S         | 90°        | 90°                | π/2     |
| SW        | 135°       | 135°               | 3π/4    |
| W         | 180°       | 180°               | π       |
| NW        | 225°       | 225°               | 5π/4    |
| N         | 270°       | 270°               | 3π/2    |
| NE        | 315°       | 315°               | 7π/4    |

### Opposite Direction

`oppositeTo(dir)` returns direction + 180°:

- N ↔ S
- NE ↔ SW
- E ↔ W
- SE ↔ NW

### Rotate Vector Round Origin

```
newX = originX + (x - originX) * cos(angle) - (y - originY) * sin(angle)
newY = originY + (x - originX) * sin(angle) + (y - originY) * cos(angle)
```

## Dependencies

- None (pure types and math, no SvelteKit APIs)

## Notes

- All angles in degrees (easier to reason about than radians)
- All coordinates in millimeters (Plarail-compatible)
- Conversion to SVG pixels happens at render time (Feature 3)
- Port positions are relative to piece origin; absolute position computed when placed
