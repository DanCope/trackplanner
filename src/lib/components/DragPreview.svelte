<script lang="ts">
	import { PLARAIL_CONFIG, VIEWPORT_CONFIG } from '$lib/config';
	import { dragStore } from '$lib/stores/drag.svelte';
	import { viewportStore } from '$lib/stores/viewport.svelte';
	import type { PlacedPiece } from '$lib/types';
	import { rotateVec2 } from '$lib/utils/geometry';
	import TrackPiece from './TrackPiece.svelte';

	const scale = PLARAIL_CONFIG.mmToPixels;
	const baseWidth = VIEWPORT_CONFIG.baseWidth;
	const baseHeight = VIEWPORT_CONFIG.baseHeight;

	let canvasRect = $state<DOMRect | null>(null);

	function getDragPreviewPiece(): PlacedPiece | null {
		if (!dragStore.isActive || !dragStore.activePieceDefinition) return null;

		const pos = dragStore.snappedPosition || dragStore.cursorPosition;
		const rotation = dragStore.snappedPosition ? dragStore.snappedRotation : dragStore.preRotation;

		return {
			id: '__drag-preview__',
			definition: dragStore.activePieceDefinition,
			position: pos,
			rotation,
			connections: new Map()
		};
	}

	const previewPiece = $derived(getDragPreviewPiece());

	// Get selected port world position for highlight
	const selectedPortWorldPos = $derived.by(() => {
		if (!previewPiece || dragStore.selectedPortIndex === null) return null;
		const port = previewPiece.definition.ports[dragStore.selectedPortIndex];
		if (!port) return null;

		const rotatedPortPos = rotateVec2(port.position, { x: 0, y: 0 }, previewPiece.rotation);
		return {
			x: (previewPiece.position.x + rotatedPortPos.x) * scale,
			y: (previewPiece.position.y + rotatedPortPos.y) * scale
		};
	});

	// Get current viewBox from viewport store
	const viewBox = $derived(viewportStore.getViewBox(baseWidth, baseHeight));

	$effect(() => {
		if (!dragStore.isActive) {
			canvasRect = null;
			return;
		}

		const canvas = document.getElementById('track-canvas') as SVGSVGElement | null;
		if (!canvas) {
			return;
		}

		canvasRect = canvas.getBoundingClientRect();
	});
</script>

{#if previewPiece && canvasRect}
	<svg
		class="pointer-events-none fixed z-50"
		style={`left: ${canvasRect.left}px; top: ${canvasRect.top}px; width: ${canvasRect.width}px; height: ${canvasRect.height}px; overflow: visible;`}
		{viewBox}
	>
		<g opacity="0.6">
			<TrackPiece piece={previewPiece} isSelected={false} onSelect={() => {}} />
		</g>

		<!-- Highlight selected port with blue pulsing circle -->
		{#if selectedPortWorldPos}
			<circle
				cx={selectedPortWorldPos.x}
				cy={selectedPortWorldPos.y}
				r="8"
				fill="none"
				stroke="#3b82f6"
				stroke-width="2"
				opacity="0.8"
			>
				<animate attributeName="r" values="6;10;6" dur="1.5s" repeatCount="indefinite" />
				<animate attributeName="opacity" values="0.8;0.4;0.8" dur="1.5s" repeatCount="indefinite" />
			</circle>
		{/if}
	</svg>
{/if}
