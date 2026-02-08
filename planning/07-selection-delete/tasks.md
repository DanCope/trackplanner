# Feature 7 Tasks: Selection & Deletion

## Task 7.1: Create Toolbar Component

Button for deleting selected pieces.

**Steps:**

1. Create `src/lib/components/Toolbar.svelte`:

   ```svelte
   <script lang="ts">
   	import { selectionStore } from '$lib/stores/selection.svelte';
   	import { layoutStore } from '$lib/stores/layout.svelte';

   	function handleDelete() {
   		if (selectionStore.selectedPieceId) {
   			const piece = layoutStore.getPiece(selectionStore.selectedPieceId);
   			if (piece) {
   				// Clean up connections
   				const allPieces = layoutStore.pieces;
   				allPieces.forEach((p) => {
   					const portsToRemove: string[] = [];
   					p.connections.forEach((targetId, portId) => {
   						if (targetId.startsWith(selectionStore.selectedPieceId + ':')) {
   							portsToRemove.push(portId);
   						}
   					});
   					portsToRemove.forEach((portId) => p.connections.delete(portId));
   				});

   				layoutStore.removePiece(selectionStore.selectedPieceId);
   				selectionStore.deselect();
   			}
   		}
   	}
   </script>

   <div class="toolbar">
   	<button on:click={handleDelete} disabled={!selectionStore.selectedPieceId}>
   		Delete Selected
   	</button>
   	<span class="info">Pieces: {layoutStore.pieces.length}</span>
   </div>

   <style>
   	.toolbar {
   		display: flex;
   		gap: 1rem;
   		align-items: center;
   		padding: 1rem;
   		background: #f5f5f5;
   		border-bottom: 1px solid #ccc;
   	}

   	button {
   		padding: 0.5rem 1rem;
   		background: #ef4444;
   		color: white;
   		border: none;
   		border-radius: 4px;
   		cursor: pointer;
   	}

   	button:disabled {
   		background: #ccc;
   		cursor: not-allowed;
   	}

   	.info {
   		margin-left: auto;
   		font-size: 0.9rem;
   		color: #666;
   	}
   </style>
   ```

**Deliverable:**

- Toolbar with delete button

---

## Task 7.2: Wire Delete Keyboard Shortcut

Handle Delete and Backspace keys to remove selected piece.

**Steps:**

1. In main page, add:

   ```ts
   function handleKeyDown(e: KeyboardEvent) {
   	if ((e.key === 'Delete' || e.key === 'Backspace') && selectionStore.selectedPieceId) {
   		e.preventDefault();

   		const piece = layoutStore.getPiece(selectionStore.selectedPieceId);
   		if (piece) {
   			const allPieces = layoutStore.pieces;
   			allPieces.forEach((p) => {
   				const portsToRemove: string[] = [];
   				p.connections.forEach((targetId, portId) => {
   					if (targetId.startsWith(selectionStore.selectedPieceId! + ':')) {
   						portsToRemove.push(portId);
   					}
   				});
   				portsToRemove.forEach((portId) => p.connections.delete(portId));
   			});

   			layoutStore.removePiece(selectionStore.selectedPieceId);
   			selectionStore.deselect();
   		}
   	}
   }

   window.addEventListener('keydown', handleKeyDown);
   ```

2. Test: select piece, press Delete, piece is removed

**Deliverable:**

- Keyboard shortcut working

---

## Task 7.3: Enhance TrackPiece Selection Styling

Improve visual feedback for selected pieces.

**Steps:**

1. Update `src/lib/components/TrackPiece.svelte`:
   ```svelte
   {#if isSelected}
   	<rect
   		x="-30"
   		y="-30"
   		width="60"
   		height="60"
   		stroke="blue"
   		stroke-width="2"
   		fill="none"
   		stroke-dasharray="5,5"
   	/>
   	<circle cx="0" cy="0" r="35" stroke="blue" stroke-width="1" fill="none" opacity="0.5" />
   {/if}
   ```
2. Add CSS for glow effect if selected

**Deliverable:**

- Selection visually prominent

---

## Task 7.4: Wire Toolbar into Main Page

Add toolbar to page layout above canvas.

**Steps:**

1. Update `src/routes/+page.svelte`:

   ```svelte
   <script>
   	import Toolbar from '$lib/components/Toolbar.svelte';
   	import PiecePanel from '$lib/components/PiecePanel.svelte';
   	import Canvas from '$lib/components/Canvas.svelte';
   	import DragPreview from '$lib/components/DragPreview.svelte';
   </script>

   <Toolbar />

   <main>
   	<div class="layout">
   		<PiecePanel />
   		<div class="content">
   			<Canvas />
   			<DragPreview />
   		</div>
   	</div>
   </main>
   ```

**Deliverable:**

- Toolbar visible on page

---

## Task 7.5: Test Selection & Deletion

Verify full workflow.

**Steps:**

1. Place 3 pieces
2. Click one → verify selected with highlight
3. Click toolbar delete → piece removed, connections cleaned
4. Select another piece
5. Press Delete key → piece removed
6. Click empty canvas → deselect

**Deliverable:**

- Selection and deletion working end-to-end

---

## Task 7.6: Final MVP Verification

Complete the entire MVP.

**Steps:**

1. `pnpm check` — no TypeScript errors
2. `pnpm test:unit` — all tests pass
3. `pnpm build` — static build succeeds
4. Manual test flow:
   - Start: empty canvas
   - Drag straight from panel → place at cursor
   - Drag second straight → snap below first (should snap)
   - Drag curve 45° → rotate with R key → snap to end of straight
   - Rotate and place 8 curves to build oval
   - Verify all ports green (connected)
   - Select a piece and delete → connections update
   - Verify piece removal

**Deliverable:**

- MVP complete and fully functional
- Ready for deployment
