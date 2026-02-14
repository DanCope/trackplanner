<script lang="ts">
	import Canvas from '$lib/components/Canvas.svelte';
	import DragPreview from '$lib/components/DragPreview.svelte';
	import PiecePanel from '$lib/components/PiecePanel.svelte';
	import Toolbar from '$lib/components/Toolbar.svelte';
	import ZoomControls from '$lib/components/ZoomControls.svelte';
	import { VIEWPORT_CONFIG } from '$lib/config';
	import { dragStore } from '$lib/stores/drag.svelte';
	import { layoutStore } from '$lib/stores/layout.svelte';
	import { selectionStore } from '$lib/stores/selection.svelte';
	import { viewportStore } from '$lib/stores/viewport.svelte';
	import { onMount } from 'svelte';

	const baseWidth = VIEWPORT_CONFIG.baseWidth;
	const baseHeight = VIEWPORT_CONFIG.baseHeight;

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

		// Handle zoom controls (when canvas or document is focused)
		if (e.key === '+' || e.key === '=') {
			e.preventDefault();
			viewportStore.zoomIn(baseWidth, baseHeight);
			return;
		} else if (e.key === '-') {
			e.preventDefault();
			viewportStore.zoomOut(baseWidth, baseHeight);
			return;
		} else if (e.key === '0') {
			e.preventDefault();
			viewportStore.resetView();
			return;
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
			<ZoomControls />
		</div>
	</div>

	<DragPreview />
</main>
