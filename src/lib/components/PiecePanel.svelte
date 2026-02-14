<script lang="ts">
	import { PLARAIL_CONFIG } from '$lib/config';
	import { bridge, curve45, longStraight, shortStraight, turnout } from '$lib/pieces';
	import { dragStore } from '$lib/stores/drag.svelte';
	import type { PieceDefinition } from '$lib/types';

	const pieces = [
		{ name: 'Straight', definition: shortStraight },
		{ name: 'Long Straight', definition: longStraight },
		{ name: 'Bridge', definition: bridge },
		{ name: 'Curve 45°', definition: curve45 },
		{ name: 'Turnout', definition: turnout }
	];

	const scale = PLARAIL_CONFIG.mmToPixels;

	const getWorldPositionFromEvent = (event: MouseEvent): { x: number; y: number } | null => {
		const svg = document.getElementById('track-canvas') as SVGSVGElement | null;
		if (!svg) {
			return null;
		}

		const ctm = svg.getScreenCTM();
		if (!ctm) {
			return null;
		}

		const pt = svg.createSVGPoint();
		pt.x = event.clientX;
		pt.y = event.clientY;
		const svgCoords = pt.matrixTransform(ctm.inverse());

		return {
			x: svgCoords.x / scale,
			y: svgCoords.y / scale
		};
	};

	function handleMouseDown(e: MouseEvent, definition: PieceDefinition): void {
		e.preventDefault();
		dragStore.startDrag(definition);
		const initialPos = getWorldPositionFromEvent(e);
		if (initialPos) {
			dragStore.updateCursorPosition(initialPos);
		}

		// Add event listeners for mouse move and up
		const handleMouseMove = (moveEvent: MouseEvent): void => {
			const worldPos = getWorldPositionFromEvent(moveEvent);
			if (!worldPos) {
				return;
			}
			dragStore.updateCursorPosition(worldPos);
		};

		const handleMouseUp = (): void => {
			dragStore.endDrag();
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		};

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
	}
</script>

<div class="flex w-48 flex-col gap-4 border-r border-gray-300 bg-gray-50 p-4">
	<h2 class="text-lg font-semibold text-gray-800">Pieces</h2>
	{#each pieces as item}
		<button
			type="button"
			class="cursor-grab rounded border border-gray-300 bg-white px-4 py-3 transition-colors hover:border-blue-400 hover:bg-blue-50 active:cursor-grabbing"
			onmousedown={(e) => handleMouseDown(e, item.definition)}
		>
			{item.name}
		</button>
	{/each}

	<div class="mt-auto rounded border border-blue-200 bg-blue-50 p-3 text-xs text-gray-700">
		<p class="font-semibold text-blue-800">Tip:</p>
		<p>
			Press <kbd class="rounded bg-white px-1.5 py-0.5 font-mono shadow-sm">R</kbd> to rotate,
			<kbd class="rounded bg-white px-1.5 py-0.5 font-mono shadow-sm">F</kbd> to flip
		</p>
	</div>
</div>
