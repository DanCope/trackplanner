import { shortStraight } from '$lib/pieces';
import type { PlacedPiece } from '$lib/types';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TrackPiece from './TrackPiece.svelte';

const mockPiece: PlacedPiece = {
	id: 'test-1',
	definition: shortStraight,
	position: { x: 0, y: 0 },
	rotation: 0,
	connections: new Map()
};

describe('TrackPiece', () => {
	it('renders piece SVG path', async () => {
		const { container } = render(TrackPiece, { props: { piece: mockPiece } });
		const path = container.querySelector('path');
		expect(path).toBeTruthy();
		expect(path?.getAttribute('d')).toBe(shortStraight.svgPath);
	});

	it('applies position and rotation transform', async () => {
		const rotatedPiece = { ...mockPiece, position: { x: 10, y: 20 }, rotation: 45 };
		const { container } = render(TrackPiece, { props: { piece: rotatedPiece } });
		const g = container.querySelector('g');
		expect(g?.getAttribute('transform')).toContain('translate');
		expect(g?.getAttribute('transform')).toContain('rotate(45)');
	});

	it('renders port indicators', async () => {
		const { container } = render(TrackPiece, { props: { piece: mockPiece } });
		const circles = container.querySelectorAll('circle');
		// Should have at least port count circles
		expect(circles.length).toBeGreaterThanOrEqual(mockPiece.definition.ports.length);
	});

	it('shows selection highlight when selected', async () => {
		const { container } = render(TrackPiece, { props: { piece: mockPiece, isSelected: true } });
		const rect = container.querySelector('rect');
		expect(rect).toBeTruthy();
	});
});
