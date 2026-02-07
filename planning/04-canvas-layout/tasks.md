# Feature 4 Tasks: Canvas & Layout State Management

## Task 4.1: Create Layout Store

Create reactive store for managing placed pieces.

**Steps:**

1. Create `src/lib/stores/layout.svelte.ts`:

   ```ts
   import { $state } from "svelte";
   import type { PlacedPiece, Port } from "$lib/types";

   class LayoutStore {
     pieces = $state<PlacedPiece[]>([]);

     addPiece(piece: PlacedPiece): void {
       this.pieces.push(piece);
     }

     removePiece(id: string): void {
       this.pieces = this.pieces.filter((p) => p.id !== id);
       // Also remove all connections to/from this piece
       this.pieces.forEach((p) => {
         const portsToRemove: string[] = [];
         p.connections.forEach((targetId, portId) => {
           if (targetId.startsWith(id + ":")) {
             portsToRemove.push(portId);
           }
         });
         portsToRemove.forEach((portId) => p.connections.delete(portId));
       });
     }

     updatePiece(id: string, updates: Partial<PlacedPiece>): void {
       const piece = this.pieces.find((p) => p.id === id);
       if (piece) {
         Object.assign(piece, updates);
       }
     }

     getPiece(id: string): PlacedPiece | undefined {
       return this.pieces.find((p) => p.id === id);
     }
   }

   export const layoutStore = new LayoutStore();
   ```

2. Test basic add/remove/update operations

**Deliverable:**

- Layout store with CRUD operations

---

## Task 4.2: Create Selection Store

Track which piece is currently selected.

**Steps:**

1. Create `src/lib/stores/selection.svelte.ts`:

   ```ts
   import { $state } from "svelte";

   class SelectionStore {
     selectedPieceId = $state<string | null>(null);

     select(id: string | null): void {
       this.selectedPieceId = id;
     }

     deselect(): void {
       this.selectedPieceId = null;
     }

     isSelected(id: string): boolean {
       return this.selectedPieceId === id;
     }
   }

   export const selectionStore = new SelectionStore();
   ```

**Deliverable:**

- Selection state management

---

## Task 4.3: Implement Connection Logic Utilities

Create utility functions for port matching and connection.

**Steps:**

1. Create `src/lib/utils/connections.ts`:

   ```ts
   import type { Vec2, Port, PlacedPiece } from "$lib/types";
   import { distanceVec2, oppositeDirection } from "./geometry";
   import { PLARAIL_CONFIG } from "$lib/config";

   /**
    * Find the nearest open port on any piece within snap radius
    */
   export function findSnapTarget(
     draggedPort: {
       worldPosition: Vec2;
       direction: string;
     },
     allPieces: PlacedPiece[],
     draggedPieceId: string,
     snapRadius: number = PLARAIL_CONFIG.snapRadius,
   ): { pieceId: string; port: Port; distance: number } | null {
     let closest: { pieceId: string; port: Port; distance: number } | null = null;

     for (const piece of allPieces) {
       if (piece.id === draggedPieceId) continue; // Can't connect to self

       for (const port of piece.definition.ports) {
         // Skip if this port is already connected
         if (piece.connections.has(port.id)) continue;

         // Skip if directions don't match
         if (port.direction !== draggedPort.direction) continue;

         // Compute world position of target port
         const rotRad = (piece.rotation * Math.PI) / 180;
         const cos = Math.cos(rotRad);
         const sin = Math.sin(rotRad);
         const relX = port.position.x * cos - port.position.y * sin;
         const relY = port.position.x * sin + port.position.y * cos;
         const worldPos = {
           x: piece.position.x + relX,
           y: piece.position.y + relY,
         };

         const distance = distanceVec2(draggedPort.worldPosition, worldPos);
         if (distance <= snapRadius) {
           if (!closest || distance < closest.distance) {
             closest = { pieceId: piece.id, port, distance };
           }
         }
       }
     }

     return closest;
   }

   /**
    * Create a bidirectional connection between two ports
    */
   export function connectPorts(pieceA: PlacedPiece, portAId: string, pieceB: PlacedPiece, portBId: string): void {
     pieceA.connections.set(portAId, `${pieceB.id}:${portBId}`);
     pieceB.connections.set(portBId, `${pieceA.id}:${portAId}`);
   }

   /**
    * Disconnect a port from its connected partner
    */
   export function disconnectPort(piece: PlacedPiece, portId: string, allPieces: PlacedPiece[]): void {
     const connectedId = piece.connections.get(portId);
     if (!connectedId) return;

     const [connectedPieceId, connectedPortId] = connectedId.split(":");
     const connectedPiece = allPieces.find((p) => p.id === connectedPieceId);

     piece.connections.delete(portId);
     if (connectedPiece) {
       connectedPiece.connections.delete(connectedPortId);
     }
   }

   /**
    * Disconnect all ports of a piece
    */
   export function disconnectPiece(piece: PlacedPiece, allPieces: PlacedPiece[]): void {
     const portIds = Array.from(piece.connections.keys());
     portIds.forEach((portId) => disconnectPort(piece, portId, allPieces));
   }
   ```

