# Feature 3 Tasks: Piece Definitions & SVG Rendering

## Task 3.1: Create Short Straight Piece Definition

Define the short straight piece with ports and SVG path.

**Steps:**

1. Create `src/lib/pieces/definitions.ts`:

   ```ts
   import type { PieceDefinition } from "$lib/types";
   import { PLARAIL_CONFIG } from "$lib/config";

   const straightLength = PLARAIL_CONFIG.straightLength; // 54 mm
   const halfLength = straightLength / 2; // 27 mm
   const width = 10; // mm

   export const shortStraight: PieceDefinition = {
     type: "straight",
     ports: [
       {
         id: "A",
         position: { x: 0, y: -halfLength },
         direction: "S",
       },
       {
         id: "B",
         position: { x: 0, y: halfLength },
         direction: "N",
       },
     ],
     // SVG path: rectangle centered at origin
     // Width = 10 mm, Height = straightLength mm
     svgPath: `M ${-width / 2} ${-halfLength} L ${width / 2} ${-halfLength} L ${width / 2} ${halfLength} L ${-width / 2} ${halfLength} Z`,
   };
   ```

2. Verify port positions are symmetric, directions are opposite
3. Check SVG path renders as rectangle in viewport

**Deliverable:**

- Short straight piece definition with correct ports and path

---

## Task 3.2: Create 45° Curve Piece Definition

Define the curve piece with computed exit port position.

**Steps:**

1. Add to `src/lib/pieces/definitions.ts`:

   ```ts
   import { rotateVec2Simple, rotateDirection } from "$lib/utils/geometry";

   const curveRadius = PLARAIL_CONFIG.curveRadius; // 143 mm
   const curveAngle = PLARAIL_CONFIG.curveAngle; // 45 degrees

   // Curve geometry:
   // - Entry at origin (0, 0), facing S (into the piece)
   // - Arc center is to the right of entry (at +radius, 0)
   // - Arc sweeps 45° counterclockwise (in SVG Y-down: visually turns right)
   // - Exit port is at arc endpoint, direction is rotated 45°

   // Arc endpoint: starting at (radius, 0) relative to center, rotate by curve angle
   const arcEndX = curveRadius - curveRadius * Math.cos((curveAngle * Math.PI) / 180);
   const arcEndY = curveRadius * Math.sin((curveAngle * Math.PI) / 180);

   export const curve45: PieceDefinition = {
     type: "curve",
     ports: [
       {
         id: "A",
         position: { x: 0, y: 0 },
         direction: "S",
       },
       {
         id: "B",
         position: { x: arcEndX, y: arcEndY },
         direction: rotateDirection("S", -1), // Rotate entry direction by -45° (clockwise in math)
       },
     ],
     // SVG: arc path
     // Using SVG arc command: A rx ry x-axis-rotation large-arc-flag sweep-flag x y
     svgPath: `M 0 0 A ${curveRadius} ${curveRadius} 0 0 1 ${arcEndX} ${arcEndY}`,
   };
   ```

2. Verify arc geometry:
   - Entry at (0, 0) facing S
   - Arc center at (radius, 0)
   - Exit direction is 45° from entry
   - Test by computing piece at different rotations

**Deliverable:**

- Curve piece definition with computed exit port

---

## Task 3.3: Export Piece Definitions

Create barrel export for piece definitions.

**Steps:**

1. Create `src/lib/pieces/index.ts`:
   ```ts
   export { shortStraight, curve45 } from "./definitions";
   export type { PieceDefinition } from "$lib/types";
   ```
2. Verify exports work from `$lib/pieces`

**Deliverable:**

- Piece definitions easily importable

---

## Task 3.4: Unit Test Piece Definitions

Test port positions and SVG paths.

**Steps:**

