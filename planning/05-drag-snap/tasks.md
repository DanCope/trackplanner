# Feature 5 Tasks: Drag & Snap

## Task 5.1: Create Drag State Store

Track active drag operation and preview state.

**Steps:**

1. Create `src/lib/stores/drag.svelte.ts`:

   ```ts
   import { $state } from 'svelte';
   import type { PieceDefinition, Vec2 } from '$lib/types';

   class DragStore {
   	isActive = $state(false);
   	activePieceDefinition = $state<PieceDefinition | null>(null);
   	cursorPosition = $state<Vec2>({ x: 0, y: 0 });
   	preRotation = $state(0); // User-applied rotation (45° steps)
   	snapTarget = $state<{ pieceId: string; portId: string } | null>(null);
   	snappedPosition = $state<Vec2 | null>(null);
   	snappedRotation = $state(0);

   	startDrag(definition: PieceDefinition): void {
   		this.isActive = true;
   		this.activePieceDefinition = definition;
   		this.preRotation = 0;
   		this.snapTarget = null;
   	}

   	updateCursorPosition(pos: Vec2): void {
   		this.cursorPosition = pos;
   	}

   	rotatePreview(steps: number): void {
   		this.preRotation = (this.preRotation + steps * 45 + 360) % 360;
   	}

   	setSnapTarget(pieceId: string | null, portId: string | null): void {
   		if (pieceId && portId) {
   			this.snapTarget = { pieceId, portId };
   		} else {
   			this.snapTarget = null;
   		}
   	}

   	setSnappedTransform(pos: Vec2, rotation: number): void {
   		this.snappedPosition = pos;
   		this.snappedRotation = rotation;
   	}

   	endDrag(): void {
   		this.isActive = false;
   		this.activePieceDefinition = null;
   		this.preRotation = 0;
   		this.snapTarget = null;
   	}
   }

   export const dragStore = new DragStore();
   ```

**Deliverable:**

- Drag state management ready

---

## Task 5.2: Implement Snap Calculation

Create utility to compute snapped position/rotation.

**Steps:**

1. Create `src/lib/utils/snap.ts`:

   ```ts
   import type { Vec2, PlacedPiece, PieceDefinition } from '$lib/types';
   import { rotateVec2, directionToAngle, rotateDirection, oppositeDirection } from './geometry';
   import { PLARAIL_CONFIG } from '$lib/config';

   export interface SnapResult {
   	position: Vec2;
   	rotation: number;
   }

   /**
    * Compute the position and rotation needed to snap draggedPiece's port
    * to a target port on a placed piece
    */
   export function computeSnapTransform(
   	draggedDefinition: PieceDefinition,
   	draggedPortId: string,
   	targetPiece: PlacedPiece,
   	targetPortId: string,
   	preRotation: number
   ): SnapResult {
   	// Get port definitions
   	const draggedPort = draggedDefinition.ports.find((p) => p.id === draggedPortId);
   	const targetPort = targetPiece.definition.ports.find((p) => p.id === targetPortId);

   	if (!draggedPort || !targetPort) {
   		throw new Error('Port not found');
   	}

   	// Compute target port world position
   	const targetAngleRad = (targetPiece.rotation * Math.PI) / 180;
   	const cos = Math.cos(targetAngleRad);
   	const sin = Math.sin(targetAngleRad);
   	const relX = targetPort.position.x * cos - targetPort.position.y * sin;
   	const relY = targetPort.position.x * sin + targetPort.position.y * cos;
   	const targetWorldPos = {
   		x: targetPiece.position.x + relX,
   		y: targetPiece.position.y + relY
   	};

   	// Determine rotation to connect ports
   	// Target's port faces outward in its direction
   	// Dragged piece's port must face opposite direction to align
   	const requiredDirection = oppositeDirection(targetPort.direction);
   	const currentDragDirection = rotateDirection(draggedPort.direction, preRotation / 45);
   	const directionDiff =
   		directionToAngle(requiredDirection) - directionToAngle(currentDragDirection);
   	const snapRotation = (Math.round(directionDiff / 45) * 45 + 360) % 360;
   	const finalRotation = (preRotation + snapRotation) % 360;

   	// Compute position: dragged piece should be positioned so its port aligns with target
   	// Rotate dragged port position by final rotation to get absolute displacement
   	const rotatedDragPort = rotateVec2(draggedPort.position, { x: 0, y: 0 }, finalRotation);

   	// Position of dragged piece origin = target port position - rotated dragged port position
   	const snappedPos = {
   		x: targetWorldPos.x - rotatedDragPort.x,
   		y: targetWorldPos.y - rotatedDragPort.y
   	};

   	return {
   		position: snappedPos,
   		rotation: finalRotation
   	};
   }
   ```

2. Unit test with multiple direction combinations

**Deliverable:**

- Snap math implemented

---

## Task 5.3: Unit Test Snap Logic

Test snap calculations for all 8 directions.

**Steps:**

1. Create `src/lib/utils/snap.test.ts` with tests:
   - Snapping with direction N, E, S, W
   - Snapping with pre-rotation
   - Verified port alignment after snap

**Deliverable:**

- Snap calculations verified

---

## Task 5.4: Create PiecePanel Component

