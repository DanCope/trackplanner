# MVP Implementation Checklist

Use this to track progress across all features.

## Feature 1: Project Scaffolding ☐

- [ ] 1.1: Initialize SvelteKit Project
- [ ] 1.2: Configure SvelteKit Static Adapter
- [ ] 1.3: Set Up Environment Variables & Base Path
- [ ] 1.4: Configure Tailwind CSS v4
- [ ] 1.5: Configure TypeScript Strict Mode
- [ ] 1.6: Set Up Vitest & Testing Library
- [ ] 1.7: Set Up Playwright E2E Tests
- [ ] 1.8: Create GitHub Actions Deployment Workflow
- [ ] 1.9: Create Root Layout & Home Page
- [ ] 1.10: Create Project Documentation
- [ ] 1.11: Set Up .gitignore
- [ ] 1.12: Final Verification

**Status:** ⏳ Not started

---

## Feature 2: Data Model & Geometry Utilities ☐

- [ ] 2.1: Define Geometry Types
- [ ] 2.2: Define Piece Types
- [ ] 2.3: Create Configuration File
- [ ] 2.4: Implement Vector Utility Functions
- [ ] 2.5: Implement Direction & Angle Functions
- [ ] 2.6: Implement Vector Rotation
- [ ] 2.7: Create Comprehensive Unit Tests
- [ ] 2.8: Create Type Exports Barrel
- [ ] 2.9: Document Configuration
- [ ] 2.10: Final Verification

**Status:** ⏳ Blocked by Feature 1

---

## Feature 3: Piece Definitions & SVG Rendering ☐

- [ ] 3.1: Create Short Straight Piece Definition
- [ ] 3.2: Create 45° Curve Piece Definition
- [ ] 3.3: Export Piece Definitions
- [ ] 3.4: Unit Test Piece Definitions
- [ ] 3.5: Create TrackPiece Component
- [ ] 3.6: Create PortIndicator Component
- [ ] 3.7: Component Tests for TrackPiece
- [ ] 3.8: Component Tests for PortIndicator
- [ ] 3.9: Final Verification

**Status:** ⏳ Blocked by Features 1 & 2

---

## Feature 4: Canvas & Layout State Management ☐

- [ ] 4.1: Create Layout Store
- [ ] 4.2: Create Selection Store
- [ ] 4.3: Implement Connection Logic Utilities
- [ ] 4.4: Unit Test Connection Logic
- [ ] 4.5: Create Canvas Component
- [ ] 4.6: Test Canvas Component
- [ ] 4.7: Update Home Page
- [ ] 4.8: Final Verification

**Status:** ⏳ Blocked by Features 1 & 3

---

## Feature 5: Drag & Snap ☐

- [ ] 5.1: Create Drag State Store
- [ ] 5.2: Implement Snap Calculation
- [ ] 5.3: Unit Test Snap Logic
- [ ] 5.4: Create PiecePanel Component
- [ ] 5.5: Create DragPreview Component
- [ ] 5.6: Integrate Snap Detection
- [ ] 5.7: Handle Drop & Place Piece
- [ ] 5.8: Update Page Layout
- [ ] 5.9: Final Verification

**Status:** ⏳ Blocked by Features 1, 2, 3, 4

---

## Feature 6: Piece Rotation (Pre-Placement) ☐

- [ ] 6.1: Add Rotation Keyboard Handler
- [ ] 6.2: Update Snap Calculation
- [ ] 6.3: Update DragPreview
- [ ] 6.4: Document Rotation in UI
- [ ] 6.5: Test All Rotation Combinations

**Status:** ⏳ Blocked by Feature 5

---

## Feature 7: Selection & Deletion ☐

- [ ] 7.1: Create Toolbar Component
- [ ] 7.2: Wire Delete Keyboard Shortcut
- [ ] 7.3: Enhance TrackPiece Selection Styling
- [ ] 7.4: Wire Toolbar into Main Page
- [ ] 7.5: Test Selection & Deletion
- [ ] 7.6: Final MVP Verification

**Status:** ⏳ Blocked by Feature 4

---

## Overall Progress

**Completed:** 0 / 7 features  
**In Progress:** 0 features  
**Blocked:** 7 features

**Next Step:** Begin Feature 1 (Scaffolding)

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

### Feature 1: ✅ / ❌

- Completed: [date]
- Notes: [any issues or gotchas encountered]

### Feature 2: ✅ / ❌

- Completed: [date]
- Notes: [coverage results, any changes to geometry]

(Continue for all features...)
