<script lang="ts">
	import Canvas from '$lib/components/Canvas.svelte';
	import DragPreview from '$lib/components/DragPreview.svelte';
	import PiecePanel from '$lib/components/PiecePanel.svelte';
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