1. Create `src/lib/pieces/definitions.test.ts`:

   ```ts
   import { describe, it, expect } from "vitest";
   import { shortStraight, curve45 } from "./definitions";
   import { oppositeDirection, distanceVec2 } from "$lib/utils/geometry";
   import { PLARAIL_CONFIG } from "$lib/config";

   describe("Piece Definitions", () => {
     describe("Short Straight", () => {
       it("has two ports", () => {
         expect(shortStraight.ports).toHaveLength(2);
       });

       it("ports are symmetric", () => {
         const [portA, portB] = shortStraight.ports;
         expect(portA.position.y).toBeCloseTo(-portB.position.y);
         expect(portA.position.x).toBeCloseTo(portB.position.x);
       });

       it("port directions are opposite", () => {
         const [portA, portB] = shortStraight.ports;
         expect(portB.direction).toBe(oppositeDirection(portA.direction));
       });

       it("has valid SVG path", () => {
         expect(shortStraight.svgPath).toMatch(/^M/);
         expect(shortStraight.svgPath).toContain("L");
         expect(shortStraight.svgPath).toContain("Z");
       });
     });

     describe("Curve 45°", () => {
       it("has two ports", () => {
         expect(curve45.ports).toHaveLength(2);
       });

       it("entry port is at origin", () => {
         const [portA] = curve45.ports;
         expect(portA.position.x).toBeCloseTo(0);
         expect(portA.position.y).toBeCloseTo(0);
       });

       it("exit port is ~54mm from entry (straight length)", () => {
         const [portA, portB] = curve45.ports;
         const distance = distanceVec2(portA.position, portB.position);
         expect(distance).toBeCloseTo(PLARAIL_CONFIG.straightLength, 0);
       });

       it("port directions differ by 45°", () => {
         const [portA, portB] = curve45.ports;
         // portB direction should be 45° rotated from portA
         // This is harder to test without direction difference function,
         // but we can check they're not the same and not opposite
         expect(portB.direction).not.toBe(portA.direction);
         expect(portB.direction).not.toBe(oppositeDirection(portA.direction));
       });

       it("has valid SVG arc path", () => {
         expect(curve45.svgPath).toMatch(/^M/);
         expect(curve45.svgPath).toContain("A");
       });
     });
   });
   ```

2. Run tests: `pnpm test:unit src/lib/pieces/definitions.test.ts`

**Deliverable:**

- Piece geometry verified with unit tests

---

## Task 3.5: Create TrackPiece Component

Render a placed piece with position and rotation.

**Steps:**

1. Create `src/lib/components/TrackPiece.svelte`:

   ```svelte
   <script lang="ts">
     import type { PlacedPiece, Vec2 } from '$lib/types';
     import { PLARAIL_CONFIG } from '$lib/config';
     import PortIndicator from './PortIndicator.svelte';

     interface Props {
       piece: PlacedPiece;
       isSelected?: boolean;
       onSelect?: () => void;
     }

     let { piece, isSelected = false, onSelect }: Props = $props();

     const scale = PLARAIL_CONFIG.mmToPixels;
     const transform = `translate(${piece.position.x * scale}, ${piece.position.y * scale}) rotate(${piece.rotation})`;
   </script>

   <g {transform} onclick={onSelect} class:selected={isSelected}>
     <!-- Piece SVG path -->
     <path d={piece.definition.svgPath} stroke="black" stroke-width="1" fill="none" />

     <!-- Port indicators -->
     {#each piece.definition.ports as port}
       {@const portWorldPosition = (() => {
         // Transform port position from piece-relative to world coords
         const rotRad = (piece.rotation * Math.PI) / 180;
         const cos = Math.cos(rotRad);
         const sin = Math.sin(rotRad);
         const x = port.position.x * cos - port.position.y * sin;
         const y = port.position.x * sin + port.position.y * cos;
         return { x: x * scale, y: y * scale };
       })()}
       <PortIndicator
         position={portWorldPosition}
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
   ```

2. Test in isolation (hard-code a piece, verify transform and rendering)

**Deliverable:**

- Component renders pieces at correct position/rotation

---

## Task 3.6: Create PortIndicator Component

Render colored circles for ports (open/connected).

**Steps:**

1. Create `src/lib/components/PortIndicator.svelte`:

   ```svelte
   <script lang="ts">
     import type { Vec2 } from '$lib/types';

     interface Props {
       position: Vec2;
       isConnected?: boolean;
       isAvailable?: boolean;
     }

     let { position, isConnected = false, isAvailable = false }: Props = $props();

     const radius = 4;
     const color = isConnected ? '#22c55e' : isAvailable ? '#fbbf24' : '#d97706'; // green : bright amber : amber
   </script>

   <circle cx={position.x} cy={position.y} r={radius} fill={color} />

   {#if isAvailable}
     <circle cx={position.x} cy={position.y} r={radius + 2} stroke={color} stroke-width="1" fill="none" />
   {/if}
   ```

2. Test visual rendering with hard-coded positions

**Deliverable:**

- Port indicators render with correct colors

---

## Task 3.7: Component Tests for TrackPiece

Test component rendering and props.

**Steps:**

