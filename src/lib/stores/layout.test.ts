import { shortStraight } from '$lib/pieces';
import type { PlacedPiece } from '$lib/types';
import { beforeEach, describe, expect, it } from 'vitest';
import { LayoutStore } from './layout.svelte';

const createPiece = (id: string): PlacedPiece => ({
	id,
	definition: shortStraight,
	position: { x: 0, y: 0 },
	rotation: 0,
	connections: new Map()
});

describe('LayoutStore', () => {
	let store: LayoutStore;

	beforeEach(() => {
		store = new LayoutStore();
	});

	it('adds pieces', () => {
		const piece = createPiece('piece-1');
		store.addPiece(piece);

		expect(store.pieces).toHaveLength(1);
		expect(store.getPiece('piece-1')).toBe(piece);
	});

	it('updates pieces', () => {
		const piece = createPiece('piece-1');
		store.addPiece(piece);
		store.updatePiece('piece-1', { rotation: 45 });

		expect(store.getPiece('piece-1')?.rotation).toBe(45);
	});

	it('removes pieces and clears connections', () => {
		const pieceA = createPiece('piece-a');
		const pieceB = createPiece('piece-b');
		pieceA.connections.set('A', 'piece-b:B');
		pieceB.connections.set('B', 'piece-a:A');

		store.addPiece(pieceA);
		store.addPiece(pieceB);
		store.removePiece('piece-b');

		expect(store.getPiece('piece-b')).toBeUndefined();
		expect(pieceA.connections.size).toBe(0);
	});
});
