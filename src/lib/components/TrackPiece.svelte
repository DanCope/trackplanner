<script lang="ts">
	import type { PlacedPiece } from '$lib/types';
	import { PLARAIL_CONFIG } from '$lib/config';
	import PortIndicator from './PortIndicator.svelte';

	interface Props {
		piece: PlacedPiece;
		isSelected?: boolean;
		onSelect?: () => void;
	}

	let { piece, isSelected = false, onSelect }: Props = $props();

	const scale = PLARAIL_CONFIG.mmToPixels;
	const transform = $derived(
		`translate(${piece.position.x * scale}, ${piece.position.y * scale}) rotate(${piece.rotation})`
	);
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<g {transform} onclick={onSelect} class:selected={isSelected}>
	<!-- Piece SVG path (thicker stroke for visibility) -->
	<path
		d={piece.definition.svgPath}
		stroke="#374151"
		stroke-width="2"
		transform={`scale(${scale})`}
		vector-effect="non-scaling-stroke"
		fill="none"
		stroke-linecap="round"
	/>

	<!-- Port indicators -->
	{#each piece.definition.ports as port}
		<PortIndicator
			position={{ x: port.position.x * scale, y: port.position.y * scale }}
			isConnected={piece.connections.has(port.id)}
		/>
	{/each}

	<!-- Selection highlight -->
	{#if isSelected}
		<rect x="-30" y="-30" width="60" height="60" stroke="blue" stroke-width="2" fill="none" />
	{/if}
</g>

<style>
	g.selected {
		filter: drop-shadow(0 0 4px blue);
	}
</style>
