<script lang="ts">
	import { VIEWPORT_CONFIG } from '$lib/config';
	import { viewportStore } from '$lib/stores/viewport.svelte';

	const baseWidth = VIEWPORT_CONFIG.baseWidth;
	const baseHeight = VIEWPORT_CONFIG.baseHeight;

	const handleZoomIn = (): void => {
		viewportStore.zoomIn(baseWidth, baseHeight);
	};

	const handleZoomOut = (): void => {
		viewportStore.zoomOut(baseWidth, baseHeight);
	};

	const handleReset = (): void => {
		viewportStore.resetView();
	};

	const zoomPercent = $derived(Math.round(viewportStore.zoom * 100));
</script>

<div
	class="absolute right-4 bottom-4 flex flex-col gap-1 rounded bg-white/90 p-1 shadow-md"
	role="toolbar"
	aria-label="Zoom controls"
>
	<button
		onclick={handleZoomIn}
		aria-label="Zoom in"
		class="flex h-8 w-8 items-center justify-center rounded text-gray-700 transition-colors hover:bg-gray-200"
		type="button"
	>
		<span class="text-lg font-semibold">+</span>
	</button>

	<div class="min-w-8 py-1 text-center text-xs text-gray-600" aria-live="polite">
		{zoomPercent}%
	</div>

	<button
		onclick={handleZoomOut}
		aria-label="Zoom out"
		class="flex h-8 w-8 items-center justify-center rounded text-gray-700 transition-colors hover:bg-gray-200"
		type="button"
	>
		<span class="text-lg font-semibold">−</span>
	</button>

	<div class="my-1 border-t border-gray-300"></div>

	<button
		onclick={handleReset}
		aria-label="Reset view"
		class="flex h-8 w-8 items-center justify-center rounded text-[10px] text-gray-700 transition-colors hover:bg-gray-200"
		type="button"
		title="Reset zoom and pan"
	>
		<span>⊙</span>
	</button>
</div>
