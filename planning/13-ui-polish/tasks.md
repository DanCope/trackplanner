# Feature 13 Tasks: UI Polish & Quick Wins

## 13.1: Clear All Button

**File:** `src/lib/components/Toolbar.svelte`

Add a "Clear All" button next to the delete button:

```svelte
<button
	onclick={handleClearAll}
	disabled={layoutStore.pieces.length === 0}
	aria-label="Clear all pieces"
>
	Clear All
</button>
```

Handler:

```typescript
function handleClearAll(): void {
  if (layoutStore.pieces.length === 0) return;
  if (!confirm('Remove all pieces from the layout?')) return;
  layoutStore.clearAll(); // Need to add this method
  selectionStore.deselect();
}
```

**File:** `src/lib/stores/layout.svelte.ts`

Add `clearAll()` method:

```typescript
clearAll(): void {
  this.pieces = [];
}
```

If undo/redo (F12) is implemented, wrap in a `ClearAllAction` that stores the previous pieces array.

**Deliverable:** Clear All button in toolbar with confirmation.

---

## 13.2: Open Port Counter

**File:** `src/lib/components/Toolbar.svelte`

Add a derived count of unconnected ports:

```typescript
const openPortCount = $derived(
  layoutStore.pieces.reduce((count, piece) => {
    return count + piece.definition.ports.filter(port => !piece.connections.has(port.id)).length;
  }, 0)
);
```

Display in the toolbar info area:

```svelte
<span>Open ports: {openPortCount}</span>
```

Consider color coding: green when 0 (layout is closed), amber otherwise.

**Deliverable:** Open port count visible in toolbar.

---

## 13.3: Piece Usage Summary

**File:** `src/lib/components/Toolbar.svelte` (or new `LayoutStats.svelte`)

Derive a summary from pieces:

```typescript
const pieceSummary = $derived(() => {
  const counts = new Map<string, number>();
  for (const piece of layoutStore.pieces) {
    const label = piece.definition.type;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([type, count]) => `${count}× ${type}`)
    .join(', ');
});
```

Display as: `"4× straight, 8× curve, 1× bridge"` or similar concise format.

**Deliverable:** Piece usage summary visible in toolbar/status area.

---

## 13.4: Keyboard Shortcuts Help Panel

**File:** `src/lib/components/KeyboardHelp.svelte`

Create a modal/overlay component:

```svelte
<script lang="ts">
	interface Props {
		isOpen: boolean;
		onClose: () => void;
	}
	let { isOpen, onClose }: Props = $props();
</script>

{#if isOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onclick={onClose}>
		<div class="rounded-lg bg-white p-6 shadow-xl" onclick|stopPropagation>
			<h2>Keyboard Shortcuts</h2>
			<table>
				<tr><td><kbd>R</kbd></td><td>Rotate piece during drag</td></tr>
				<tr><td><kbd>F</kbd></td><td>Cycle connection port</td></tr>
				<!-- etc. -->
			</table>
		</div>
	</div>
{/if}
```

**File:** `src/routes/+page.svelte`

Toggle on `?` key press:

```typescript
if (event.key === '?' || event.key === '/') {
  showKeyboardHelp = !showKeyboardHelp;
}
```

Add a small `?` button in the toolbar or top-right corner.

**Deliverable:** Keyboard help panel, toggleable with `?` key or button.

---

## 13.5: Center on Layout (Fit to Content)

**Prereq:** F9 (ViewportStore)

**File:** `src/lib/stores/viewport.svelte.ts`

Implement `fitToContent()`:

```typescript
fitToContent(pieces: PlacedPiece[], baseWidth: number, baseHeight: number): void {
  if (pieces.length === 0) {
    this.resetView();
    return;
  }

  // Calculate bounding box of all piece positions
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const piece of pieces) {
    // Account for piece extent (use a generous margin per piece)
    minX = Math.min(minX, piece.position.x - 150);
    maxX = Math.max(maxX, piece.position.x + 150);
    minY = Math.min(minY, piece.position.y - 150);
    maxY = Math.max(maxY, piece.position.y + 150);
  }

  const contentWidth = maxX - minX;
  const contentHeight = maxY - minY;
  const padding = 1.1; // 10% margin

  const zoomX = baseWidth / (contentWidth * padding);
  const zoomY = baseHeight / (contentHeight * padding);
  this.zoom = Math.min(zoomX, zoomY, MAX_ZOOM);

  // Center the content
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  this.offsetX = centerX - (baseWidth / this.zoom) / 2;
  this.offsetY = centerY - (baseHeight / this.zoom) / 2;
}
```

**File:** `src/lib/components/ZoomControls.svelte`

Add a "Fit" button:

```svelte
<button onclick={() => viewportStore.fitToContent(layoutStore.pieces, 1200, 800)}> Fit </button>
```

**Deliverable:** "Fit to content" button auto-zooms to show all pieces.

---

## Final Verification

1. Clear All: removes all pieces after confirmation
2. Open port counter: shows 0 for closed loops, correct count otherwise
3. Piece summary: accurate counts per type
4. Keyboard help: toggles with `?`, shows all shortcuts
5. Center on layout: auto-fits viewport to content
6. `pnpm test:unit` — all pass
7. `pnpm build` — succeeds
