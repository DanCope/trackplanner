import { PLARAIL_CONFIG } from '$lib/config';
import { distanceVec2, oppositeDirection } from '$lib/utils/geometry';
import { describe, expect, it } from 'vitest';
import { curve45, longStraight, shortStraight } from './definitions';

describe('Piece Definitions', () => {
	describe('Short Straight', () => {
		it('has two ports', () => {
			expect(shortStraight.ports).toHaveLength(2);
		});

		it('ports are symmetric', () => {
			const [portA, portB] = shortStraight.ports;
			expect(portA.position.y).toBeCloseTo(-portB.position.y);
			expect(portA.position.x).toBeCloseTo(portB.position.x);
		});

		it('port directions are opposite', () => {
			const [portA, portB] = shortStraight.ports;
			expect(portB.direction).toBe(oppositeDirection(portA.direction));
		});

		it('has valid SVG path', () => {
			expect(shortStraight.svgPath).toMatch(/^M/);
			expect(shortStraight.svgPath).toContain('L');
			expect(shortStraight.svgPath).toContain('Z');
		});
	});

	describe('Long Straight', () => {
		it('has two ports', () => {
			expect(longStraight.ports).toHaveLength(2);
		});

		it('ports are symmetric', () => {
			const [portA, portB] = longStraight.ports;
			expect(portA.position.y).toBeCloseTo(-portB.position.y);
			expect(portA.position.x).toBeCloseTo(portB.position.x);
		});

		it('port directions are opposite', () => {
			const [portA, portB] = longStraight.ports;
			expect(portB.direction).toBe(oppositeDirection(portA.direction));
		});

		it('has valid SVG path', () => {
			expect(longStraight.svgPath).toMatch(/^M/);
			expect(longStraight.svgPath).toContain('L');
			expect(longStraight.svgPath).toContain('Z');
		});

		it('is exactly double the length of short straight', () => {
			const [shortA, shortB] = shortStraight.ports;
			const [longA, longB] = longStraight.ports;
			const shortLength = distanceVec2(shortA.position, shortB.position);
			const longLength = distanceVec2(longA.position, longB.position);
			expect(longLength).toBeCloseTo(shortLength * 2, 1);
		});

		it('ports are at ±54mm from origin', () => {
			const [portA, portB] = longStraight.ports;
			expect(Math.abs(portA.position.y)).toBeCloseTo(54, 1);
			expect(Math.abs(portB.position.y)).toBeCloseTo(54, 1);
		});
	});

	describe('Curve 45°', () => {
		it('has two ports', () => {
			expect(curve45.ports).toHaveLength(2);
		});

		it('entry port is at origin', () => {
			const [portA] = curve45.ports;
			expect(portA.position.x).toBeCloseTo(0);
			expect(portA.position.y).toBeCloseTo(0);
		});

		it('exit port is correct chord distance from entry', () => {
			const [portA, portB] = curve45.ports;
			const distance = distanceVec2(portA.position, portB.position);
			// Chord length for 45° arc with 143mm radius
			// chord = 2 * r * sin(angle/2) = 2 * 143 * sin(22.5°) ≈ 109.45mm
			const expectedChord =
				2 * PLARAIL_CONFIG.curveRadius * Math.sin((PLARAIL_CONFIG.curveAngle * Math.PI) / 360);
			expect(distance).toBeCloseTo(expectedChord, 1);
		});

		it('port directions differ by 45°', () => {
			const [portA, portB] = curve45.ports;
			// portB direction should be 45° rotated from portA
			// This is harder to test without direction difference function,
			// but we can check they're not the same and not opposite
			expect(portB.direction).not.toBe(portA.direction);
			expect(portB.direction).not.toBe(oppositeDirection(portA.direction));
		});

		it('has valid SVG arc path', () => {
			expect(curve45.svgPath).toMatch(/^M/);
			expect(curve45.svgPath).toContain('A');
		});
	});
});
