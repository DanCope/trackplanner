# Feature 6 Tasks: Piece Rotation (Pre-Placement)

## Task 6.1: Add Rotation Keyboard Handler

Listen for R key during drag to increment pre-rotation.

**Steps:**

1. In main page component, add:

   ```ts
   let handleKeyDown = (e: KeyboardEvent) => {
     if (e.key.toLowerCase() === "r" && dragStore.isActive) {
       e.preventDefault();
       dragStore.rotatePreview(1); // +45°
     }
   };

   window.addEventListener("keydown", handleKeyDown);

   onDestroy(() => {
     window.removeEventListener("keydown", handleKeyDown);
   });
   ```

2. Test: R key increments rotation during drag

**Deliverable:**

- R key rotation working

---

## Task 6.2: Update Snap Calculation

Ensure `computeSnapTransform` properly accounts for pre-rotation.

**Steps:**

1. Verify `src/lib/utils/snap.ts` already passes `preRotation` to calculation
2. Test: rotate piece 90°, drag to port, verify snap uses rotated port positions
3. Test all 8 rotation states with both piece types

**Deliverable:**

- Snap respects pre-rotation

---

## Task 6.3: Update DragPreview

Show rotated piece preview.

**Steps:**

1. Verify `DragPreview.svelte` uses `dragStore.snappedRotation ?? dragStore.preRotation`
2. Test: piece rotates as user presses R

**Deliverable:**

- Preview shows rotation

---

## Task 6.4: Document Rotation in UI

Add hint text in panel or on page.

**Steps:**

1. Update `PiecePanel.svelte` or main page with:
   > **Tip:** Press R while dragging to rotate the piece

**Deliverable:**

- Users know about rotation feature

---

## Task 6.5: Test All Rotation Combinations

Verify rotation works for all combinations.

**Steps:**

1. Write test scenario:
   - Place first straight (0° rotation, connects via S port)
   - Drag second straight, rotate 90° (E-W orientation), snap to S port of first
   - Verify final rotation is correct
2. Repeat for curve35 at multiple rotations
3. Verify 8 rotation states work with both piece types

**Deliverable:**

- Feature 6 complete, rotation system working
