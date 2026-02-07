import type { Direction, Vec2 } from '$lib/types/geometry';

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
