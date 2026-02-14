# Feature 9 Tasks: Canvas Viewport (Zoom & Pan)

## 9.1: Create ViewportStore

**File:** `src/lib/stores/viewport.svelte.ts`

Create a reactive store managing zoom and pan state:

```typescript
import type { Vec2 } from '$lib/types';

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;
const ZOOM_STEP = 1.2; // Multiplier per scroll tick

export class ViewportStore {
  offsetX = $state(0);
  offsetY = $state(0);
  zoom = $state(1);
  isPanning = $state(false);
  panStartPos = $state<Vec2 | null>(null);
  panStartOffset = $state<Vec2 | null>(null);

  get viewBox(): string { /* computed viewBox string */ }

  zoomAtPoint(direction: 1 | -1, worldPos: Vec2, baseWidth: number, baseHeight: number): void;
  zoomIn(): void;
  zoomOut(): void;
  resetView(): void;
  pan(deltaX: number, deltaY: number): void;
  startPan(screenPos: Vec2): void;
  updatePan(screenPos: Vec2, svgElement: SVGSVGElement): void;
  endPan(): void;
  fitToContent(pieces: PlacedPiece[], baseWidth: number, baseHeight: number): void;
}
```

Key zoom-toward-cursor math:

```
newZoom = clamp(zoom * ZOOM_STEP^direction, MIN_ZOOM, MAX_ZOOM)
// Adjust offset so worldPos stays at same screen position
offsetX = worldPos.x - (worldPos.x - offsetX) * (zoom / newZoom)
offsetY = worldPos.y - (worldPos.y - offsetY) * (zoom / newZoom)
```

**Deliverable:** ViewportStore with zoom/pan state management.

---

## 9.2: Unit Test ViewportStore

**File:** `src/lib/stores/viewport.test.ts`

Test cases:

1. Initial state: zoom=1, offset=(0,0)
2. `zoomIn()` increases zoom by ZOOM_STEP, clamped at MAX_ZOOM
3. `zoomOut()` decreases zoom by ZOOM_STEP, clamped at MIN_ZOOM
4. `zoomAtPoint()` preserves the world point under cursor
5. `resetView()` returns to zoom=1, offset=(0,0)
6. `pan()` adjusts offsets correctly
7. `fitToContent()` calculates correct viewBox for a set of pieces

**Deliverable:** Comprehensive tests for viewport math.

---

## 9.3: Integrate ViewportStore into Canvas

**File:** `src/lib/components/Canvas.svelte`

Replace fixed viewBox with reactive one:

```svelte
<svg
  viewBox={viewportStore.viewBox}
  ...
>
```

Where `viewBox` is computed from the store:

```
`${viewportStore.offsetX} ${viewportStore.offsetY} ${baseWidth / viewportStore.zoom} ${baseHeight / viewportStore.zoom}`
```

The `baseWidth` and `baseHeight` remain 1200 and 800 (the initial viewport dimensions).

Key changes:

- Import `viewportStore`
- Replace hardcoded viewBox
- Note: `getWorldPositionFromEvent` already uses `svg.getScreenCTM()` which auto-adapts to viewBox changes — no change needed for coordinate transforms

**Deliverable:** Canvas viewBox is reactive and driven by store.

---

## 9.4: Add Scroll Wheel Zoom

**File:** `src/lib/components/Canvas.svelte`

Add a `wheel` event handler to the SVG element:

```typescript
const handleWheel = (event: WheelEvent): void => {
  event.preventDefault();
  const worldPos = getWorldPositionFromEvent(event);
  if (!worldPos) return;

  const direction = event.deltaY < 0 ? 1 : -1; // Scroll up = zoom in
  viewportStore.zoomAtPoint(direction, worldPos, baseWidth, baseHeight);
};
```

Add `onwheel={handleWheel}` to the SVG element. Use `{ passive: false }` to allow `preventDefault()`.

**Important:** Must prevent default to avoid page scroll when zooming over the canvas.

**Deliverable:** Scroll wheel zooms in/out centered on cursor.

---

## 9.5: Add Pan via Mouse Drag

**File:** `src/lib/components/Canvas.svelte`

