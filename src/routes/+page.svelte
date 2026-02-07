<script lang="ts">
	import Canvas from '$lib/components/Canvas.svelte';
	import { curve45, shortStraight } from '$lib/pieces';
	import { layoutStore } from '$lib/stores/layout.svelte';
	import type { PlacedPiece, Vec2 } from '$lib/types';
	import { addVec2, directionToAngle, rotateVec2Simple } from '$lib/utils/geometry';

	// Generate test pieces: circle of 8 curves centered in the canvas
	const desiredCenter: Vec2 = { x: 300, y: 200 }; // mm (600px, 400px at 2px/mm scale)
	const portA = curve45.ports.find((port) => port.id === 'A');
	const portB = curve45.ports.find((port) => port.id === 'B');

	if (!portA || !portB) {
		throw new Error('Curve definition missing ports A or B');
	}

	// Build a loop by chaining pieces using port geometry
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
		const nextRotation =
			(((portBWorldAngle - directionToAngle(portA.direction)) % 360) + 360) % 360;

		currentPosition = portBWorld;
		currentRotation = nextRotation;
	}

	// Center the loop
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

	// Add centered circle pieces to the store
	rawCirclePieces.forEach((piece) => {
		layoutStore.addPiece({
			...piece,
			position: addVec2(piece.position, offset)
		});
	});

	// Add a few test straight pieces
	layoutStore.addPiece({
		id: 's1',
		definition: shortStraight,
		position: { x: 50, y: 50 },
		rotation: 0,
		connections: new Map()
	});

	layoutStore.addPiece({
		id: 's2',
		definition: shortStraight,
		position: { x: 120, y: 50 },
		rotation: 45,
		connections: new Map()
	});
</script>

<main class="mx-auto max-w-6xl p-8">
	<h1 class="mb-3 text-3xl font-bold">TrackPlanner</h1>
	<p class="mb-2 text-sm text-gray-600">
		Click a piece to select it. Click empty canvas to clear selection.
	</p>
	<p class="mb-6 text-xs text-gray-500">
		Test pieces loaded: 8 × 45° curves (forming a circle) + 2 × straight pieces
	</p>
	<Canvas />
</main>
