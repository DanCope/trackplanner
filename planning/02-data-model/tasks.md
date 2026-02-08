# Feature 2 Tasks: Data Model & Geometry Utilities

## Task 2.1: Define Geometry Types

Create `src/lib/types/geometry.ts` with Vec2 and Direction types.

**Steps:**

1. Create `src/lib/types/geometry.ts`:

   ```ts
   export interface Vec2 {
   	x: number;
   	y: number;
   }

   export type Direction = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

   export const DIRECTIONS: Direction[] = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

   export interface RotationTransform {
   	angle: number; // degrees, 0-360
   	originX: number;
   	originY: number;
   }
   ```

2. Verify types export cleanly

**Deliverable:**

- `Vec2` and `Direction` types defined
- `DIRECTIONS` array for iteration

---

## Task 2.2: Define Piece Types

Create `src/lib/types/pieces.ts` with Port, PieceDefinition, and PlacedPiece.

**Steps:**

1. Create `src/lib/types/pieces.ts`:

   ```ts
   import type { Vec2, Direction } from './geometry';

   export interface Port {
   	id: string; // Unique ID per piece (e.g., 'portA', 'portB')
   	position: Vec2; // Relative to piece origin (mm)
   	direction: Direction; // Which way the port faces (N, NE, ..., NW)
   }

   export interface PieceDefinition {
   	type: 'straight' | 'curve'; // Piece type
   	ports: Port[]; // All available ports
   	svgPath: string; // SVG path data (relative to origin)
   }

   export interface PlacedPiece {
   	id: string; // Unique instance ID (UUID or similar)
   	definition: PieceDefinition; // Reference to piece definition
   	position: Vec2; // World position of piece origin (mm)
   	rotation: number; // Rotation in degrees, multiple of 45 (0, 45, 90, ...)
   	connections: Map<string, string>; // portId → connected piece portId (e.g., 'portA' → 'piece-2:portB')
   }
   ```

2. Add type guards/helpers for validation if needed
3. Verify TypeScript strict mode accepts all types

**Deliverable:**

- Port, PieceDefinition, PlacedPiece interfaces defined and exported

---

## Task 2.3: Create Configuration File

Create `src/lib/config.ts` with Plarail standard dimensions.

**Steps:**

1. Create `src/lib/config.ts`:

   ```ts
   /**
    * Plarail standard dimensions (in millimeters)
    * Adjust these after measuring real pieces
    */

   export const PLARAIL_CONFIG = {
   	// Short straight piece dimension
   	straightLength: 54, // mm

   	// 45° curve piece
   	curveAngle: 45, // degrees
   	curveRadius: 143, // mm (center to center of rails)

   	// SVG pixel scale (mm → px)
   	mmToPixels: 2, // 1 mm = 2 pixels in SVG rendering

   	// Snap tolerance for detecting close ports
   	snapRadius: 10 // mm (distance threshold to snap)
   };

   export type PlarailConfig = typeof PLARAIL_CONFIG;
   ```

2. Export individual constants if preferred
3. Verify config values make sense:
   - Curve exit point should be at (straight length × height of curve sector)
   - Test later in piece definition creation

**Deliverable:**

- Configuration file ready to use
- Easily adjustable without code changes

---

## Task 2.4: Implement Vector Utility Functions

Create basic 2D vector math in `src/lib/utils/geometry.ts`.

**Steps:**

