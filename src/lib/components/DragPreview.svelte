<script lang="ts">
	import { dragStore } from '$lib/stores/drag.svelte';
	import type { PlacedPiece } from '$lib/types';
	import TrackPiece from './TrackPiece.svelte';

	let canvasRect = $state<DOMRect | null>(null);
	let canvasSize = $state<{ width: number; height: number } | null>(null);

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

	$effect(() => {
		if (!dragStore.isActive) {
			canvasRect = null;
			canvasSize = null;
			return;
		}

		const canvas = document.getElementById('track-canvas') as SVGSVGElement | null;
		if (!canvas) {
			return;
		}

		canvasRect = canvas.getBoundingClientRect();
		canvasSize = {
			width: canvas.viewBox.baseVal.width || canvas.width.baseVal.value,
			height: canvas.viewBox.baseVal.height || canvas.height.baseVal.value
		};
	});
</script>

{#if previewPiece && canvasRect && canvasSize}
	<svg
		class="pointer-events-none fixed z-50"
		style={`left: ${canvasRect.left}px; top: ${canvasRect.top}px; width: ${canvasRect.width}px; height: ${canvasRect.height}px; overflow: visible;`}
		viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`}
	>
		<g opacity="0.6">
			<TrackPiece piece={previewPiece} isSelected={false} onSelect={() => {}} />
		</g>
	</svg>
{/if}
