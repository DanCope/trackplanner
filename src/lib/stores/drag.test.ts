import { curve45, shortStraight } from '$lib/pieces';
import type { PlacedPiece } from '$lib/types';
import { beforeEach, describe, expect, test } from 'vitest';
import { DragStore } from './drag.svelte';

describe('DragStore rotation', () => {
	let store: DragStore;

	beforeEach(() => {
		store = new DragStore();
	});

	test('initializes preRotation to 0', () => {
		expect(store.preRotation).toBe(0);
	});

	test('rotatePreview increments by 45°', () => {
		store.startDrag(shortStraight);
		store.rotatePreview(1);
		expect(store.preRotation).toBe(45);
		store.rotatePreview(1);
		expect(store.preRotation).toBe(90);
		store.rotatePreview(1);
		expect(store.preRotation).toBe(135);
	});

	test('rotation wraps at 360°', () => {
		store.startDrag(shortStraight);
		// Rotate 8 times (8 * 45° = 360°)
		for (let i = 0; i < 8; i++) {
			store.rotatePreview(1);
		}
		expect(store.preRotation).toBe(0);
	});

	test('rotation wraps correctly after 7 steps', () => {
		store.startDrag(shortStraight);
		// Rotate 7 times -> 315°
		for (let i = 0; i < 7; i++) {
			store.rotatePreview(1);
		}
		expect(store.preRotation).toBe(315);
		// One more should wrap to 0
		store.rotatePreview(1);
		expect(store.preRotation).toBe(0);
	});

	test('handles negative rotation steps', () => {
		store.startDrag(shortStraight);
		store.rotatePreview(-1); // Should be 315° (360 - 45)
		expect(store.preRotation).toBe(315);
		store.rotatePreview(-1); // Should be 270°
		expect(store.preRotation).toBe(270);
	});

	test('rotatePreview works with curves', () => {
		store.startDrag(curve45);
		store.rotatePreview(2); // +90°
		expect(store.preRotation).toBe(90);
	});

	test('preRotation resets on startDrag', () => {
		store.startDrag(shortStraight);
		store.rotatePreview(3); // 135°
		expect(store.preRotation).toBe(135);

		// Start new drag - should reset
		store.startDrag(curve45);
		expect(store.preRotation).toBe(0);
	});

	test('preRotation resets on endDrag', () => {
		store.startDrag(shortStraight);
		store.rotatePreview(2); // 90°
		store.endDrag();
		expect(store.preRotation).toBe(0);
	});

	test('all 8 rotation states (0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°)', () => {
		store.startDrag(shortStraight);
		const expectedRotations = [0, 45, 90, 135, 180, 225, 270, 315];

		expect(store.preRotation).toBe(0);

		for (let i = 1; i < 8; i++) {
			store.rotatePreview(1);
			expect(store.preRotation).toBe(expectedRotations[i]);
		}

		// One more wraps back to 0
		store.rotatePreview(1);
		expect(store.preRotation).toBe(0);
	});
});

describe('DragStore port cycling', () => {
	let store: DragStore;

	beforeEach(() => {
		store = new DragStore();
	});

	test('initializes selectedPortIndex to null', () => {
		expect(store.selectedPortIndex).toBe(null);
	});

	test('startDrag initializes to 0, cyclePort moves to 1', () => {
		store.startDrag(shortStraight);
		expect(store.selectedPortIndex).toBe(0);
		store.cyclePort();
		expect(store.selectedPortIndex).toBe(1);
	});

	test('cyclePort cycles through all ports', () => {
		store.startDrag(shortStraight); // 2 ports, starts at 0
		expect(store.selectedPortIndex).toBe(0);
		store.cyclePort(); // -> 1
		expect(store.selectedPortIndex).toBe(1);
		store.cyclePort(); // -> 0 (wrap)
		expect(store.selectedPortIndex).toBe(0);
	});

	test('cyclePort works with curve pieces', () => {
		store.startDrag(curve45); // 2 ports, starts at 0
		expect(store.selectedPortIndex).toBe(0);
		store.cyclePort();
		expect(store.selectedPortIndex).toBe(1);
		store.cyclePort();
		expect(store.selectedPortIndex).toBe(0); // wraps
	});

	test('cyclePort does nothing when not dragging', () => {
		store.cyclePort();
		expect(store.selectedPortIndex).toBe(null);
	});

	test('selectedPortIndex resets on startDrag', () => {
		store.startDrag(shortStraight);
		store.cyclePort();
		expect(store.selectedPortIndex).toBe(1);

		// Start new drag - should reset to 0
		store.startDrag(curve45);
		expect(store.selectedPortIndex).toBe(0);
	});

	test('selectedPortIndex resets on endDrag', () => {
		store.startDrag(shortStraight);
		store.cyclePort();
		expect(store.selectedPortIndex).toBe(1);
		store.endDrag();
		expect(store.selectedPortIndex).toBe(null);
	});
});