**Deliverable:**

- Connection utility functions ready for snap system

---

## Task 4.4: Unit Test Connection Logic

Test snap target finding and connection operations.

**Steps:**

1. Create `src/lib/utils/connections.test.ts` with tests for:
   - `findSnapTarget` with/without valid targets
   - `connectPorts` creates bidirectional connections
   - `disconnectPort` removes connections
   - `disconnectPiece` cleans up all connections

**Deliverable:**

- Connection logic fully tested

---

## Task 4.5: Create Canvas Component

SVG canvas that renders all pieces and handles selection.

**Steps:**

1. Create `src/lib/components/Canvas.svelte`:

   ```svelte
   <script lang="ts">
     import { layoutStore } from '$lib/stores/layout.svelte';
     import { selectionStore } from '$lib/stores/selection.svelte';
     import TrackPiece from './TrackPiece.svelte';

     const width = 600;
     const height = 400;
   </script>

   <svg {width} {height} style="border: 1px solid black; background: white;">
     {#each layoutStore.pieces as piece (piece.id)}
       <TrackPiece
         {piece}
         isSelected={selectionStore.isSelected(piece.id)}
         onSelect={() => selectionStore.select(piece.id)}
       />
     {/each}
   </svg>

   <script>
     // Click on empty canvas to deselect
     function handleCanvasClick(e: MouseEvent) {
       if (e.target === e.currentTarget) {
         selectionStore.deselect();
       }
     }
   </script>

   <svelte:window on:click={handleCanvasClick} />
   ```

**Deliverable:**

- Canvas renders and handles selection

---

## Task 4.6: Test Canvas Component

Test rendering and interaction.

**Steps:**

1. Create `src/lib/components/Canvas.test.ts` with tests for:
   - Renders all pieces from store
   - Click on piece selects it
   - Click on empty canvas deselects

**Deliverable:**

- Canvas component tested

---

## Task 4.7: Update Home Page

Wire canvas into main page.

**Steps:**

1. Update `src/routes/+page.svelte`:

   ```svelte
   <script>
     import Canvas from '$lib/components/Canvas.svelte';
   </script>

   <main>
     <h1>TrackPlanner</h1>
     <Canvas />
   </main>

   <style>
     main {
       padding: 1rem;
     }
   </style>
   ```

**Deliverable:**

- Canvas visible on home page

---

## Task 4.8: Final Verification

Ensure Feature 4 is complete.

**Steps:**

1. `pnpm check` passes
2. `pnpm test:unit` passes for all store and component tests
3. `pnpm dev` and manually add pieces to layout store (hard-code in console) and verify canvas renders
4. Click pieces and verify selection changes

**Deliverable:**

- Feature 4 complete, ready for drag/snap (Feature 5)
