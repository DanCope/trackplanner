<script lang="ts">
	import TrackPiece from '$lib/components/TrackPiece.svelte';
	import { shortStraight, curve45 } from '$lib/pieces';
	import type { PlacedPiece, Vec2 } from '$lib/types';
	import { addVec2, directionToAngle, rotateVec2Simple } from '$lib/utils/geometry';

	const desiredCenter: Vec2 = { x: 300, y: 300 }; // mm (matches 1200px viewBox at 2px/mm)
	const portA = curve45.ports.find((port) => port.id === 'A');
	const portB = curve45.ports.find((port) => port.id === 'B');

	if (!portA || !portB) {
		throw new Error('Curve definition missing ports A or B');
	}

	// Build a loop by chaining pieces using port geometry (entry -> exit)
	const rawCirclePieces: PlacedPiece[] = [];
	let currentPosition: Vec2 = { x: 0, y: 0 };
	let currentRotation = 0;

	for (let i = 0; i < 8; i++) {
		const piece: PlacedPiece = {
			id: `circle-${i}`,
			definition: curve45,
			position: currentPosition,
			rotation: currentRotation,
			connections: new Map()
		};

		rawCirclePieces.push(piece);

		const portBWorld = addVec2(currentPosition, rotateVec2Simple(portB.position, currentRotation));
		const portBWorldAngle = directionToAngle(portB.direction) + currentRotation;
		// Port directions are defined as the direction of travel through the piece.
		// Align the next piece's entry direction to match the current exit direction.
		const nextRotation =
			(((portBWorldAngle - directionToAngle(portA.direction)) % 360) + 360) % 360;

		currentPosition = portBWorld;
		currentRotation = nextRotation;
	}

	// Center the loop in the canvas by computing bounds of all port positions
	let minX = Infinity;
	let minY = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;

	for (const piece of rawCirclePieces) {
		const origin = piece.position;
		minX = Math.min(minX, origin.x);
		minY = Math.min(minY, origin.y);
		maxX = Math.max(maxX, origin.x);
		maxY = Math.max(maxY, origin.y);

		for (const port of piece.definition.ports) {
			const worldPort = addVec2(origin, rotateVec2Simple(port.position, piece.rotation));
			minX = Math.min(minX, worldPort.x);
			minY = Math.min(minY, worldPort.y);
			maxX = Math.max(maxX, worldPort.x);
			maxY = Math.max(maxY, worldPort.y);
		}
	}

	const loopCenter: Vec2 = { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
	const offset: Vec2 = {
		x: desiredCenter.x - loopCenter.x,
		y: desiredCenter.y - loopCenter.y
	};

	const circlePieces = rawCirclePieces.map((piece) => ({
		...piece,
		position: addVec2(piece.position, offset)
	}));

	// Add some test pieces for comparison
	const testPieces: PlacedPiece[] = [
		{
			id: 's1',
			definition: shortStraight,
			position: { x: 50, y: 50 },
			rotation: 0,
			connections: new Map()
		},
		{
			id: 's2',
			definition: shortStraight,
			position: { x: 120, y: 50 },
			rotation: 45,
			connections: new Map()
		}
	];
</script>

<div class="container mx-auto p-8">
	<h1 class="mb-4 text-3xl font-bold">TrackPlanner - Feature 3 Demo</h1>

	<div class="mb-4 space-y-1 rounded bg-blue-50 p-3 text-sm">
		<p class="mb-2 font-semibold">Track pieces are shown as centerlines (not full width):</p>
		<p><strong>Short Straight:</strong> 54mm long rectangle (108px at 2px/mm scale)</p>
		<p><strong>45° Curve:</strong> 143mm radius arc (286px radius)</p>
		<p class="mt-2">Port indicators (dots at track ends):</p>
		<p class="ml-4">
			<span class="inline-block h-3 w-3 rounded-full bg-[#d97706]"></span> Open port (amber)
		</p>
		<p class="ml-4">
			<span class="inline-block h-3 w-3 rounded-full bg-[#22c55e]"></span> Connected port (green)
		</p>
	</div>

	<svg
		width="1200"
		height="1200"
		style="border: 2px solid #ccc;"
		class="bg-gray-50"
		viewBox="0 0 1200 1200"
	>
		<!-- Grid background -->
		<defs>
			<pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
				<path d="M 100 0 L 0 0 0 100" fill="none" stroke="#e5e7eb" stroke-width="1" />
			</pattern>
		</defs>
		<rect width="1200" height="1200" fill="url(#grid)" />

		<!-- Center point marker -->
		<circle cx="600" cy="600" r="5" fill="red" />
		<text x="610" y="605" font-size="12" fill="#666">Center</text>

		<!-- Labels -->
		<text x="10" y="30" font-size="14" font-weight="bold" fill="#666">
			Full Circle Test (8 × 45° curves)
		</text>
		<text x="10" y="50" font-size="12" fill="#666"
			>If geometry is correct, pieces should form a perfect loop</text
		>

		<!-- Render test pieces -->
		{#each testPieces as piece}
			<TrackPiece {piece} />
		{/each}

		<!-- Render circle pieces -->
		{#each circlePieces as piece}
			<TrackPiece {piece} />
		{/each}
	</svg>
</div>