describe('DragStore move-drag', () => {
	let store: DragStore;
	let piece1: PlacedPiece;
	let piece2: PlacedPiece;
	let allPieces: PlacedPiece[];

	beforeEach(() => {
		store = new DragStore();

		// Create two connected pieces
		piece1 = {
			id: 'piece-1',
			definition: shortStraight,
			position: { x: 0, y: 0 },
			rotation: 0,
			connections: new Map([['port-B', 'piece-2:port-A']])
		};

		piece2 = {
			id: 'piece-2',
			definition: shortStraight,
			position: { x: 135, y: 0 },
			rotation: 180,
			connections: new Map([['port-A', 'piece-1:port-B']])
		};

		allPieces = [piece1, piece2];
	});

	test('startMoveDrag sets sourcePieceId and isMoveDrag', () => {
		store.startMoveDrag(piece1, allPieces);
		expect(store.sourcePieceId).toBe('piece-1');
		expect(store.isMoveDrag).toBe(true);
		expect(store.isActive).toBe(true);
	});

	test('startMoveDrag preserves original position and rotation', () => {
		store.startMoveDrag(piece1, allPieces);
		expect(store.originalPosition).toEqual({ x: 0, y: 0 });
		expect(store.originalRotation).toBe(0);
	});

	test('startMoveDrag deep-copies connections', () => {
		store.startMoveDrag(piece1, allPieces);
		expect(store.originalConnections).toEqual(new Map([['port-B', 'piece-2:port-A']]));

		// Mutate the original - should not affect the copy
		piece1.connections.set('port-A', 'fake-connection');
		expect(store.originalConnections?.has('port-A')).toBe(false);
		expect(store.originalConnections?.get('port-B')).toBe('piece-2:port-A');
	});

	test('startMoveDrag disconnects piece from neighbors', () => {
		store.startMoveDrag(piece1, allPieces);

		// piece1 should have no connections
		expect(piece1.connections.size).toBe(0);

		// piece2 should also have no connections (bidirectional disconnect)
		expect(piece2.connections.size).toBe(0);
	});

	test('startMoveDrag sets activePieceDefinition and preRotation', () => {
		piece1.rotation = 90;
		store.startMoveDrag(piece1, allPieces);

		expect(store.activePieceDefinition).toBe(shortStraight);
		expect(store.preRotation).toBe(90);
	});

	test('cancelDrag returns original state for move drag', () => {
		store.startMoveDrag(piece1, allPieces);

		const original = store.cancelDrag();

		expect(original).not.toBe(null);
		expect(original?.id).toBe('piece-1');
		expect(original?.position).toEqual({ x: 0, y: 0 });
		expect(original?.rotation).toBe(0);
		expect(original?.connections).toEqual(new Map([['port-B', 'piece-2:port-A']]));
	});

	test('cancelDrag returns null for new-piece drag', () => {
		store.startDrag(shortStraight);

		const original = store.cancelDrag();

		expect(original).toBe(null);
	});

	test('cancelDrag calls endDrag and clears state', () => {
		store.startMoveDrag(piece1, allPieces);
		store.cancelDrag();

		expect(store.isActive).toBe(false);
		expect(store.sourcePieceId).toBe(null);
		expect(store.originalPosition).toBe(null);
		expect(store.originalConnections).toBe(null);
	});

	test('endDrag clears all move-specific state', () => {
		store.startMoveDrag(piece1, allPieces);

		expect(store.sourcePieceId).toBe('piece-1');
		expect(store.originalPosition).not.toBe(null);

		store.endDrag();

		expect(store.sourcePieceId).toBe(null);
		expect(store.originalPosition).toBe(null);
		expect(store.originalRotation).toBe(0);
		expect(store.originalConnections).toBe(null);
	});

	test('isMoveDrag is false for new-piece drags', () => {
		store.startDrag(shortStraight);
		expect(store.isMoveDrag).toBe(false);
	});

	test('isMoveDrag is false when not active', () => {
		expect(store.isMoveDrag).toBe(false);
	});
});
