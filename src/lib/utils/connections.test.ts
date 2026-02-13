import { curve45, shortStraight, turnout } from '$lib/pieces';
import type { PlacedPiece } from '$lib/types';
import { describe, expect, it } from 'vitest';
import {
	connectPorts,
	disconnectPiece,
	disconnectPort,
	findCoincidentConnections,
	findSnapTarget
} from './connections';
import { addVec2, oppositeDirection, rotateVec2Simple } from './geometry';
import { computeSnapTransform } from './snap';

const createPiece = (id: string, position = { x: 0, y: 0 }, rotation = 0): PlacedPiece => ({
	id,
	definition: shortStraight,
	position,
	rotation,
	connections: new Map()
});

describe('connections', () => {
	it('finds the nearest open snap target', () => {
		const piece = createPiece('piece-1');
		const portB = piece.definition.ports.find((port) => port.id === 'B');
		if (!portB) throw new Error('Missing port B');

		const worldPosition = addVec2(piece.position, rotateVec2Simple(portB.position, piece.rotation));
		const result = findSnapTarget(
			{
				worldPosition,
				direction: oppositeDirection(portB.direction)
			},
			[piece],
			'dragged'
		);

		expect(result?.pieceId).toBe('piece-1');
		expect(result?.port.id).toBe('B');
	});

	it('returns null when no ports are available', () => {
		const piece = createPiece('piece-1');
		piece.connections.set('B', 'other:A');
		const portB = piece.definition.ports.find((port) => port.id === 'B');
		if (!portB) throw new Error('Missing port B');

		const worldPosition = addVec2(piece.position, rotateVec2Simple(portB.position, piece.rotation));
		const result = findSnapTarget(
			{
				worldPosition,
				direction: oppositeDirection(portB.direction)
			},
			[piece],
			'dragged'
		);

		expect(result).toBeNull();
	});

	it('connects ports bidirectionally', () => {
		const pieceA = createPiece('piece-a');
		const pieceB = createPiece('piece-b');

		connectPorts(pieceA, 'A', pieceB, 'B');

		expect(pieceA.connections.get('A')).toBe('piece-b:B');
		expect(pieceB.connections.get('B')).toBe('piece-a:A');
	});

	it('disconnects a single port', () => {
		const pieceA = createPiece('piece-a');
		const pieceB = createPiece('piece-b');
		connectPorts(pieceA, 'A', pieceB, 'B');

		disconnectPort(pieceA, 'A', [pieceA, pieceB]);

		expect(pieceA.connections.size).toBe(0);
		expect(pieceB.connections.size).toBe(0);
	});

	it('disconnects all ports on a piece', () => {
		const pieceA = createPiece('piece-a');
		const pieceB = createPiece('piece-b');
		const pieceC = createPiece('piece-c');

		connectPorts(pieceA, 'A', pieceB, 'A');
		connectPorts(pieceA, 'B', pieceC, 'A');

		disconnectPiece(pieceA, [pieceA, pieceB, pieceC]);

		expect(pieceA.connections.size).toBe(0);
		expect(pieceB.connections.size).toBe(0);
		expect(pieceC.connections.size).toBe(0);
	});
});
describe('findCoincidentConnections', () => {
	it('finds ports at the same position with opposite directions', () => {
		// Place two straight pieces end-to-end
		// Piece A at origin, port B at (0, 27) facing N
		const pieceA = createPiece('piece-a', { x: 0, y: 0 }, 0);
		// Piece B positioned so port A is at (0, 27) facing S
		const pieceB = createPiece('piece-b', { x: 0, y: 54 }, 0);

		const matches = findCoincidentConnections(pieceB, [pieceA, pieceB], 0.5);

		expect(matches).toHaveLength(1);
		expect(matches[0].newPiecePortId).toBe('A');
		expect(matches[0].existingPieceId).toBe('piece-a');
		expect(matches[0].existingPortId).toBe('B');
	});

	it('returns empty array when ports are too far apart', () => {
		const pieceA = createPiece('piece-a', { x: 0, y: 0 }, 0);
		const pieceB = createPiece('piece-b', { x: 0, y: 60 }, 0); // 6mm gap

		const matches = findCoincidentConnections(pieceB, [pieceA, pieceB], 0.5);

		expect(matches).toHaveLength(0);
	});

	it('ignores ports with same direction (not opposite)', () => {
		const pieceA = createPiece('piece-a', { x: 0, y: 0 }, 0);
		// PieceB rotated 180°, so ports now face same directions as pieceA when overlapped
		const pieceB = createPiece('piece-b', { x: 0, y: 0 }, 180);

		const matches = findCoincidentConnections(pieceB, [pieceA, pieceB], 0.5);

		expect(matches).toHaveLength(0);
	});

	it('skips already-connected ports on new piece', () => {
		const pieceA = createPiece('piece-a', { x: 0, y: 0 }, 0);
		const pieceB = createPiece('piece-b', { x: 0, y: 54 }, 0);
		const pieceC = createPiece('piece-c', { x: 0, y: 108 }, 0);

		// Connect pieceB's port A to pieceA's port B
		connectPorts(pieceB, 'A', pieceA, 'B');

		const matches = findCoincidentConnections(pieceB, [pieceA, pieceB, pieceC], 0.5);

		// Should only find port B of pieceB (port A is connected)
		expect(matches).toHaveLength(1);
		expect(matches[0].newPiecePortId).toBe('B');
		expect(matches[0].existingPieceId).toBe('piece-c');
	});

	it('skips already-connected ports on existing pieces', () => {
		const pieceA = createPiece('piece-a', { x: 0, y: 0 }, 0);
		const pieceB = createPiece('piece-b', { x: 0, y: 54 }, 0);
		const pieceC = createPiece('piece-c', { x: 0, y: 108 }, 0);
		const pieceD = createPiece('piece-d', { x: 50, y: 0 }, 0);

		// Connect pieceA's port B to pieceD (so pieceA port B is unavailable)
		connectPorts(pieceA, 'B', pieceD, 'A');

		const matches = findCoincidentConnections(pieceB, [pieceA, pieceB, pieceC, pieceD], 0.5);

		// Should skip pieceA's port B (connected) but find pieceC's port A
		expect(matches).toHaveLength(1);
		expect(matches[0].existingPieceId).toBe('piece-c');
		expect(matches[0].existingPortId).toBe('A');
	});

	it('handles rotated pieces correctly', () => {
		// PieceA rotated 90°, port B now at (-27, 0) facing E
		const pieceA = createPiece('piece-a', { x: 0, y: 0 }, 90);
		// PieceB rotated 90°, port A at (0, -27), needs to be at position (46, 0) facing W
		// ... to align with pieceA's port B at (-27, 0)
		// Actually: if pieceA is at origin and rotated 90°, port B (originally at 0, 27) is now at (-27, 0) facing E
		// For pieceB rotated 90°, port A (originally at 0, -27) becomes (27, 0) relative to piece origin
		// To have port A at (-27, 0) in world coords, piece origin must be at (-54, 0)
		const pieceB = createPiece('piece-b', { x: -54, y: 0 }, 90);

		const matches = findCoincidentConnections(pieceB, [pieceA, pieceB], 0.5);

		expect(matches).toHaveLength(1);
		expect(matches[0].newPiecePortId).toBe('A');
		expect(matches[0].existingPortId).toBe('B');
	});
});

