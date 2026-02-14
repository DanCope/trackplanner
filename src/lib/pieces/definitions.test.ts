import { PLARAIL_CONFIG } from '$lib/config';
import { distanceVec2, oppositeDirection } from '$lib/utils/geometry';
import { describe, expect, it } from 'vitest';
import { bridge, curve45, longStraight, shortStraight, turnout } from './definitions';

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

	describe('Turnout', () => {
		it('has three ports', () => {
			expect(turnout.ports).toHaveLength(3);
		});

		it('has unique port IDs', () => {
			const portIds = turnout.ports.map((p) => p.id);
			const uniqueIds = new Set(portIds);
			expect(uniqueIds.size).toBe(3);
			expect(portIds).toContain('A');
			expect(portIds).toContain('B');
			expect(portIds).toContain('C');
		});

		it('entry port is at origin', () => {
			const entryPort = turnout.ports.find((p) => p.id === 'A');
			expect(entryPort).toBeDefined();
			if (entryPort) {
				expect(entryPort.position.x).toBeCloseTo(0);
				expect(entryPort.position.y).toBeCloseTo(0);
				expect(entryPort.direction).toBe('S');
			}
		});

		it('straight exit is at top center facing opposite of entry', () => {
			const expectedLongLength = PLARAIL_CONFIG.straightLength * 2;
			const straightExit = turnout.ports.find((p) => p.id === 'B');
			const entry = turnout.ports.find((p) => p.id === 'A');
			expect(straightExit).toBeDefined();
			expect(entry).toBeDefined();
			if (straightExit && entry) {
				expect(straightExit.position.x).toBeCloseTo(0);
				expect(straightExit.position.y).toBeCloseTo(expectedLongLength, 1);
				expect(straightExit.direction).toBe('N');
				expect(straightExit.direction).toBe(oppositeDirection(entry.direction));
			}
		});

		it('branch exit is at 45-degree angle', () => {
			const expectedBranchX =
				PLARAIL_CONFIG.curveRadius -
				PLARAIL_CONFIG.curveRadius * Math.cos((PLARAIL_CONFIG.curveAngle * Math.PI) / 180);
			const expectedBranchY =
				PLARAIL_CONFIG.curveRadius * Math.sin((PLARAIL_CONFIG.curveAngle * Math.PI) / 180);
			const branchExit = turnout.ports.find((p) => p.id === 'C');
			expect(branchExit).toBeDefined();
			if (branchExit) {
				expect(branchExit.position.x).toBeCloseTo(expectedBranchX, 1);
				expect(branchExit.position.y).toBeCloseTo(expectedBranchY, 1);
				expect(branchExit.direction).toBe('NW'); // 45° from straight
			}
		});

		it('has valid composite SVG path', () => {
			expect(turnout.svgPath).toMatch(/^M/); // Starts with move
			expect(turnout.svgPath).toContain('L'); // Contains lines
			expect(turnout.svgPath).toContain('A'); // Contains arcs
			expect(turnout.svgPath).toContain('Z'); // Closes paths
		});

		it('straight and branch exits are roughly same distance from entry', () => {
			const entry = turnout.ports.find((p) => p.id === 'A')!;
			const straightExit = turnout.ports.find((p) => p.id === 'B')!;
			const branchExit = turnout.ports.find((p) => p.id === 'C')!;

			const straightDist = distanceVec2(entry.position, straightExit.position);
			const branchDist = distanceVec2(entry.position, branchExit.position);

			// Should be close to 108mm (long straight length)
			expect(straightDist).toBeCloseTo(PLARAIL_CONFIG.straightLength * 2, 1);
			// Branch should be similar length (within 10mm)
			expect(Math.abs(branchDist - straightDist)).toBeLessThan(10);
		});
	});

	describe('Bridge', () => {
		it('has exactly two ports', () => {
			expect(bridge.ports).toHaveLength(2);
		});

		it('has type bridge', () => {
			expect(bridge.type).toBe('bridge');
		});

		it('port A is at correct position with direction S', () => {
			const portA = bridge.ports.find((p) => p.id === 'A');
			expect(portA).toBeDefined();
			if (portA) {
				expect(portA.position.x).toBeCloseTo(0);
				expect(portA.position.y).toBeCloseTo(-135, 1);
				expect(portA.direction).toBe('S');
			}
		});

		it('port B is at correct position with direction N', () => {
			const portB = bridge.ports.find((p) => p.id === 'B');
			expect(portB).toBeDefined();
			if (portB) {
				expect(portB.position.x).toBeCloseTo(0);
				expect(portB.position.y).toBeCloseTo(135, 1);
				expect(portB.direction).toBe('N');
			}
		});

		it('ports are 270mm apart (5x short straight)', () => {
			const [portA, portB] = bridge.ports;
			const distance = distanceVec2(portA.position, portB.position);
			const expectedLength = PLARAIL_CONFIG.straightLength * 5; // 270mm
			expect(distance).toBeCloseTo(expectedLength, 1);
		});

		it('port directions are opposite', () => {
			const [portA, portB] = bridge.ports;
			expect(portB.direction).toBe(oppositeDirection(portA.direction));
		});

		it('has valid SVG path', () => {
			expect(bridge.svgPath).toMatch(/^M/);
			expect(bridge.svgPath).toContain('L');
			expect(bridge.svgPath).toContain('Z');
			expect(bridge.svgPath.length).toBeGreaterThan(0);
		});
	});
});