Modify the existing `handleCanvasClick` area to support pan:

1. On `mousedown` on empty canvas:
   - Record start position
   - Set `isPanning` flag after mouse moves >3px (drag threshold)
2. On `mousemove` while panning:
   - Compute delta in world coordinates
   - Call `viewportStore.pan(deltaX, deltaY)`
3. On `mouseup`:
   - If we were panning, end pan (don't deselect)
   - If we didn't move enough (click), deselect as before

```typescript
let panStartScreen: Vec2 | null = null;
let didPan = false;
const PAN_THRESHOLD = 3; // pixels

const handleCanvasMouseDown = (event: MouseEvent): void => {
  if (event.target === event.currentTarget && !dragStore.isActive) {
    panStartScreen = { x: event.clientX, y: event.clientY };
    didPan = false;
  }
};

const handleCanvasMouseMove = (event: MouseEvent): void => {
  if (panStartScreen) {
    const dx = event.clientX - panStartScreen.x;
    const dy = event.clientY - panStartScreen.y;
    if (Math.abs(dx) > PAN_THRESHOLD || Math.abs(dy) > PAN_THRESHOLD) {
      didPan = true;
      // Convert screen delta to world delta and pan
    }
  }
};
```

**Critical:** Converting screen-space delta to world-space delta requires dividing by the current zoom and the screen-to-SVG scale ratio.

**Deliverable:** Click-drag on empty canvas pans the view. Short clicks still deselect.

---

## 9.6: Create ZoomControls Component

**File:** `src/lib/components/ZoomControls.svelte`

HTML overlay (not inside SVG) positioned at the bottom-right of the canvas container:

```svelte
<div class="absolute right-4 bottom-4 flex flex-col gap-1">
	<button onclick={zoomIn} aria-label="Zoom in">+</button>
	<span class="text-center text-xs">{Math.round(zoom * 100)}%</span>
	<button onclick={zoomOut} aria-label="Zoom out">−</button>
	<button onclick={resetView} aria-label="Reset view" class="mt-1 text-xs">Reset</button>
</div>
```

Style: rounded buttons with a semi-transparent background, similar to map controls.

**Deliverable:** Zoom buttons visible on canvas with current zoom level.

---

## 9.7: Update DragPreview for Dynamic ViewBox

**File:** `src/lib/components/DragPreview.svelte`

The DragPreview currently creates a fixed overlay SVG matching the canvas dimensions. With a dynamic viewBox, it needs to:

1. Read the current viewBox from `viewportStore` instead of from the canvas element
2. Match the overlay SVG's `viewBox` to the canvas SVG's `viewBox`

Update the `$effect` that reads `canvasSize`:

```typescript
$effect(() => {
  if (!dragStore.isActive) return;
  const canvas = document.getElementById('track-canvas');
  if (!canvas) return;

  canvasRect = canvas.getBoundingClientRect();
  // Use viewport store for viewBox instead of reading from DOM
  canvasViewBox = `${viewportStore.offsetX} ${viewportStore.offsetY} ${baseWidth / viewportStore.zoom} ${baseHeight / viewportStore.zoom}`;
});
```

**Deliverable:** Drag preview aligns correctly with canvas at all zoom/pan levels.

---

## 9.8: Add Keyboard Shortcuts & Final Verification

**File:** `src/routes/+page.svelte` or `src/lib/components/Canvas.svelte`

Add keyboard handlers when canvas is focused:

- `+` or `=` — Zoom in
- `-` — Zoom out
- `0` — Reset view

Add to the existing keydown handler, gated by canvas focus.

**Verification:**1. Scroll wheel zoom works at various zoom levels 2. Zoom preserves cursor world position (point stays under cursor) 3. Pan by dragging empty canvas works 4. Short click on empty canvas still deselects 5. Drag from panel works at zoom 0.5×, 1×, 2× 6. Snap detection works at all zoom levels 7. +/- buttons work 8. Keyboard shortcuts work 9. `pnpm test:unit` — all pass 10. `pnpm build` — succeeds

**Deliverable:** Complete zoom/pan feature, tested and verified.