1. Create `src/lib/utils/geometry.ts`:

   ```ts
   import type { Vec2, Direction } from '$lib/types/geometry';

   /**
    * Add two vectors
    */
   export function addVec2(a: Vec2, b: Vec2): Vec2 {
   	return { x: a.x + b.x, y: a.y + b.y };
   }

   /**
    * Subtract vector b from a
    */
   export function subtractVec2(a: Vec2, b: Vec2): Vec2 {
   	return { x: a.x - b.x, y: a.y - b.y };
   }

   /**
    * Euclidean distance between two points
    */
   export function distanceVec2(a: Vec2, b: Vec2): number {
   	const dx = b.x - a.x;
   	const dy = b.y - a.y;
   	return Math.sqrt(dx * dx + dy * dy);
   }

   /**
    * Scale a vector by a scalar
    */
   export function scaleVec2(v: Vec2, scale: number): Vec2 {
   	return { x: v.x * scale, y: v.y * scale };
   }

   /**
    * Check if two vectors are approximately equal (within tolerance)
    */
   export function almostEqualVec2(a: Vec2, b: Vec2, tolerance = 0.01): boolean {
   	return distanceVec2(a, b) < tolerance;
   }
   ```

2. Test each function manually before moving to unit tests

**Deliverable:**

- Basic vector operations implemented

---

## Task 2.5: Implement Direction & Angle Functions

Add direction-to-angle mapping and rotation utilities.

**Steps:**

1. Add to `src/lib/utils/geometry.ts`:

   ```ts
   /**
    * Convert Direction to degrees (SVG Y-down coordinates)
    * E = 0°, SE = 45°, S = 90°, ..., NE = 315°
    */
   export function directionToAngle(dir: Direction): number {
   	const angleMap: Record<Direction, number> = {
   		E: 0,
   		SE: 45,
   		S: 90,
   		SW: 135,
   		W: 180,
   		NW: 225,
   		N: 270,
   		NE: 315
   	};
   	return angleMap[dir];
   }

   /**
    * Convert degrees to Direction
    * Rounds to nearest 45° increment
    */
   export function angleToDirection(angle: number): Direction {
   	const normalized = ((angle % 360) + 360) % 360;
   	const directions: Direction[] = ['E', 'SE', 'S', 'SW', 'W', 'NW', 'N', 'NE'];
   	const index = Math.round(normalized / 45) % 8;
   	return directions[index];
   }

   /**
    * Opposite direction (rotated 180°)
    */
   export function oppositeDirection(dir: Direction): Direction {
   	return angleToDirection(directionToAngle(dir) + 180);
   }

   /**
    * Rotate a direction by n × 45° steps
    * @param dir Starting direction
    * @param steps Number of 45° steps (positive = counterclockwise in math, clockwise in SVG y-down)
    */
   export function rotateDirection(dir: Direction, steps: number): Direction {
   	const currentAngle = directionToAngle(dir);
   	const newAngle = currentAngle + steps * 45;
   	return angleToDirection(newAngle);
   }

   /**
    * Check if a direction is a cardinal (N, E, S, W)
    */
   export function isCardinalDirection(dir: Direction): boolean {
   	return ['N', 'E', 'S', 'W'].includes(dir);
   }

   /**
    * Check if a direction is an intercardinal (NE, SE, SW, NW)
    */
   export function isIntercardinalDirection(dir: Direction): boolean {
   	return ['NE', 'SE', 'SW', 'NW'].includes(dir);
   }
   ```

2. Test mappings manually (print out all 8 directions and angles)

**Deliverable:**

- Direction ↔ angle conversions implemented
- Direction validation and transformation functions ready

---

## Task 2.6: Implement Vector Rotation

Add the critical 2D rotation function.

**Steps:**

1. Add to `src/lib/utils/geometry.ts`:

   ```ts
   /**
    * Rotate a point around an origin by angle (degrees)
    * Uses standard 2D rotation matrix
    * @param point Point to rotate
    * @param origin Rotation center
    * @param angleDeg Rotation angle in degrees
    */
   export function rotateVec2(point: Vec2, origin: Vec2, angleDeg: number): Vec2 {
   	const angleRad = (angleDeg * Math.PI) / 180;
   	const cos = Math.cos(angleRad);
   	const sin = Math.sin(angleRad);

   	const tx = point.x - origin.x;
   	const ty = point.y - origin.y;

   	const rotX = tx * cos - ty * sin;
   	const rotY = tx * sin + ty * cos;

   	return {
   		x: origin.x + rotX,
   		y: origin.y + rotY
   	};
   }

   /**
    * Rotate a point around origin (0, 0)
    */
   export function rotateVec2Simple(point: Vec2, angleDeg: number): Vec2 {
   	return rotateVec2(point, { x: 0, y: 0 }, angleDeg);
   }
   ```

