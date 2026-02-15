# MVP Implementation Checklist

Use this to track progress across all features.

## Feature 1: Project Scaffolding ✅

- [x] 1.1: Initialize SvelteKit Project
- [x] 1.2: Configure SvelteKit Static Adapter
- [x] 1.3: Set Up Environment Variables & Base Path
- [x] 1.4: Configure Tailwind CSS v4
- [x] 1.5: Configure TypeScript Strict Mode
- [x] 1.6: Set Up Vitest & Testing Library
- [x] 1.7: Set Up Playwright E2E Tests
- [x] 1.8: Create GitHub Actions Deployment Workflow
- [x] 1.9: Create Root Layout & Home Page
- [x] 1.10: Create Project Documentation
- [x] 1.11: Set Up .gitignore
- [x] 1.12: Final Verification

**Status:** ✅ Complete

---

## Feature 2: Data Model & Geometry Utilities ✅

- [x] 2.1: Define Geometry Types
- [x] 2.2: Define Piece Types
- [x] 2.3: Create Configuration File
- [x] 2.4: Implement Vector Utility Functions
- [x] 2.5: Implement Direction & Angle Functions
- [x] 2.6: Implement Vector Rotation
- [x] 2.7: Create Comprehensive Unit Tests
- [x] 2.8: Create Type Exports Barrel
- [x] 2.9: Document Configuration
- [x] 2.10: Final Verification

**Status:** ✅ Complete

---

## Feature 3: Piece Definitions & SVG Rendering ✅

- [x] 3.1: Create Short Straight Piece Definition
- [x] 3.2: Create 45° Curve Piece Definition
- [x] 3.3: Export Piece Definitions
- [x] 3.4: Unit Test Piece Definitions
- [x] 3.5: Create TrackPiece Component
- [x] 3.6: Create PortIndicator Component
- [x] 3.7: Component Tests for TrackPiece
- [x] 3.8: Component Tests for PortIndicator
- [x] 3.9: Final Verification

**Status:** ✅ Complete

---

## Feature 4: Canvas & Layout State Management ✅

- [x] 4.1: Create Layout Store
- [x] 4.2: Create Selection Store
- [x] 4.3: Implement Connection Logic Utilities
- [x] 4.4: Unit Test Connection Logic
- [x] 4.5: Create Canvas Component
- [x] 4.6: Test Canvas Component
- [x] 4.7: Update Home Page
- [x] 4.8: Final Verification

**Status:** ✅ Complete

---

## Feature 5: Drag & Snap ✅

- [x] 5.1: Create Drag State Store
- [x] 5.2: Implement Snap Calculation
- [x] 5.3: Unit Test Snap Logic
- [x] 5.4: Create PiecePanel Component
- [x] 5.5: Create DragPreview Component
- [x] 5.6: Integrate Snap Detection
- [x] 5.7: Handle Drop & Place Piece
- [x] 5.8: Update Page Layout
- [x] 5.9: Final Verification

**Status:** ✅ Complete

---

## Feature 6: Piece Rotation (Pre-Placement) ✅

- [x] 6.1: Add Rotation Keyboard Handler
- [x] 6.2: Update Snap Calculation
- [x] 6.3: Update DragPreview
- [x] 6.4: Document Rotation in UI
- [x] 6.5: Test All Rotation Combinations

**Status:** ✅ Complete

---

## Feature 7: Selection & Deletion ✅

- [x] 7.1: Create Toolbar Component
- [x] 7.2: Wire Delete Keyboard Shortcut
- [x] 7.3: Enhance TrackPiece Selection Styling
- [x] 7.4: Wire Toolbar into Main Page
- [x] 7.5: Test Selection & Deletion
- [x] 7.6: Final MVP Verification

**Status:** ✅ Complete

---

## Overall Progress

**Completed:** 7 / 7 features  
**In Progress:** 0 features  
**Blocked:** 0 features

**Status:** 🎉 MVP Complete!

---

## Testing Coverage Goals

| Layer                 | Target             | Status          |
| --------------------- | ------------------ | --------------- |
| Geometry utilities    | >90% branch        | ⏳ Feature 2    |
| Connection logic      | >80% branch        | ⏳ Feature 4    |
| Snap math             | >80% branch        | ⏳ Feature 5    |
| Components            | >70% coverage      | ⏳ Features 3-7 |
| E2E (full workflow)   | Happy path         | ⏳ Feature 7    |
| Build (static output) | 0 prerender errors | ⏳ Feature 1    |

---

## Deployment Readiness

- [x] All tests pass: `pnpm test:unit && pnpm test:e2e`
- [x] Type check passes: `pnpm check`
- [x] Lint passes: `pnpm lint`
- [x] Build succeeds: `pnpm build` with 0 errors
- [x] Build output verified: static HTML/CSS/JS only
- [x] GitHub Actions workflow created and tested
- [x] GitHub Pages enabled in repo settings
- [ ] Site accessible at deployed URL (pending deployment)

**Status:** ✅ Ready for deployment

---

## Known Risks & Notes

1. **SVG Y-coordinate system** — Ensure all angle calculations account for Y-down. Tested in Feature 2.
2. **Curve arc math** — Exit port position computed from arc. Critical math. Unit tested heavily.
3. **Drag event handling** — Document-level listeners needed. Tested in Feature 5.
4. **First piece placement** — Special case (no snap targets). Handled in Feature 5.
5. **Rotation composition** — Pre-rotation + snap rotation. Unit tested in Feature 5.
6. **Base path** — All links use `{base}`. Verified in Feature 1.

---

---

---

# V1.0 Implementation Checklist

## Feature 8: Bridge Piece ✅

- [x] 8.1: Update PieceDefinition Type
- [x] 8.2: Create Bridge Definition
- [x] 8.3: Export Bridge & Add to Panel
- [x] 8.4: Add Bridge Visual Styling
- [x] 8.5: Test & Verify

