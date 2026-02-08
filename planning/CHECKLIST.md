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

## Feature 6: Piece Rotation (Pre-Placement) ☐

- [ ] 6.1: Add Rotation Keyboard Handler
- [ ] 6.2: Update Snap Calculation
- [ ] 6.3: Update DragPreview
- [ ] 6.4: Document Rotation in UI
- [ ] 6.5: Test All Rotation Combinations

**Status:** ⏳ Ready to start (dependencies met)

---

## Feature 7: Selection & Deletion ☐

- [ ] 7.1: Create Toolbar Component
- [ ] 7.2: Wire Delete Keyboard Shortcut
- [ ] 7.3: Enhance TrackPiece Selection Styling
- [ ] 7.4: Wire Toolbar into Main Page
- [ ] 7.5: Test Selection & Deletion
- [ ] 7.6: Final MVP Verification

**Status:** ⏳ Ready to start (dependencies met)

---

## Overall Progress

**Completed:** 5 / 7 features  
**In Progress:** 0 features  
**Blocked:** 0 features

**Next Step:** Begin Feature 6 (Piece Rotation) or Feature 7 (Selection & Deletion)

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

- [ ] All tests pass: `pnpm test:unit && pnpm test:e2e`
- [ ] Type check passes: `pnpm check`
- [ ] Lint passes: `pnpm lint`
- [ ] Build succeeds: `pnpm build` with 0 errors
- [ ] Build output verified: static HTML/CSS/JS only
- [ ] GitHub Actions workflow created and tested
- [ ] GitHub Pages enabled in repo settings
- [ ] Site accessible at deployed URL

**Status:** ⏳ Not ready

---

## Known Risks & Notes

1. **SVG Y-coordinate system** — Ensure all angle calculations account for Y-down. Tested in Feature 2.
2. **Curve arc math** — Exit port position computed from arc. Critical math. Unit tested heavily.
3. **Drag event handling** — Document-level listeners needed. Tested in Feature 5.
4. **First piece placement** — Special case (no snap targets). Handled in Feature 5.
5. **Rotation composition** — Pre-rotation + snap rotation. Unit tested in Feature 5.
6. **Base path** — All links use `{base}`. Verified in Feature 1.

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

(Continue for all features...)