2. Manually test: rotate (1, 0) around (0, 0) by 90°, should get (0, 1)

**Deliverable:**

- Rotation function ready for piece definition and snap calculations

---

## Task 2.7: Create Comprehensive Unit Tests

Write tests for all geometry functions with >90% branch coverage.

**Steps:**

1. Create `src/lib/utils/geometry.test.ts`:

   ```ts
   import { describe, it, expect } from 'vitest';
   import {
   	addVec2,
   	subtractVec2,
   	distanceVec2,
   	scaleVec2,
   	almostEqualVec2,
   	directionToAngle,
   	angleToDirection,
   	oppositeDirection,
   	rotateDirection,
   	isCardinalDirection,
   	isIntercardinalDirection,
   	rotateVec2,
   	rotateVec2Simple
   } from './geometry';
   import type { Direction } from '$lib/types/geometry';

   describe('Vector Math', () => {
   	it('adds vectors', () => {
   		expect(addVec2({ x: 1, y: 2 }, { x: 3, y: 4 })).toEqual({
   			x: 4,
   			y: 6
   		});
   	});

   	it('subtracts vectors', () => {
   		expect(subtractVec2({ x: 5, y: 6 }, { x: 2, y: 1 })).toEqual({
   			x: 3,
   			y: 5
   		});
   	});

   	it('computes distance', () => {
   		// 3-4-5 triangle
   		expect(distanceVec2({ x: 0, y: 0 }, { x: 3, y: 4 })).toBeCloseTo(5);
   	});

   	it('scales vectors', () => {
   		expect(scaleVec2({ x: 2, y: 3 }, 2)).toEqual({ x: 4, y: 6 });
   	});

   	it('checks approximate equality', () => {
   		expect(almostEqualVec2({ x: 0, y: 0 }, { x: 0.001, y: 0.001 })).toBe(true);
   		expect(almostEqualVec2({ x: 0, y: 0 }, { x: 1, y: 1 })).toBe(false);
   	});
   });

   describe('Direction & Angle', () => {
   	it('maps all directions to angles', () => {
   		const directions: Direction[] = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
   		const angles = [270, 315, 0, 45, 90, 135, 180, 225];

   		directions.forEach((dir, i) => {
   			expect(directionToAngle(dir)).toBe(angles[i]);
   		});
   	});

   	it('converts angles back to directions', () => {
   		expect(angleToDirection(0)).toBe('E');
   		expect(angleToDirection(45)).toBe('SE');
   		expect(angleToDirection(90)).toBe('S');
   		expect(angleToDirection(180)).toBe('W');
   		expect(angleToDirection(270)).toBe('N');
   	});

   	it('handles angle wrapping', () => {
   		expect(angleToDirection(360)).toBe('E');
   		expect(angleToDirection(-90)).toBe('N');
   	});

   	it('finds opposite directions', () => {
   		expect(oppositeDirection('N')).toBe('S');
   		expect(oppositeDirection('NE')).toBe('SW');
   		expect(oppositeDirection('E')).toBe('W');
   		expect(oppositeDirection('SE')).toBe('NW');
   	});

   	it('rotates directions by steps', () => {
   		expect(rotateDirection('E', 1)).toBe('SE');
   		expect(rotateDirection('E', 2)).toBe('S');
   		expect(rotateDirection('N', 2)).toBe('E');
   		expect(rotateDirection('N', -1)).toBe('NW');
   	});

   	it('identifies cardinal directions', () => {
   		expect(isCardinalDirection('N')).toBe(true);
   		expect(isCardinalDirection('NE')).toBe(false);
   	});

   	it('identifies intercardinal directions', () => {
   		expect(isIntercardinalDirection('NE')).toBe(true);
   		expect(isIntercardinalDirection('N')).toBe(false);
   	});
   });

   describe('Vector Rotation', () => {
   	it('rotates 90° around origin', () => {
   		const rotated = rotateVec2Simple({ x: 1, y: 0 }, 90);
   		expect(rotated.x).toBeCloseTo(0);
   		expect(rotated.y).toBeCloseTo(1);
   	});

   	it('rotates 45° around origin', () => {
   		const rotated = rotateVec2Simple({ x: 1, y: 0 }, 45);
   		const sqrt2Over2 = Math.sqrt(2) / 2;
   		expect(rotated.x).toBeCloseTo(sqrt2Over2);
   		expect(rotated.y).toBeCloseTo(sqrt2Over2);
   	});

   	it('rotates around arbitrary origin', () => {
   		// Rotate (2, 0) around (1, 0) by 90° → should be (1, 1)
   		const rotated = rotateVec2({ x: 2, y: 0 }, { x: 1, y: 0 }, 90);
   		expect(rotated.x).toBeCloseTo(1);
   		expect(rotated.y).toBeCloseTo(1);
   	});

   	it('handles 360° rotation (identity)', () => {
   		const point = { x: 5, y: 7 };
   		const rotated = rotateVec2Simple(point, 360);
   		expect(rotated.x).toBeCloseTo(point.x);
   		expect(rotated.y).toBeCloseTo(point.y);
   	});

   	it('handles negative angles', () => {
   		const rotated1 = rotateVec2Simple({ x: 1, y: 0 }, -90);
   		const rotated2 = rotateVec2Simple({ x: 1, y: 0 }, 270);
   		expect(rotated1.x).toBeCloseTo(rotated2.x);
   		expect(rotated1.y).toBeCloseTo(rotated2.y);
   	});
   });
   ```

