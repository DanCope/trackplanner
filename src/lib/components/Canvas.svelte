<script lang="ts">
	import PortIndicator from '$lib/components/PortIndicator.svelte';
	import TrackPiece from '$lib/components/TrackPiece.svelte';
	import { PLARAIL_CONFIG, VIEWPORT_CONFIG } from '$lib/config';
	import { dragStore } from '$lib/stores/drag.svelte';
	import { layoutStore } from '$lib/stores/layout.svelte';
	import { selectionStore } from '$lib/stores/selection.svelte';
	import { viewportStore } from '$lib/stores/viewport.svelte';
	import type { PlacedPiece, Vec2 } from '$lib/types';
	import { connectPorts, findCoincidentConnections } from '$lib/utils/connections';
	import { rotateVec2 } from '$lib/utils/geometry';
	import { computeSnapTransform } from '$lib/utils/snap';

	const width = VIEWPORT_CONFIG.baseWidth;
	const height = VIEWPORT_CONFIG.baseHeight;
	const scale = PLARAIL_CONFIG.mmToPixels;
	const SNAP_DISTANCE = PLARAIL_CONFIG.snapRadius;

	let nextPieceId = $state(1);
	let availablePorts = $state<Set<string>>(new Set());
	let panStartScreen: Vec2 | null = $state(null);
	let didPan = $state(false);
	let svgElement: SVGSVGElement | null = $state(null);
	const PAN_THRESHOLD = VIEWPORT_CONFIG.panThreshold;

	const handleCanvasMouseDown = (event: MouseEvent): void => {
		// Only handle empty canvas clicks (not pieces)
		if (event.target === event.currentTarget && !dragStore.isActive) {
			panStartScreen = { x: event.clientX, y: event.clientY };
			didPan = false;
		}
	};

	const handleCanvasMouseMove = (event: MouseEvent): void => {
		if (panStartScreen && svgElement) {
			const dx = event.clientX - panStartScreen.x;
			const dy = event.clientY - panStartScreen.y;

			// Check if movement exceeds threshold
			if (Math.abs(dx) > PAN_THRESHOLD || Math.abs(dy) > PAN_THRESHOLD) {
				if (!didPan) {
					// Start panning
					viewportStore.startPan(panStartScreen);
					didPan = true;
				}

				// Update pan with current position
				viewportStore.updatePan({ x: event.clientX, y: event.clientY }, svgElement);
			}
		}
	};

	const handleCanvasMouseUp = (event: MouseEvent): void => {
		// Handle pan end
		if (panStartScreen) {
			if (didPan) {
				viewportStore.endPan();
			} else if (event.target === event.currentTarget) {
				// Short click without dragging - deselect
				selectionStore.deselect();
			}

			panStartScreen = null;
			didPan = false;
			return;
		}

		// Handle drag-and-drop from piece panel
		handlePieceDrop(event);
	};

	const handlePieceDrop = (event: MouseEvent): void => {
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

		// Determine piece ID: reuse for move-drag, generate new for placement
		const pieceId = dragStore.isMoveDrag ? dragStore.sourcePieceId! : `piece-${nextPieceId}`;

		// If snapped to a target, use snap position and create connection
		if (dragStore.snapTarget && dragStore.snappedPosition) {
			position = dragStore.snappedPosition;
			rotation = dragStore.snappedRotation;

			// Create connection between dragged piece and target
			const targetPiece = layoutStore.pieces.find((p) => p.id === dragStore.snapTarget!.pieceId);
			if (targetPiece) {
				const draggedPortId =
					dragStore.snappedPortId ?? dragStore.activePieceDefinition.ports[0].id;

				// Add connection on dragged piece
				connections.set(
					draggedPortId,
					`${dragStore.snapTarget.pieceId}:${dragStore.snapTarget.portId}`
				);

				// Add connection on target piece
				targetPiece.connections.set(dragStore.snapTarget.portId, `${pieceId}:${draggedPortId}`);
			}
		}

		// Create and add the piece
		const newPiece: PlacedPiece = {
			id: pieceId,
			definition: dragStore.activePieceDefinition,
			position,
			rotation,
			connections
		};

		layoutStore.addPiece(newPiece);

		// Only increment ID if this was a new piece (not a move)
		if (!dragStore.isMoveDrag) {
			nextPieceId++;
		}

		// Find and connect any coincident ports (loop closure)
		const coincidentMatches = findCoincidentConnections(newPiece, layoutStore.pieces, 0.5);
		for (const match of coincidentMatches) {
			const existingPiece = layoutStore.pieces.find((p) => p.id === match.existingPieceId);
			if (existingPiece) {
				connectPorts(newPiece, match.newPiecePortId, existingPiece, match.existingPortId);
			}
		}

		// End drag
		dragStore.endDrag();
	};

	const handleCanvasKeydown = (event: KeyboardEvent): void => {
		if (event.key === 'Delete' || event.key === 'Backspace') {
			if (selectionStore.selectedPieceId) {
				layoutStore.removePiece(selectionStore.selectedPieceId);
				selectionStore.deselect();
			}
		} else if (event.key === 'Escape') {
			selectionStore.deselect();
		}
	};

	const handleStartMove = (piece: PlacedPiece): void => {
		// Start move-drag in drag store (disconnects and saves state)
		dragStore.startMoveDrag(piece, layoutStore.pieces);

		// Temporarily remove piece from layout
		layoutStore.removePiece(piece.id);

		// Set up mousemove/mouseup listeners for drag tracking
		const handleMouseMove = (event: MouseEvent): void => {
			const worldPos = getWorldPositionFromEvent(event);
			if (worldPos) {
				dragStore.updateCursorPosition(worldPos);
			}
		};

		const handleMouseUp = (): void => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
			// Drop is handled by existing handleCanvasMouseUp
		};

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
	};

	const handleWheel = (event: WheelEvent): void => {
		event.preventDefault();

		const worldPos = getWorldPositionFromEvent(event as unknown as MouseEvent);
		if (!worldPos) {
			return;
		}

		const direction = event.deltaY < 0 ? 1 : -1; // Scroll up = zoom in
		viewportStore.zoomAtPoint(direction, worldPos, width, height);
	};

	const getWorldPositionFromEvent = (event: MouseEvent): { x: number; y: number } | null => {
		const svg = svgElement ?? (event.currentTarget as SVGSVGElement | null);
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

	// Monitor drag state and compute snap targets
	$effect(() => {
		if (!dragStore.isActive || !dragStore.activePieceDefinition) {
			availablePorts = new Set();
			return;
		}

		const cursorPos = dragStore.cursorPosition;
		let bestSnapTarget: { pieceId: string; portId: string } | null = null;
		let bestDraggedPortId: string | null = null;
		let bestSnapResult: { position: { x: number; y: number }; rotation: number } | null = null;
		let bestOriginDistance = Number.POSITIVE_INFINITY;
		const newAvailablePorts = new Set<string>();

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
				//Mark this port as available
				newAvailablePorts.add(`${targetPiece.id}:${targetPort.id}`);

				//

				// Check dragged ports: if user selected a specific port, only check that one
				const draggedPorts = dragStore.activePieceDefinition.ports;
				const portsToCheck =
					dragStore.selectedPortIndex !== null
						? [draggedPorts[dragStore.selectedPortIndex]]
						: draggedPorts;

				for (const draggedPort of portsToCheck) {
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

		availablePorts = newAvailablePorts;
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

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<svg
	bind:this={svgElement}
	id="track-canvas"
	viewBox={viewportStore.getViewBox(width, height)}
	class="h-full w-full rounded border border-gray-300 bg-white"
	role="img"
	aria-label="Track layout canvas"
	tabindex="0"
	onmousedown={handleCanvasMouseDown}
	onmousemove={handleCanvasMouseMove}
	onmouseup={handleCanvasMouseUp}
	onkeydown={handleCanvasKeydown}
	onwheel={handleWheel}
>
	{#each layoutStore.pieces as piece (piece.id)}
		<TrackPiece
			{piece}
			isSelected={selectionStore.isSelected(piece.id)}
			onSelect={() => selectionStore.select(piece.id)}
			onStartMove={() => handleStartMove(piece)}
		/>
	{/each}

	<!-- Port indicators -->
	{#each allPorts as portInfo}
		<PortIndicator
			position={{ x: portInfo.worldPos.x * scale, y: portInfo.worldPos.y * scale }}
			isConnected={portInfo.isConnected}
			isAvailable={availablePorts.has(`${portInfo.piece.id}:${portInfo.portId}`)}
		/>
	{/each}
</svg>
