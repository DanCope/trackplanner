<script lang="ts">
	import type { Vec2 } from '$lib/types';

	interface Props {
		position: Vec2;
		isConnected?: boolean;
		isAvailable?: boolean;
	}

	let { position, isConnected = false, isAvailable = false }: Props = $props();

	const radius = 6; // Increased from 4 for better visibility
	const color = $derived(isConnected ? '#22c55e' : isAvailable ? '#fbbf24' : '#d97706'); // green : bright amber : amber
</script>

<circle cx={position.x} cy={position.y} r={radius} fill={color} />

{#if isAvailable}
	<circle
		cx={position.x}
		cy={position.y}
		r={radius + 2}
		stroke={color}
		stroke-width="1"
		fill="none"
	/>
{/if}