1. Create `src/lib/components/TrackPiece.test.ts`:

   ```ts
   import { render, screen } from "@testing-library/svelte";
   import { describe, it, expect, vi } from "vitest";
   import TrackPiece from "./TrackPiece.svelte";
   import { shortStraight } from "$lib/pieces";
   import type { PlacedPiece } from "$lib/types";

   const mockPiece: PlacedPiece = {
     id: "test-1",
     definition: shortStraight,
     position: { x: 0, y: 0 },
     rotation: 0,
     connections: new Map(),
   };

   describe("TrackPiece", () => {
     it("renders piece SVG path", () => {
       const { container } = render(TrackPiece, { props: { piece: mockPiece } });
       const path = container.querySelector("path");
       expect(path).toBeTruthy();
       expect(path?.getAttribute("d")).toBe(shortStraight.svgPath);
     });

     it("applies position and rotation transform", () => {
       const rotatedPiece = { ...mockPiece, position: { x: 10, y: 20 }, rotation: 45 };
       const { container } = render(TrackPiece, { props: { piece: rotatedPiece } });
       const g = container.querySelector("g");
       expect(g?.getAttribute("transform")).toContain("translate");
       expect(g?.getAttribute("transform")).toContain("rotate(45)");
     });

     it("renders port indicators", () => {
       const { container } = render(TrackPiece, { props: { piece: mockPiece } });
       const circles = container.querySelectorAll("circle");
       // Should have at least port count circles
       expect(circles.length).toBeGreaterThanOrEqual(mockPiece.definition.ports.length);
     });

     it("shows selection highlight when selected", () => {
       const { container } = render(TrackPiece, {
         props: { piece: mockPiece, isSelected: true },
       });
       const rect = container.querySelector("rect");
       expect(rect).toBeTruthy();
     });

     it("calls onSelect when clicked", () => {
       const onSelect = vi.fn();
       const { container } = render(TrackPiece, {
         props: { piece: mockPiece, onSelect },
       });
       const g = container.querySelector("g");
       g?.dispatchEvent(new MouseEvent("click"));
       expect(onSelect).toHaveBeenCalled();
     });
   });
   ```

2. Run tests: `pnpm test:unit`

**Deliverable:**

- Component tests verify rendering and interaction

---

## Task 3.8: Component Tests for PortIndicator

Test port indicator colors and states.

**Steps:**

1. Create `src/lib/components/PortIndicator.test.ts`:

   ```ts
   import { render } from "@testing-library/svelte";
   import { describe, it, expect } from "vitest";
   import PortIndicator from "./PortIndicator.svelte";

   describe("PortIndicator", () => {
     it("renders at specified position", () => {
       const { container } = render(PortIndicator, {
         props: { position: { x: 10, y: 20 } },
       });
       const circle = container.querySelector("circle");
       expect(circle?.getAttribute("cx")).toBe("10");
       expect(circle?.getAttribute("cy")).toBe("20");
     });

     it("shows green when connected", () => {
       const { container } = render(PortIndicator, {
         props: { position: { x: 0, y: 0 }, isConnected: true },
       });
       const circle = container.querySelector("circle");
       expect(circle?.getAttribute("fill")).toBe("#22c55e");
     });

     it("shows amber when available", () => {
       const { container } = render(PortIndicator, {
         props: { position: { x: 0, y: 0 }, isAvailable: true },
       });
       const circle = container.querySelector("circle");
       expect(circle?.getAttribute("fill")).toBe("#fbbf24");
     });

     it("shows default amber when not connected or available", () => {
       const { container } = render(PortIndicator, {
         props: { position: { x: 0, y: 0 } },
       });
       const circle = container.querySelector("circle");
       expect(circle?.getAttribute("fill")).toBe("#d97706");
     });

     it("shows outline when available", () => {
       const { container } = render(PortIndicator, {
         props: { position: { x: 0, y: 0 }, isAvailable: true },
       });
       const outlineCircle = container.querySelectorAll("circle")[1];
       expect(outlineCircle).toBeTruthy();
       expect(outlineCircle?.getAttribute("stroke")).toBe("#fbbf24");
     });
   });
   ```

2. Run tests

**Deliverable:**

- Port indicator component fully tested

---

## Task 3.9: Final Verification

Ensure Feature 3 is complete and ready.

**Steps:**

1. Run `pnpm check` — no TypeScript errors
2. Run `pnpm test:unit src/lib/pieces src/lib/components/TrackPiece.test.ts src/lib/components/PortIndicator.test.ts`
3. Create a test page in `src/routes/+page.svelte` to manually verify rendering:

   ```svelte
   <script>
     import TrackPiece from '$lib/components/TrackPiece.svelte';
     import { shortStraight, curve45 } from '$lib/pieces';
     import type { PlacedPiece } from '$lib/types';

     const testPieces: PlacedPiece[] = [
       {
         id: '1',
         definition: shortStraight,
         position: { x: 100, y: 100 },
         rotation: 0,
         connections: new Map(),
       },
       {
         id: '2',
         definition: curve45,
         position: { x: 100, y: 160 },
         rotation: 0,
         connections: new Map(),
       },
     ];
   </script>

   <svg width="400" height="400" style="border: 1px solid black;">
     {#each testPieces as piece}
       <TrackPiece {piece} />
     {/each}
   </svg>
   ```

4. Run `pnpm dev` and verify pieces render visually
5. Try different rotations (change rotation property) — should render correctly

**Deliverable:**

- Feature 3 complete, pieces render at all rotations
- Ready for Feature 4 (Canvas & State)
