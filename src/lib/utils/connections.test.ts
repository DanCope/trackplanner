import { shortStraight } from '$lib/pieces';
import type { PlacedPiece } from '$lib/types';
import { describe, expect, it } from 'vitest';
import { connectPorts, disconnectPiece, disconnectPort, findSnapTarget } from './connections';
import { addVec2, oppositeDirection, rotateVec2Simple } from './geometry';

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