Draggable palette of piece types.

**Steps:**

1. Create `src/lib/components/PiecePanel.svelte`:

   ```svelte
   <script lang="ts">
   	import { shortStraight, curve45 } from '$lib/pieces';
   	import { dragStore } from '$lib/stores/drag.svelte';

   	const pieces = [
   		{ name: 'Straight', definition: shortStraight },
   		{ name: 'Curve 45°', definition: curve45 }
   	];

   	function handleDragStart(definition: any) {
   		dragStore.startDrag(definition);
   		document.addEventListener('mousemove', handleMouseMove);
   		document.addEventListener('mouseup', handleMouseUp);
   	}

   	function handleMouseMove(e: MouseEvent) {
   		dragStore.updateCursorPosition({ x: e.clientX, y: e.clientY });
   	}

   	function handleMouseUp() {
   		dragStore.endDrag();
   		document.removeEventListener('mousemove', handleMouseMove);
   		document.removeEventListener('mouseup', handleMouseUp);
   	}
   </script>

   <div class="panel">
   	<h2>Pieces</h2>
   	{#each pieces as item}
   		<div
   			class="piece-item"
   			draggable="true"
   			on:dragstart={() => handleDragStart(item.definition)}
   			on:dragend={handleMouseUp}
   		>
   			{item.name}
   		</div>
   	{/each}
   </div>

   <style>
   	.panel {
   		width: 150px;
   		padding: 1rem;
   		background: #f5f5f5;
   		border-right: 1px solid #ccc;
   	}

   	.piece-item {
   		padding: 0.5rem;
   		margin: 0.5rem 0;
   		background: white;
   		border: 1px solid #ddd;
   		cursor: grab;
   		user-select: none;
   	}

   	.piece-item:active {
   		cursor: grabbing;
   	}
   </style>
   ```

**Deliverable:**

- Panel component with draggable items

---

## Task 5.5: Create DragPreview Component

Ghost piece following cursor during drag.

**Steps:**

1. Create `src/lib/components/DragPreview.svelte`:

   ```svelte
   <script lang="ts">
   	import { dragStore } from '$lib/stores/drag.svelte';
   	import TrackPiece from './TrackPiece.svelte';
   	import type { PlacedPiece } from '$lib/types';

   	function getDragPreviewPiece(): PlacedPiece | null {
   		if (!dragStore.isActive || !dragStore.activePieceDefinition) return null;

   		const pos = dragStore.snappedPosition || dragStore.cursorPosition;
   		const rotation = dragStore.snappedRotation ?? dragStore.preRotation;

   		return {
   			id: '__drag-preview__',
   			definition: dragStore.activePieceDefinition,
   			position: pos,
   			rotation,
   			connections: new Map()
   		};
   	}

   	const previewPiece = $derived(getDragPreviewPiece());
   </script>

   {#if previewPiece}
   	<svg style="position: absolute; pointer-events: none; z-index: 1000;">
   		<TrackPiece piece={previewPiece} />
   	</svg>
   {/if}
   ```

**Deliverable:**

- Drag preview displays

---

## Task 5.6: Integrate Snap Detection

Update canvas/drag to detect snap targets and position preview.

**Steps:**

1. In layout component, monitor drag state and compute snap targets
2. Call `computeSnapTransform` when snap target found
3. Update `dragStore.setSnappedTransform` with result
4. Highlight snappable ports in canvas

**Deliverable:**

- Preview snaps to valid targets

---

## Task 5.7: Handle Drop & Place Piece

On mouseup, place piece if valid location.

**Steps:**

1. Create handler for drop:
   - If snap target exists: place at snapped position with connections
   - If no snap but canvas clicked: place at cursor
   - If empty canvas: cancel drag
2. Generate unique piece ID (UUID or counter)
3. Add to layout store
4. Create port connection if snapped

**Deliverable:**

- Pieces placed on drop

---

## Task 5.8: Update Page Layout

Arrange panel + canvas side by side.

**Steps:**

1. Update `src/routes/+page.svelte`:

   ```svelte
   <script>
   	import PiecePanel from '$lib/components/PiecePanel.svelte';
   	import Canvas from '$lib/components/Canvas.svelte';
   	import DragPreview from '$lib/components/DragPreview.svelte';
   </script>

   <main>
   	<div class="layout">
   		<PiecePanel />
   		<div class="content">
   			<Canvas />
   			<DragPreview />
   		</div>
   	</div>
   </main>

   <style>
   	main {
   		height: 100vh;
   		display: flex;
   		flex-direction: column;
   	}

   	.layout {
   		display: flex;
   		flex-grow: 1;
   	}

   	.content {
   		flex-grow: 1;
   		position: relative;
   	}
   </style>
   ```

**Deliverable:**

- UI layout complete

---

## Task 5.9: Final Verification

Test full drag-to-snap workflow.

**Steps:**

1. `pnpm dev`
2. Drag piece from panel → observe preview follows cursor
3. Drag toward empty canvas → piece drops at cursor
4. Drag next piece close to first → snap target highlights
5. Release → pieces connect visually
6. Verify connections in store (hard-code console check)

**Deliverable:**

- Feature 5 (drag & snap) complete and working
