import { curve45, shortStraight } from '$lib/pieces';
import type { PlacedPiece } from '$lib/types';
import { describe, expect, it } from 'vitest';
import { addVec2, almostEqualVec2, rotateVec2 } from './geometry';
import { computeSnapTransform } from './snap';

describe('computeSnapTransform', () => {
	describe('straight to straight connections', () => {
		it('snaps straight piece facing North to another straight', () => {
			// Target piece at origin, rotation 0, port B facing up (N)
			const targetPiece: PlacedPiece = {
				id: 'target',
				definition: shortStraight,
				position: { x: 0, y: 0 },
				rotation: 0,
				connections: new Map()
			};

			// Dragging shortStraight, want to connect port A (faces S) to target's port B (faces N)
			const result = computeSnapTransform(shortStraight, 'A', targetPiece, 'B', 0);

			// Port B of target at (0, 27), facing N
			// Port A of dragged at (0, -27) in local coords, needs to face S
			// Since rotation is 0, port A already faces S
			// Final position: target port B (0, 27) - rotated drag port A (0, -27) = (0, 54)
			expect(result.rotation).toBe(0);
			expect(almostEqualVec2(result.position, { x: 0, y: 54 })).toBe(true);
		});

		it('snaps straight piece at 90° rotation', () => {
			// Target piece rotated 90° (pointing East-West)
			const targetPiece: PlacedPiece = {
				id: 'target',
				definition: shortStraight,
				position: { x: 100, y: 100 },
				rotation: 90,
				connections: new Map()
			};

			// Target port B at rotation 90:
			// Original position (0, 27), after 90° rotation: (-27, 0)
			// World position: (100 - 27, 100) = (73, 100)
			const result = computeSnapTransform(shortStraight, 'A', targetPiece, 'B', 0);

			// Port B faces N, which after 90° rotation becomes E
			// Dragged port A needs to face W (opposite of E)
			// Port A faces S, needs to rotate 90° to face W
			expect(result.rotation).toBe(90);

			// Dragged port A at (0, -27), after 90° rotation: (27, 0)
			// Position = target world pos - rotated port = (73, 100) - (27, 0) = (46, 100)
			expect(almostEqualVec2(result.position, { x: 46, y: 100 })).toBe(true);
		});

		it('handles pre-rotation of dragged piece', () => {
			const targetPiece: PlacedPiece = {
				id: 'target',
				definition: shortStraight,
				position: { x: 0, y: 0 },
				rotation: 0,
				connections: new Map()
			};

			// Pre-rotate dragged piece 180° before snapping
			const result = computeSnapTransform(shortStraight, 'B', targetPiece, 'B', 180);

			// Target port B at (0, 27) facing N
			// Dragged port B (pre-rotated 180°) originally faces N, now faces S
			// Need port B to face S to connect to N — already satisfied by pre-rotation
			expect(result.rotation).toBe(180);
			expect(almostEqualVec2(result.position, { x: 0, y: 54 })).toBe(true);
		});
	});

	describe('curve connections', () => {
		it('snaps curve to straight piece', () => {
			// Straight piece at origin
			const targetPiece: PlacedPiece = {
				id: 'target',
				definition: shortStraight,
				position: { x: 0, y: 0 },
				rotation: 0,
				connections: new Map()
			};

			// Snap curve's port A to straight's port B
			const result = computeSnapTransform(curve45, 'A', targetPiece, 'B', 0);

			// curve45 port A is at (0, 0) facing S
			// Target port B at (0, 27) facing N
			// Port A of curve should align with target port B
			expect(result.rotation).toBe(0);
			expect(almostEqualVec2(result.position, { x: 0, y: 27 })).toBe(true);
		});

		it('snaps straight to curve exit port', () => {
			// Place a curve at origin
			const targetPiece: PlacedPiece = {
				id: 'target',
				definition: curve45,
				position: { x: 0, y: 0 },
				rotation: 0,
				connections: new Map()
			};

			// Snap straight's port A to curve's port B
			const result = computeSnapTransform(shortStraight, 'A', targetPiece, 'B', 0);

			// curve45 port B should be at exit of curve
			// Port A of straight needs to connect
			const targetPort = curve45.ports.find((p) => p.id === 'B')!;
			expect(result).toBeDefined();
			// Verify rotation aligns with curve exit direction
			expect(result.rotation).toBeGreaterThanOrEqual(0);
			expect(result.rotation).toBeLessThan(360);
		});

		it('aligns straight piece to curve exit direction', () => {
			const targetPiece: PlacedPiece = {
				id: 'target',
				definition: curve45,
				position: { x: 0, y: 0 },
				rotation: 0,
				connections: new Map()
			};

			const result = computeSnapTransform(shortStraight, 'A', targetPiece, 'B', 0);
			const targetPort = curve45.ports.find((p) => p.id === 'B')!;

			const targetPortWorld = addVec2(
				targetPiece.position,
				rotateVec2(targetPort.position, { x: 0, y: 0 }, targetPiece.rotation)
			);

			const draggedPort = shortStraight.ports.find((p) => p.id === 'A')!;
			const draggedPortWorld = addVec2(
				result.position,
				rotateVec2(draggedPort.position, { x: 0, y: 0 }, result.rotation)
			);

			expect(almostEqualVec2(draggedPortWorld, targetPortWorld)).toBe(true);
		});

		it('handles curves with non-zero rotation', () => {
			const targetPiece: PlacedPiece = {
				id: 'target',
				definition: curve45,
				position: { x: 100, y: 100 },
				rotation: 45,
				connections: new Map()
			};

			const result = computeSnapTransform(shortStraight, 'A', targetPiece, 'A', 0);

			// Should compute valid snap regardless of target rotation
			expect(result).toBeDefined();
			expect(result.rotation % 45).toBe(0); // Rotation should be multiple of 45°
		});
	});

	describe('port matching', () => {
		it('throws error if dragged port not found', () => {
			const targetPiece: PlacedPiece = {
				id: 'target',
				definition: shortStraight,
				position: { x: 0, y: 0 },
				rotation: 0,
				connections: new Map()
			};

			expect(() => {
				computeSnapTransform(shortStraight, 'INVALID', targetPiece, 'B', 0);
			}).toThrow('Port not found');
		});

		it('throws error if target port not found', () => {
			const targetPiece: PlacedPiece = {
				id: 'target',
				definition: shortStraight,
				position: { x: 0, y: 0 },
				rotation: 0,
				connections: new Map()
			};

			expect(() => {
				computeSnapTransform(shortStraight, 'A', targetPiece, 'INVALID', 0);
			}).toThrow('Port not found');
		});
	});

	describe('all 8 cardinal/intercardinal directions', () => {
		it('computes snap for each 45° rotation step', () => {
			const targetPiece: PlacedPiece = {
				id: 'target',
				definition: shortStraight,
				position: { x: 0, y: 0 },
				rotation: 0,
				connections: new Map()
			};

			// Test all 8 rotations (0°, 45°, 90°, ..., 315°)
			for (let i = 0; i < 8; i++) {
				const preRotation = i * 45;
				const result = computeSnapTransform(shortStraight, 'A', targetPiece, 'B', preRotation);

				// Should produce valid results for all rotations
				expect(result).toBeDefined();
				expect(result.rotation).toBeGreaterThanOrEqual(0);
				expect(result.rotation).toBeLessThan(360);
				expect(result.rotation % 45).toBe(0); // Always multiple of 45°
			}
		});
	});

	describe('position calculations', () => {
		it('aligns port positions precisely', () => {
			const targetPiece: PlacedPiece = {
				id: 'target',
				definition: shortStraight,
				position: { x: 100, y: 200 },
				rotation: 0,
				connections: new Map()
			};

			const result = computeSnapTransform(shortStraight, 'A', targetPiece, 'B', 0);

			// Calculate actual port positions after placement
			// Target port B: (100, 200 + 27) = (100, 227)
			// Dragged port A after placement at result.position with result.rotation
			// Port A is at (0, -27), rotation 0 -> still (0, -27)
			// World position: result.position + (0, -27) should equal (100, 227)

			const draggedPortWorld = {
				x: result.position.x + 0,
				y: result.position.y + -27
			};

			expect(almostEqualVec2(draggedPortWorld, { x: 100, y: 227 })).toBe(true);
		});
	});
});
