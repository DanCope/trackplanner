import { shortStraight } from '$lib/pieces';
import { layoutStore } from '$lib/stores/layout.svelte';
import { selectionStore } from '$lib/stores/selection.svelte';
import type { PlacedPiece } from '$lib/types';
import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Canvas from './Canvas.svelte';

const createPiece = (id: string, position = { x: 0, y: 0 }): PlacedPiece => ({
	id,
	definition: shortStraight,
	position,
	rotation: 0,
	connections: new Map()
});

describe('Canvas', () => {
	beforeEach(() => {
		layoutStore.pieces = [];
		selectionStore.deselect();
	});

	it('renders all pieces from the layout store', () => {
		layoutStore.pieces = [createPiece('piece-1'), createPiece('piece-2', { x: 50, y: 50 })];

		const { container } = render(Canvas);
		const groups = container.querySelectorAll('g');
		expect(groups.length).toBeGreaterThanOrEqual(2);
	});

	it('selects a piece on click', () => {
		layoutStore.pieces = [createPiece('piece-1')];

		const { container } = render(Canvas);
		const group = container.querySelector('g');
		group?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

		expect(selectionStore.selectedPieceId).toBe('piece-1');
	});

	it('deselects when clicking the canvas background', () => {
		layoutStore.pieces = [createPiece('piece-1')];
		selectionStore.select('piece-1');

		const { container } = render(Canvas);
		const svg = container.querySelector('svg');

		// Simulate a short click (mousedown then mouseup without moving)
		svg?.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 100, clientY: 100 }));
		svg?.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: 100, clientY: 100 }));

		expect(selectionStore.selectedPieceId).toBeNull();
	});
});
