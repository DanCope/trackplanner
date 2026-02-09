<script lang="ts">
	import Canvas from '$lib/components/Canvas.svelte';
	import DragPreview from '$lib/components/DragPreview.svelte';
	import PiecePanel from '$lib/components/PiecePanel.svelte';
	import { dragStore } from '$lib/stores/drag.svelte';
	import { onMount } from 'svelte';

	function handleKeyDown(e: KeyboardEvent): void {
		if (!dragStore.isActive) return;

		const isRotateKey = e.code === 'KeyR' || e.key.toLowerCase() === 'r';
		const isFlipKey = e.code === 'KeyF' || e.key.toLowerCase() === 'f';

		if (isRotateKey) {
			e.preventDefault();
			e.stopPropagation();
			dragStore.rotatePreview(1); // +45°
		} else if (isFlipKey) {
			e.preventDefault();
			e.stopPropagation();
			dragStore.cyclePort(); // Cycle to next port
		}
	}

	onMount(() => {
		document.addEventListener('keydown', handleKeyDown, { capture: true });

		return () => {
			document.removeEventListener('keydown', handleKeyDown, { capture: true });
		};
	});
</script>

<main class="flex h-screen flex-col">
	<header class="border-b border-gray-300 bg-white px-6 py-4">
		<h1 class="text-2xl font-bold text-gray-800">TrackPlanner</h1>
		<p class="text-sm text-gray-600">Drag pieces from the panel to build your layout</p>
	</header>

	<div class="flex flex-grow overflow-hidden">
		<PiecePanel />
		<div class="relative flex-grow">
			<Canvas />
		</div>
	</div>

	<DragPreview />
</main>
