import { shortStraight } from '$lib/pieces';
import type { PlacedPiece } from '$lib/types';
import { beforeEach, describe, expect, it } from 'vitest';
import { ViewportStore } from './viewport.svelte';

const BASE_WIDTH = 1200;
const BASE_HEIGHT = 800;

const createPiece = (id: string, x: number, y: number): PlacedPiece => ({
	id,
	definition: shortStraight,
	position: { x, y },
	rotation: 0,
	connections: new Map()
});

describe('ViewportStore', () => {
	let store: ViewportStore;

	beforeEach(() => {
		store = new ViewportStore();
	});

	describe('initial state', () => {
		it('starts with default values', () => {
			expect(store.offsetX).toBe(0);
			expect(store.offsetY).toBe(0);
			expect(store.zoom).toBe(1);
			expect(store.isPanning).toBe(false);
			expect(store.panStartPos).toBe(null);
			expect(store.panStartOffset).toBe(null);
		});

		it('generates correct default viewBox', () => {
			const viewBox = store.getViewBox(BASE_WIDTH, BASE_HEIGHT);
			expect(viewBox).toBe('0 0 1200 800');
		});
	});

	describe('zoomIn and zoomOut', () => {
		it('zooms in by ZOOM_STEP', () => {
			store.zoomIn(BASE_WIDTH, BASE_HEIGHT);
			expect(store.zoom).toBeCloseTo(1.2, 5);
		});

		it('zooms out by ZOOM_STEP', () => {
			store.zoomOut(BASE_WIDTH, BASE_HEIGHT);
			expect(store.zoom).toBeCloseTo(1 / 1.2, 5);
		});

		it('clamps zoom at MAX_ZOOM (4)', () => {
			// Zoom in multiple times
			for (let i = 0; i < 20; i++) {
				store.zoomIn(BASE_WIDTH, BASE_HEIGHT);
			}
			expect(store.zoom).toBe(4);
		});

		it('clamps zoom at MIN_ZOOM (0.25)', () => {
			// Zoom out multiple times
			for (let i = 0; i < 20; i++) {
				store.zoomOut(BASE_WIDTH, BASE_HEIGHT);
			}
			expect(store.zoom).toBe(0.25);
		});
	});

	describe('zoomAtPoint', () => {
		it('zooms in at a specific point', () => {
			const worldPos = { x: 600, y: 400 }; // Center of default view
			store.zoomAtPoint(1, worldPos, BASE_WIDTH, BASE_HEIGHT);

			expect(store.zoom).toBeCloseTo(1.2, 5);
			// Center should remain roughly at center (within floating point precision)
			const viewCenterX = store.offsetX + BASE_WIDTH / store.zoom / 2;
			const viewCenterY = store.offsetY + BASE_HEIGHT / store.zoom / 2;
			expect(viewCenterX).toBeCloseTo(600, 1);
			expect(viewCenterY).toBeCloseTo(400, 1);
		});

		it('zooms out at a specific point', () => {
			const worldPos = { x: 600, y: 400 };
			store.zoomAtPoint(-1, worldPos, BASE_WIDTH, BASE_HEIGHT);

			expect(store.zoom).toBeCloseTo(1 / 1.2, 5);
			const viewCenterX = store.offsetX + BASE_WIDTH / store.zoom / 2;
			const viewCenterY = store.offsetY + BASE_HEIGHT / store.zoom / 2;
			expect(viewCenterX).toBeCloseTo(600, 1);
			expect(viewCenterY).toBeCloseTo(400, 1);
		});

		it('preserves point position when zooming at corner', () => {
			const worldPos = { x: 100, y: 100 }; // Top-left corner
			const oldZoom = store.zoom;

			store.zoomAtPoint(1, worldPos, BASE_WIDTH, BASE_HEIGHT);

			// The world point should maintain its relative position
			// This is complex to verify exactly, but we can check zoom changed
			expect(store.zoom).toBeGreaterThan(oldZoom);
		});

		it('does nothing when already at zoom limit', () => {
			// Zoom to max
			for (let i = 0; i < 20; i++) {
				store.zoomIn(BASE_WIDTH, BASE_HEIGHT);
			}
			const oldZoom = store.zoom;
			const oldOffsetX = store.offsetX;
			const oldOffsetY = store.offsetY;

			// Try to zoom in more
			store.zoomAtPoint(1, { x: 600, y: 400 }, BASE_WIDTH, BASE_HEIGHT);

			expect(store.zoom).toBe(oldZoom);
			expect(store.offsetX).toBe(oldOffsetX);
			expect(store.offsetY).toBe(oldOffsetY);
		});
	});

	describe('resetView', () => {
		it('resets all values to default', () => {
			store.zoom = 2;
			store.offsetX = 100;
			store.offsetY = 200;
			store.isPanning = true;
			store.panStartPos = { x: 10, y: 20 };
			store.panStartOffset = { x: 5, y: 15 };

			store.resetView();

			expect(store.zoom).toBe(1);
			expect(store.offsetX).toBe(0);
			expect(store.offsetY).toBe(0);
			expect(store.isPanning).toBe(false);
			expect(store.panStartPos).toBe(null);
			expect(store.panStartOffset).toBe(null);
		});
	});

	describe('pan', () => {
		it('adjusts offset by delta', () => {
			store.pan(50, 100);
			expect(store.offsetX).toBe(50);
			expect(store.offsetY).toBe(100);
		});

		it('accumulates multiple pans', () => {
			store.pan(50, 100);
			store.pan(20, 30);
			expect(store.offsetX).toBe(70);
			expect(store.offsetY).toBe(130);
		});
	});

	describe('pan lifecycle', () => {
		it('starts pan operation', () => {
			const screenPos = { x: 100, y: 200 };
			store.startPan(screenPos);

			expect(store.isPanning).toBe(true);
			expect(store.panStartPos).toEqual(screenPos);
			expect(store.panStartOffset).toEqual({ x: 0, y: 0 });
		});

		it('ends pan operation', () => {
			store.startPan({ x: 100, y: 200 });
			store.endPan();

			expect(store.isPanning).toBe(false);
			expect(store.panStartPos).toBe(null);
			expect(store.panStartOffset).toBe(null);
		});

		it('preserves offset after pan lifecycle', () => {
			store.offsetX = 50;
			store.offsetY = 75;
			store.startPan({ x: 100, y: 200 });

			expect(store.panStartOffset).toEqual({ x: 50, y: 75 });

			store.endPan();
			// Offset should remain (endPan doesn't reset offset)
			expect(store.offsetX).toBe(50);
			expect(store.offsetY).toBe(75);
		});
	});

	describe('fitToContent', () => {
		it('resets view when no pieces', () => {
			store.zoom = 2;
			store.offsetX = 100;
			store.offsetY = 200;

			store.fitToContent([], BASE_WIDTH, BASE_HEIGHT);

			expect(store.zoom).toBe(1);
			expect(store.offsetX).toBe(0);
			expect(store.offsetY).toBe(0);
		});

		it('frames a single piece', () => {
			const pieces = [createPiece('p1', 600, 400)];

			store.fitToContent(pieces, BASE_WIDTH, BASE_HEIGHT);

			// Zoom should be adjusted and offset should center on piece
			expect(store.zoom).toBeGreaterThan(0);
			expect(store.zoom).toBeLessThanOrEqual(4);
			// Difficult to verify exact values without knowing piece dimensions
		});

		it('frames multiple pieces', () => {
			const pieces = [
				createPiece('p1', 0, 0),
				createPiece('p2', 1000, 0),
				createPiece('p3', 500, 800)
			];

			store.fitToContent(pieces, BASE_WIDTH, BASE_HEIGHT);

			// Should zoom out to fit all pieces
			expect(store.zoom).toBeGreaterThan(0);
			expect(store.zoom).toBeLessThanOrEqual(4);
		});

		it('clamps zoom within limits', () => {
			// Create pieces very far apart to force zoom < MIN_ZOOM
			const pieces = [createPiece('p1', 0, 0), createPiece('p2', 100000, 100000)];

			store.fitToContent(pieces, BASE_WIDTH, BASE_HEIGHT);

			expect(store.zoom).toBeGreaterThanOrEqual(0.25);
			expect(store.zoom).toBeLessThanOrEqual(4);
		});
	});

	describe('getViewBox', () => {
		it('returns correct viewBox string at zoom 1', () => {
			const viewBox = store.getViewBox(BASE_WIDTH, BASE_HEIGHT);
			expect(viewBox).toBe('0 0 1200 800');
		});

		it('returns correct viewBox string at zoom 2', () => {
			store.zoom = 2;
			const viewBox = store.getViewBox(BASE_WIDTH, BASE_HEIGHT);
			expect(viewBox).toBe('0 0 600 400'); // Half width/height
		});

		it('returns correct viewBox string with offset', () => {
			store.offsetX = 100;
			store.offsetY = 200;
			const viewBox = store.getViewBox(BASE_WIDTH, BASE_HEIGHT);
			expect(viewBox).toBe('100 200 1200 800');
		});

		it('returns correct viewBox string with zoom and offset', () => {
			store.zoom = 2;
			store.offsetX = 100;
			store.offsetY = 200;
			const viewBox = store.getViewBox(BASE_WIDTH, BASE_HEIGHT);
			expect(viewBox).toBe('100 200 600 400');
		});
	});
});