describe('loop closure with curves', () => {
	const placeSnappedPiece = (
		id: string,
		definition: PlacedPiece['definition'],
		draggedPortId: string,
		targetPiece: PlacedPiece,
		targetPortId: string
	): PlacedPiece => {
		const snap = computeSnapTransform(definition, draggedPortId, targetPiece, targetPortId, 0);
		return {
			id,
			definition,
			position: snap.position,
			rotation: snap.rotation,
			connections: new Map()
		};
	};

	it('closes a loop with 8 curves', () => {
		const pieces: PlacedPiece[] = [];

		const first: PlacedPiece = {
			id: 'curve-0',
			definition: curve45,
			position: { x: 0, y: 0 },
			rotation: 0,
			connections: new Map()
		};
		pieces.push(first);

		let prev = first;
		let prevExitPortId = 'B';

		for (let i = 1; i < 8; i += 1) {
			const next = placeSnappedPiece(`curve-${i}`, curve45, 'A', prev, prevExitPortId);
			pieces.push(next);
			prev = next;
			prevExitPortId = 'B';
		}

		const matches = findCoincidentConnections(prev, pieces, 0.5);
		const closesLoop = matches.some(
			(match) => match.newPiecePortId === 'B' && match.existingPieceId === 'curve-0'
		);
		expect(closesLoop).toBe(true);
	});

	it('closes a loop when one curve is a turnout branch', () => {
		const pieces: PlacedPiece[] = [];

		const first: PlacedPiece = {
			id: 'curve-0',
			definition: curve45,
			position: { x: 0, y: 0 },
			rotation: 0,
			connections: new Map()
		};
		pieces.push(first);

		let prev = first;
		let prevExitPortId = 'B';

		for (let i = 1; i < 8; i += 1) {
			const isTurnout = i === 4;
			const definition = isTurnout ? turnout : curve45;
			const entryPortId = 'A';
			const exitPortId = isTurnout ? 'C' : 'B';

			const next = placeSnappedPiece(`piece-${i}`, definition, entryPortId, prev, prevExitPortId);
			pieces.push(next);
			prev = next;
			prevExitPortId = exitPortId;
		}

		const matches = findCoincidentConnections(prev, pieces, 0.5);
		const closesLoop = matches.some(
			(match) => match.newPiecePortId === prevExitPortId && match.existingPieceId === 'curve-0'
		);
		expect(closesLoop).toBe(true);
	});
});
