<script lang="ts">
	import Canvas from '$lib/components/Canvas.svelte';
	import DragPreview from '$lib/components/DragPreview.svelte';
	import PiecePanel from '$lib/components/PiecePanel.svelte';
	import Toolbar from '$lib/components/Toolbar.svelte';
	import { dragStore } from '$lib/stores/drag.svelte';
	import { layoutStore } from '$lib/stores/layout.svelte';
	import { selectionStore } from '$lib/stores/selection.svelte';
	import { onMount } from 'svelte';

	function handleKeyDown(e: KeyboardEvent): void {
		// Handle drag rotation/port cycling
		if (dragStore.isActive) {
			const isRotateKey = e.code === 'KeyR' || e.key.toLowerCase() === 'r';
			const isFlipKey = e.code === 'KeyF' || e.key.toLowerCase() === 'f';

			if (isRotateKey) {
				e.preventDefault();
				e.stopPropagation();
				dragStore.rotatePreview(1); // +45°
				return;
			} else if (isFlipKey) {
				e.preventDefault();
				e.stopPropagation();
				dragStore.cyclePort(); // Cycle to next port
				return;
			}
		}

		// Handle deletion of selected piece
		if ((e.key === 'Delete' || e.key === 'Backspace') && selectionStore.selectedPieceId) {
			e.preventDefault();
			layoutStore.removePiece(selectionStore.selectedPieceId);
			selectionStore.deselect();
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

	<Toolbar />

	<div class="flex flex-grow overflow-hidden">
		<PiecePanel />
		<div class="relative flex-grow">
			<Canvas />
		</div>
	</div>

	<DragPreview />
</main>