2. Run `pnpm test:unit` — all tests pass
3. Check coverage: aim for >90% branch coverage on geometry.ts

**Deliverable:**

- All geometry functions unit tested
- > 90% branch coverage achieved
- Test suite documents expected behavior

---

## Task 2.8: Create Type Exports Barrel

Create `src/lib/types/index.ts` to centralize exports.

**Steps:**

1. Create `src/lib/types/index.ts`:

   ```ts
   export type { Vec2, Direction, RotationTransform } from './geometry';
   export { DIRECTIONS } from './geometry';

   export type { Port, PieceDefinition, PlacedPiece } from './pieces';
   ```

2. Verify `pnpm check` passes
3. Test import from `$lib/types` works cleanly

**Deliverable:**

- All types exported from single barrel location
- Ready for Features 3+ to import cleanly

---

## Task 2.9: Document Configuration

Add JSDoc comments to config.

**Steps:**

1. Update `src/lib/config.ts` with detailed comments:
   ```ts
   /**
    * PLARAIL CONFIGURATION
    *
    * These dimensions define the geometry of track pieces.
    * Adjust based on actual measurements of your Plarail set.
    *
    * Units: All measurements in millimeters (mm)
    * SVG: converted to pixels on render (mmToPixels scale)
    */
   ```
2. Add links to reference measurements once taken
3. Ensure values are easily findable for Phase 2 measurement task

**Deliverable:**

- Configuration well-documented
- Clear instructions for future measurement/adjustment

---

## Task 2.10: Final Verification

Verify the entire Feature 2 module.

**Steps:**

1. Run `pnpm check` — no TypeScript errors
2. Run `pnpm test:unit src/lib/utils/geometry.test.ts` — all tests pass
3. Check coverage:
   ```bash
   pnpm test:unit -- --coverage src/lib/utils/geometry.ts
   ```
   Target: >90% branch coverage
4. Import and use types in a test component to verify no import issues
5. Verify config values make sense (can compute piece geometry from them)

**Deliverable:**

- Feature 2 complete and tested
- Ready for Feature 3 (Piece Definitions)
- All geometry math verified and ready for snap/rotation systems
