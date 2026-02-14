# Feature 9: Canvas Viewport (Zoom & Pan)

## Purpose

Enable users to zoom in/out and pan around the canvas, so layouts aren't limited to a fixed visible area. Essential for building larger layouts that extend beyond the initial viewport.

## Dependencies

- **F4 (Canvas)** ✅ — SVG canvas with viewBox
- **F5 (Drag & Snap)** ✅ — Coordinate transforms in drag flow

## Design Decisions

### Approach: SVG viewBox Manipulation

The SVG `viewBox` attribute controls what region of the SVG coordinate space is visible. By adjusting it, we get hardware-accelerated zoom/pan for free:

- **Zoom in** → Decrease viewBox width/height (show less area, things appear bigger)
- **Zoom out** → Increase viewBox width/height (show more area, things appear smaller)
- **Pan** → Change viewBox x/y offset (shift the visible region)

Current: `viewBox="0 0 1200 800"` (fixed)
After: `viewBox="${offsetX} ${offsetY} ${baseWidth / zoom} ${baseHeight / zoom}"`

### Zoom Controls

Three input methods:

1. **Scroll wheel** — Standard map-like zoom. Zoom toward cursor position.
2. **+/- buttons** — Overlay buttons in the bottom-right corner of the canvas
3. **Keyboard shortcuts** — `+`/`-` keys when canvas is focused, `0` to reset

Zoom range: **0.25× to 4×** (quarter view to 4× magnification)
Zoom steps: **×1.2 per scroll tick** (smooth, standard for map UIs)

### Pan Controls

1. **Middle-mouse drag** or **click-drag on empty canvas** — Standard map-like pan
2. **Two-finger drag** on trackpad (handled natively by scroll events)

**Critical UX decision:** Currently, clicking empty canvas deselects the selection. We need to distinguish between "click" (deselect) and "drag" (pan). Solution: Track mouse movement distance. If mouse moves more than 3px between mousedown and mouseup, it's a pan — don't deselect.

### Zoom-Toward-Cursor

When zooming with the scroll wheel, the point under the cursor should stay under the cursor (like Google Maps). This requires adjusting the offset when changing zoom:

```
newOffsetX = cursorWorldX - (cursorWorldX - oldOffsetX) * (oldZoom / newZoom)
newOffsetY = cursorWorldY - (cursorWorldY - oldOffsetY) * (oldZoom / newZoom)
```

### Coordinate Transform Impact

The existing `getWorldPositionFromEvent` functions use `svg.getScreenCTM()` which automatically accounts for viewBox changes. This means:

- ✅ Drag cursor position → world position: **works automatically**
- ✅ Snap calculations: **no changes needed** (already in world coordinates)
- ✅ Port indicators: **no changes needed** (SVG-space positions)
- ⚠️ DragPreview overlay: Needs to match the canvas viewBox (currently uses a fixed overlay SVG)

### ViewportStore

New reactive store to centralize viewport state:

```typescript
class ViewportStore {
  offsetX = $state(0);
  offsetY = $state(0);
  zoom = $state(1);
  isPanning = $state(false);

  // Methods
  zoomIn(cursorWorldPos?: Vec2): void;
  zoomOut(cursorWorldPos?: Vec2): void;
  resetZoom(): void;
  pan(deltaX: number, deltaY: number): void;
  startPan(): void;
  endPan(): void;
  fitToContent(pieces: PlacedPiece[]): void; // For "center on layout" in F13
}
```

## Affected Files

| File                                     | Action | Description                             |
| ---------------------------------------- | ------ | --------------------------------------- |
| `src/lib/stores/viewport.svelte.ts`      | Create | ViewportStore with zoom/pan state       |
| `src/lib/stores/viewport.test.ts`        | Create | Unit tests for viewport calculations    |
| `src/lib/components/Canvas.svelte`       | Modify | Dynamic viewBox, scroll/pan handlers    |
| `src/lib/components/DragPreview.svelte`  | Modify | Match canvas viewBox for overlay        |
| `src/lib/components/ZoomControls.svelte` | Create | +/- buttons and zoom level display      |
| `src/lib/components/PiecePanel.svelte`   | Modify | Account for viewBox in coord transform  |
| `src/lib/config.ts`                      | Modify | Add viewport config (zoom limits, step) |

## Acceptance Criteria

1. Scroll wheel zooms in/out, centered on cursor position
2. Zoom range limited to 0.25× – 4×
3. +/- buttons visible on canvas, zoom in/out on click
4. Clicking and dragging empty canvas pans the view
5. Short click on empty canvas still deselects (not treated as pan)
6. Drag-from-panel still works correctly at all zoom levels
7. Snap detection still works correctly at all zoom levels
8. DragPreview renders correctly at all zoom levels
9. Keyboard `+`/`-`/`0` work when canvas is focused
10. All existing tests continue to pass
11. Build succeeds with no errors
