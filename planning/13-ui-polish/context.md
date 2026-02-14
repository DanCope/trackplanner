# Feature 13: UI Polish & Quick Wins

## Purpose

A collection of small, high-value improvements that make the tool more pleasant to use. Each is independently valuable and can be implemented in any order.

## Dependencies

- **F9 (Canvas Viewport)** — "Center on Layout" requires viewport control
- All others are independent of V1.0 features

## Items

### 13.1: Clear All Button

Add a "Clear All" button to the toolbar that removes all pieces from the layout. Should prompt for confirmation if there are pieces (a simple `confirm()` dialog is fine).

**Files:** `src/lib/components/Toolbar.svelte`, `src/lib/stores/layout.svelte.ts`
**Complexity:** Very Low

### 13.2: Open Port Counter

Display the count of unconnected ports in the toolbar: e.g., "Open ports: 4". This helps users gauge whether their layout can close (a closed loop has 0 open ports).

**Implementation:** Derive from `layoutStore.pieces` — count ports where `!piece.connections.has(port.id)`.

**Files:** `src/lib/components/Toolbar.svelte`
**Complexity:** Very Low

### 13.3: Piece Usage Summary

Show a summary of pieces used by type: "4× Straight, 8× Curve, 1× Bridge". Useful for checking against physical inventory.

**Implementation:** Group `layoutStore.pieces` by `definition.type` and count.

**Files:** `src/lib/components/Toolbar.svelte` or a new `LayoutStats.svelte`
**Complexity:** Very Low

### 13.4: Keyboard Shortcuts Help Panel

A toggleable overlay showing all keyboard shortcuts. Triggered by `?` key or a help button.

Shortcuts to document:

- `R` — Rotate piece during drag
- `F` — Flip/cycle port during drag
- `Delete` / `Backspace` — Delete selected piece
- `Escape` — Deselect / cancel drag
- `+` / `-` — Zoom in/out (if F9 complete)
- `0` — Reset zoom (if F9 complete)
- `Ctrl+Z` — Undo (if F12 complete)
- `Ctrl+Y` — Redo (if F12 complete)

**Files:** New `src/lib/components/KeyboardHelp.svelte`, `src/routes/+page.svelte`
**Complexity:** Low

### 13.5: Center on Layout (Fit to Content)

A button that auto-zooms and pans to show all placed pieces. Calculates the bounding box of all pieces and adjusts the viewport to fit with padding.

Depends on F9 (`ViewportStore.fitToContent()`).

**Algorithm:**

1. Find min/max x/y of all piece positions (accounting for piece bounding boxes)
2. Calculate required zoom to fit all pieces within canvas with 10% padding
3. Set viewport offset and zoom

**Files:** `src/lib/stores/viewport.svelte.ts` (method), `src/lib/components/ZoomControls.svelte` (button)
**Complexity:** Low-Medium