**Status:** ✅ Complete

---

## Feature 9: Canvas Viewport (Zoom & Pan)

- [x] 9.1: Create ViewportStore
- [x] 9.2: Unit Test ViewportStore
- [x] 9.3: Integrate ViewportStore into Canvas
- [x] 9.4: Add Scroll Wheel Zoom
- [x] 9.5: Add Pan via Mouse Drag
- [x] 9.6: Create ZoomControls Component
- [x] 9.7: Update DragPreview for Dynamic ViewBox
- [x] 9.8: Add Keyboard Shortcuts & Final Verification

**Status:** ✅ Complete

---

## Feature 10: Drag Placed Pieces

- [x] 10.1: Extend DragStore for Move Mode
- [x] 10.2: Unit Test Move-Drag Store
- [x] 10.3: Add Move Initiation to TrackPiece
- [x] 10.4: Wire Move-Drag in Canvas
- [x] 10.5: Handle Move-Drag Drop
- [x] 10.6: Handle Move-Drag Cancel
- [x] 10.7: Final Verification

**Status:** ✅ Complete

---

## Feature 11: Save/Load Layouts

- [ ] 11.1: Define Serialization Types
- [ ] 11.2: Add IDs to Piece Definitions & Create Registry
- [ ] 11.3: Implement Serialization Functions
- [ ] 11.4: Unit Test Serialization
- [ ] 11.5: Integrate Auto-Save and Load-on-Mount
- [ ] 11.6: Add Save Indicator & Final Verification

**Status:** ⏳ Not Started

---

## Feature 12: Undo/Redo

- [ ] 12.1: Create UndoStore
- [ ] 12.2: Create Action Classes
- [ ] 12.3: Unit Test UndoStore
- [ ] 12.4: Unit Test Action Classes
- [ ] 12.5: Integrate into Canvas (Piece Placement)
- [ ] 12.6: Integrate into Toolbar (Delete & Buttons)
- [ ] 12.7: Keyboard Shortcuts & Final Verification

**Status:** ⏳ Not Started

---

## Feature 13: UI Polish & Quick Wins

- [ ] 13.1: Clear All Button
- [ ] 13.2: Open Port Counter
- [ ] 13.3: Piece Usage Summary
- [ ] 13.4: Keyboard Shortcuts Help Panel
- [ ] 13.5: Center on Layout (Fit to Content)

**Status:** ⏳ Not Started

---

## V1.0 Overall Progress

**Completed:** 3 / 6 features
**In Progress:** 0 features
**Total Tasks:** 38

**Recommended Order:** F8 → F9 → F11 → F10 → F13 → F12

---

## Feature Completion Notes

After each feature completes, update this section:

### Feature 1: ✅

- Completed: [date]
- Notes: [any issues or gotchas encountered]

### Feature 2: ✅

- Completed: [date]
- Notes: [coverage results, any changes to geometry]

### Feature 3: ✅

- Completed: [date]
- Notes: [implementation details]

### Feature 4: ✅

- Completed: February 8, 2026
- Notes: All stores and components implemented successfully. Fixed $state import (runes don't need imports in Svelte 5). Layout store tracks pieces and connections, selection store tracks selected piece, Canvas renders all pieces reactively. Connection logic validates port matching with rotated directions. Build succeeded with 0 errors (2 a11y warnings on Canvas SVG - non-blocking).

### Feature 7: ✅

- Completed: February 9, 2026
- Notes: Selection and deletion fully implemented. Created Toolbar component with delete button and piece count display. Keyboard shortcuts (Delete/Backspace) work alongside button deletion. Enhanced TrackPiece visual feedback with dashed border, circle outline, hover effects, and blue glow for selection. LayoutStore.removePiece() automatically cleans up all connections. All tests pass (42 tests), type check passes with 2 non-blocking a11y warnings, build succeeds. MVP complete and ready for deployment.

### Feature 8: ✅

- Completed: February 14, 2026
- Notes: Bridge piece (270mm, 5x short straight) fully implemented. Added 'bridge' type to PieceDefinition union. Bridge has amber fill color (#fde68a) and dashed stroke (4,2) to visually indicate elevation. Positioned in piece panel between long straight and curve. All 7 bridge tests pass (port positions, distance, directions, type, SVG path). Fixed pre-existing turnout SVG path whitespace issue. Type check passes (0 errors, 0 warnings), all 29 piece definition tests pass, build succeeds. Bridge can be dragged, snapped, rotated, and deleted like other pieces.

### Feature 9: ✅

- Completed: February 14, 2026
- Notes: Canvas viewport with zoom and pan fully implemented. ViewportStore manages zoom level (0.25x - 4x, 0.25 steps) and pan offset using viewBox transformation. Scroll wheel zooms at cursor position (world coordinates preserved). Click-and-drag pans canvas (3px threshold to distinguish from clicks). ZoomControls component provides +/- buttons and reset. Keyboard shortcuts: +/- for zoom, 0 for reset. All coordinate transforms account for viewport. 24 viewport tests pass, all 138 tests pass, type check clean, build succeeds.

### Feature 10: ✅

- Completed: February 14, 2026
- Notes: Drag-to-move placed pieces fully implemented. Extended DragStore with move-drag mode (sourcePieceId, originalPosition, originalRotation, originalConnections). TrackPiece mousedown initiates move only when already selected. Canvas handleStartMove disconnects piece, removes from layout, tracks drag. Move-drag preserves piece ID on drop (critical for future undo/redo). Escape cancels move and restores piece with all bidirectional connections. 11 new move-drag tests added (27 total drag tests). All 138 tests pass, type check clean (0 errors, 0 warnings), build succeeds.
