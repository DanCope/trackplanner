<script lang="ts">
	import TrackPiece from '$lib/components/TrackPiece.svelte';
	import { layoutStore } from '$lib/stores/layout.svelte';
	import { selectionStore } from '$lib/stores/selection.svelte';

	const width = 1200;
	const height = 800;

	const handleCanvasClick = (event: MouseEvent): void => {
		if (event.target === event.currentTarget) {
			selectionStore.deselect();
		}
	};
</script>

<svg
	{width}
	{height}
	viewBox={`0 0 ${width} ${height}`}
	class="rounded border border-gray-300 bg-white"
	onclick={handleCanvasClick}
>
	{#each layoutStore.pieces as piece (piece.id)}
		<TrackPiece
			{piece}
			isSelected={selectionStore.isSelected(piece.id)}
			onSelect={() => selectionStore.select(piece.id)}
		/>
	{/each}
</svg>
