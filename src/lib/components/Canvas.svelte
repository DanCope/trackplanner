<script lang="ts">
	import PortIndicator from '$lib/components/PortIndicator.svelte';
	import TrackPiece from '$lib/components/TrackPiece.svelte';
	import { PLARAIL_CONFIG } from '$lib/config';
	import { dragStore } from '$lib/stores/drag.svelte';
	import { layoutStore } from '$lib/stores/layout.svelte';
	import { selectionStore } from '$lib/stores/selection.svelte';
	import type { PlacedPiece } from '$lib/types';
	import { rotateVec2 } from '$lib/utils/geometry';
	import { computeSnapTransform } from '$lib/utils/snap';

	const width = 1200;
	const height = 800;
	const scale = PLARAIL_CONFIG.mmToPixels;
	const SNAP_DISTANCE = PLARAIL_CONFIG.snapRadius;

	let nextPieceId = $state(1);

	const handleCanvasClick = (event: MouseEvent): void => {
		if (event.target === event.currentTarget) {
			selectionStore.deselect();
		}
	};

	const getWorldPositionFromEvent = (event: MouseEvent): { x: number; y: number } | null => {
		const svg = event.currentTarget as SVGSVGElement | null;
		if (!svg) {
			return null;
		}

		const ctm = svg.getScreenCTM();
		if (!ctm) {
			return null;
		}

		const pt = svg.createSVGPoint();
		pt.x = event.clientX;
		pt.y = event.clientY;
		const svgCoords = pt.matrixTransform(ctm.inverse());

		return {
			x: svgCoords.x / scale,
			y: svgCoords.y / scale
		};
	};

	const handleCanvasMouseUp = (event: MouseEvent): void => {
		if (!dragStore.isActive || !dragStore.activePieceDefinition) {
			return;
		}

		const worldPos = getWorldPositionFromEvent(event);
		if (!worldPos) {
			return;
		}

		let position = worldPos;
		let rotation = dragStore.preRotation;
		const connections = new Map<string, string>();

		// If snapped to a target, use snap position and create connection
		if (dragStore.snapTarget && dragStore.snappedPosition) {
			position = dragStore.snappedPosition;
			rotation = dragStore.snappedRotation;

			// Create connection between dragged piece and target
			const targetPiece = layoutStore.pieces.find((p) => p.id === dragStore.snapTarget!.pieceId);
			if (targetPiece) {
				const draggedPortId =
					dragStore.snappedPortId ?? dragStore.activePieceDefinition.ports[0].id;
				const newPieceId = `piece-${nextPieceId}`;

				// Add connection on dragged piece
				connections.set(
					draggedPortId,
					`${dragStore.snapTarget.pieceId}:${dragStore.snapTarget.portId}`
				);

				// Add connection on target piece
				targetPiece.connections.set(dragStore.snapTarget.portId, `${newPieceId}:${draggedPortId}`);
			}
		}

		// Create and add the new piece
		const newPiece: PlacedPiece = {
			id: `piece-${nextPieceId}`,
			definition: dragStore.activePieceDefinition,
			position,
			rotation,
			connections
		};

		layoutStore.addPiece(newPiece);
		nextPieceId++;

		// End drag
		dragStore.endDrag();
	};

	// Monitor drag state and compute snap targets
	$effect(() => {
		if (!dragStore.isActive || !dragStore.activePieceDefinition) {
			return;
		}

		const cursorPos = dragStore.cursorPosition;
		let bestSnapTarget: { pieceId: string; portId: string } | null = null;
		let bestDraggedPortId: string | null = null;
		let bestSnapResult: { position: { x: number; y: number }; rotation: number } | null = null;
		let bestOriginDistance = Number.POSITIVE_INFINITY;

		// Check all pieces for open ports within snap distance
		for (const targetPiece of layoutStore.pieces) {
			for (const targetPort of targetPiece.definition.ports) {
				// Skip if port is already connected
				if (targetPiece.connections.has(targetPort.id)) {
					continue;
				}

				// Compute world position of this port
				const rotatedPortPos = rotateVec2(
					targetPort.position,
					{ x: 0, y: 0 },
					targetPiece.rotation
				);
				const worldPortPos = {
					x: targetPiece.position.x + rotatedPortPos.x,
					y: targetPiece.position.y + rotatedPortPos.y
				};

				// Check distance from cursor
				const dx = worldPortPos.x - cursorPos.x;
				const dy = worldPortPos.y - cursorPos.y;
				const distance = Math.sqrt(dx * dx + dy * dy);

				if (distance > SNAP_DISTANCE) {
					continue;
				}

				// Check all dragged ports and choose the snap that lands closest to the cursor
				const draggedPorts = dragStore.activePieceDefinition.ports;
				for (const draggedPort of draggedPorts) {
					try {
						const snapResult = computeSnapTransform(
							dragStore.activePieceDefinition,
							draggedPort.id,
							targetPiece,
							targetPort.id,
							dragStore.preRotation
						);

						const originDistance = Math.hypot(
							snapResult.position.x - cursorPos.x,
							snapResult.position.y - cursorPos.y
						);

						if (originDistance < bestOriginDistance) {
							bestOriginDistance = originDistance;
							bestSnapTarget = {
								pieceId: targetPiece.id,
								portId: targetPort.id
							};
							bestDraggedPortId = draggedPort.id;
							bestSnapResult = snapResult;
						}
					} catch (error) {
						// Ignore invalid port combinations
					}
				}
			}
		}

		// Update drag store with snap info
		if (bestSnapTarget && bestSnapResult && bestDraggedPortId) {
			dragStore.setSnapTarget(bestSnapTarget.pieceId, bestSnapTarget.portId);
			dragStore.setSnappedTransform(
				bestSnapResult.position,
				bestSnapResult.rotation,
				bestDraggedPortId
			);
		} else {
			dragStore.setSnapTarget(null, null);
		}
	});

	// Render port indicators for all pieces
	function getAllPorts(): Array<{
		piece: PlacedPiece;
		portId: string;
		worldPos: { x: number; y: number };
		isConnected: boolean;
	}> {
		const ports = [];
		for (const piece of layoutStore.pieces) {
			for (const port of piece.definition.ports) {
				const rotatedPortPos = rotateVec2(port.position, { x: 0, y: 0 }, piece.rotation);
				const worldPos = {
					x: piece.position.x + rotatedPortPos.x,
					y: piece.position.y + rotatedPortPos.y
				};
				ports.push({
					piece,
					portId: port.id,
					worldPos,
					isConnected: piece.connections.has(port.id)
				});
			}
		}
		return ports;
	}

	const allPorts = $derived(getAllPorts());
</script>

<svg
	id="track-canvas"
	{width}
	{height}
	viewBox={`0 0 ${width} ${height}`}
	class="rounded border border-gray-300 bg-white"
	onclick={handleCanvasClick}
	onmouseup={handleCanvasMouseUp}
>
	{#each layoutStore.pieces as piece (piece.id)}
		<TrackPiece
			{piece}
			isSelected={selectionStore.isSelected(piece.id)}
			onSelect={() => selectionStore.select(piece.id)}
		/>
	{/each}

	<!-- Port indicators -->
	{#each allPorts as portInfo}
		<PortIndicator
			position={{ x: portInfo.worldPos.x * scale, y: portInfo.worldPos.y * scale }}
			isConnected={portInfo.isConnected}
			isAvailable={dragStore.snapTarget?.pieceId === portInfo.piece.id &&
				dragStore.snapTarget?.portId === portInfo.portId}
		/>
	{/each}
</svg>
