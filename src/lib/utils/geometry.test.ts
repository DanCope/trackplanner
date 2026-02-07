import type { Direction } from '$lib/types/geometry';
import { describe, expect, it } from 'vitest';
import {
	addVec2,
	almostEqualVec2,
	angleToDirection,
	directionToAngle,
	distanceVec2,
	isCardinalDirection,
	isIntercardinalDirection,
	oppositeDirection,
	rotateDirection,
	rotateVec2,
	rotateVec2Simple,
	scaleVec2,
	subtractVec2
} from './geometry';

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
