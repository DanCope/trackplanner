<script lang="ts">
	import { PLARAIL_CONFIG } from '$lib/config';
	import type { PlacedPiece } from '$lib/types';
	import PortIndicator from './PortIndicator.svelte';

	interface Props {
		piece: PlacedPiece;
		isSelected?: boolean;
		onSelect?: () => void;
		interactive?: boolean;
	}

	let { piece, isSelected = false, onSelect, interactive = true }: Props = $props();

	const scale = PLARAIL_CONFIG.mmToPixels;
	const transform = $derived(
		`translate(${piece.position.x * scale}, ${piece.position.y * scale}) rotate(${piece.rotation})`
	);

	// Pastel colors for different piece types
	const fillColor = $derived.by(() => {
		switch (piece.definition.type) {
			case 'straight':
				return '#bfdbfe'; // blue-200
			case 'bridge':
				return '#fde68a'; // amber-200
			case 'turnout':
				return '#bbf7d0'; // green-200
			default:
				return '#fecdd3'; // rose-200
		}
	});

	// Bridge pieces have dashed stroke to visually indicate elevation
	const strokeDashArray = $derived(piece.definition.type === 'bridge' ? '4,2' : undefined);
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<g {transform} onclick={onSelect} class:selected={isSelected} pointer-events={interactive ? 'bounding-box' : 'none'}>
	<!-- Piece SVG path (thicker stroke for visibility) -->
	<path
		d={piece.definition.svgPath}
		stroke="#374151"
		stroke-width="2"
		stroke-dasharray={strokeDashArray}
		transform={`scale(${scale})`}
		vector-effect="non-scaling-stroke"
		fill={fillColor}
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
		<rect
			x="-30"
			y="-30"
			width="60"
			height="60"
			stroke="#3b82f6"
			stroke-width="2"
			fill="none"
			stroke-dasharray="5,5"
		/>
		<circle cx="0" cy="0" r="35" stroke="#3b82f6" stroke-width="1" fill="none" opacity="0.5" />
	{/if}
</g>

<style>
	g {
		cursor: pointer;
		transition: filter 150ms ease;
	}

	g:hover {
		filter: drop-shadow(0 0 3px rgba(59, 130, 246, 0.5));
	}

	g.selected {
		filter: drop-shadow(0 0 6px rgba(59, 130, 246, 0.8));
	}
</style>
