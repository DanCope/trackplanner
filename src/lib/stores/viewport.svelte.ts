import type { PlacedPiece, Vec2 } from '$lib/types';
import { rotateVec2 } from '$lib/utils/geometry';

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;
const ZOOM_STEP = 1.2; // Multiplier per scroll tick

export class ViewportStore {
	offsetX = $state(0);
	offsetY = $state(0);
	zoom = $state(1);
	isPanning = $state(false);
	panStartPos = $state<Vec2 | null>(null);
	panStartOffset = $state<Vec2 | null>(null);

	/**
	 * Computed viewBox string for SVG element
	 */
	getViewBox(baseWidth: number, baseHeight: number): string {
		const viewWidth = baseWidth / this.zoom;
		const viewHeight = baseHeight / this.zoom;
		return `${this.offsetX} ${this.offsetY} ${viewWidth} ${viewHeight}`;
	}

	/**
	 * Zoom in or out at a specific world position to keep that point under the cursor
	 */
	zoomAtPoint(direction: 1 | -1, worldPos: Vec2, baseWidth: number, baseHeight: number): void {
		const oldZoom = this.zoom;
		const zoomFactor = direction === 1 ? ZOOM_STEP : 1 / ZOOM_STEP;
		const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, oldZoom * zoomFactor));

		if (newZoom === oldZoom) {
			return; // Already at limit
		}

		// Adjust offset so worldPos stays under cursor
		this.offsetX = worldPos.x - ((worldPos.x - this.offsetX) * oldZoom) / newZoom;
		this.offsetY = worldPos.y - ((worldPos.y - this.offsetY) * oldZoom) / newZoom;
		this.zoom = newZoom;
	}

	/**
	 * Zoom in (centered on current view center)
	 */
	zoomIn(baseWidth: number, baseHeight: number): void {
		const centerX = this.offsetX + baseWidth / this.zoom / 2;
		const centerY = this.offsetY + baseHeight / this.zoom / 2;
		this.zoomAtPoint(1, { x: centerX, y: centerY }, baseWidth, baseHeight);
	}

	/**
	 * Zoom out (centered on current view center)
	 */
	zoomOut(baseWidth: number, baseHeight: number): void {
		const centerX = this.offsetX + baseWidth / this.zoom / 2;
		const centerY = this.offsetY + baseHeight / this.zoom / 2;
		this.zoomAtPoint(-1, { x: centerX, y: centerY }, baseWidth, baseHeight);
	}

	/**
	 * Reset viewport to default (zoom=1, offset=0)
	 */
	resetView(): void {
		this.offsetX = 0;
		this.offsetY = 0;
		this.zoom = 1;
		this.isPanning = false;
		this.panStartPos = null;
		this.panStartOffset = null;
	}

	/**
	 * Pan by delta in world coordinates
	 */
	pan(deltaX: number, deltaY: number): void {
		this.offsetX += deltaX;
		this.offsetY += deltaY;
	}

	/**
	 * Start pan operation
	 */
	startPan(screenPos: Vec2): void {
		this.isPanning = true;
		this.panStartPos = screenPos;
		this.panStartOffset = { x: this.offsetX, y: this.offsetY };
	}

	/**
	 * Update pan based on screen movement
	 */
	updatePan(screenPos: Vec2, svgElement: SVGSVGElement | null): void {
		if (!this.isPanning || !this.panStartPos || !this.panStartOffset || !svgElement) {
			return;
		}

		// Convert screen delta to world delta
		const ctm = svgElement.getScreenCTM();
		if (!ctm) {
			return;
		}

		// Create two points in screen space
		const pt1 = svgElement.createSVGPoint();
		pt1.x = this.panStartPos.x;
		pt1.y = this.panStartPos.y;
		const worldStart = pt1.matrixTransform(ctm.inverse());

		const pt2 = svgElement.createSVGPoint();
		pt2.x = screenPos.x;
		pt2.y = screenPos.y;
		const worldEnd = pt2.matrixTransform(ctm.inverse());

		// Calculate world-space delta
		const worldDeltaX = worldStart.x - worldEnd.x;
		const worldDeltaY = worldStart.y - worldEnd.y;

		// Apply delta to initial offset
		this.offsetX = this.panStartOffset.x + worldDeltaX;
		this.offsetY = this.panStartOffset.y + worldDeltaY;
	}

	/**
	 * End pan operation
	 */
	endPan(): void {
		this.isPanning = false;
		this.panStartPos = null;
		this.panStartOffset = null;
	}

	/**
	 * Fit viewport to show all pieces with some padding
	 */
	fitToContent(pieces: PlacedPiece[], baseWidth: number, baseHeight: number): void {
		if (pieces.length === 0) {
			this.resetView();
			return;
		}

		// Calculate bounding box of all pieces
		let minX = Infinity;
		let minY = Infinity;
		let maxX = -Infinity;
		let maxY = -Infinity;

		for (const piece of pieces) {
			// Consider piece position and all port positions (approximation)
			const { position, rotation, definition } = piece;

			// Check piece position
			minX = Math.min(minX, position.x);
			minY = Math.min(minY, position.y);
			maxX = Math.max(maxX, position.x);
			maxY = Math.max(maxY, position.y);

			// Check all port positions (rotated)
			if (definition.ports) {
				for (const port of definition.ports) {
					if (port.position) {
						const rotatedPort = rotateVec2(port.position, { x: 0, y: 0 }, rotation);
						const worldPort = {
							x: position.x + rotatedPort.x,
							y: position.y + rotatedPort.y
						};
						minX = Math.min(minX, worldPort.x);
						minY = Math.min(minY, worldPort.y);
						maxX = Math.max(maxX, worldPort.x);
						maxY = Math.max(maxY, worldPort.y);
					}
				}
			}
		}

		// Verify we got valid bounds
		if (!isFinite(minX) || !isFinite(maxX) || !isFinite(minY) || !isFinite(maxY)) {
			this.resetView();
			return;
		}

		// Add padding (10% of content size, or minimum 100 units)
		const contentWidth = maxX - minX;
		const contentHeight = maxY - minY;
		const paddingX = Math.max(contentWidth * 0.1, 100);
		const paddingY = Math.max(contentHeight * 0.1, 100);

		minX -= paddingX;
		minY -= paddingY;
		maxX += paddingX;
		maxY += paddingY;

		// Calculate required zoom to fit content (avoid division by zero)
		const finalWidth = maxX - minX;
		const finalHeight = maxY - minY;

		if (finalWidth <= 0 || finalHeight <= 0) {
			// Invalid bounding box, reset to default
			this.resetView();
			return;
		}

		const requiredZoom = Math.min(baseWidth / finalWidth, baseHeight / finalHeight);
		this.zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, requiredZoom));

		// Center on content
		this.offsetX = minX;
		this.offsetY = minY;
	}
}

export const viewportStore = new ViewportStore();
