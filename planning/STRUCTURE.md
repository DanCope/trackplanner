# Planning Folder Structure

This document describes the organization of the `/planning` folder.

```
planning/
├── README.md                              # Overview & project context
├── CHECKLIST.md                           # Task-by-task progress tracking
│
├── 01-scaffolding/
│   ├── context.md                         # Feature design & decisions
│   └── tasks.md                           # 12 ordered, implementable tasks
│
├── 02-data-model/
│   ├── context.md                         # Types, geometry, config
│   └── tasks.md                           # 10 tasks: types, geometry math, tests
│
├── 03-piece-definitions/
│   ├── context.md                         # Piece specs, SVG rendering
│   └── tasks.md                           # 9 tasks: straight, curve, components
│
├── 04-canvas-layout/
│   ├── context.md                         # Canvas, store, connections
│   └── tasks.md                           # 8 tasks: stores, components
│
├── 05-drag-snap/
│   ├── context.md                         # Drag flow, snap mechanics
│   └── tasks.md                           # 9 tasks: drag state, snap math, panel
│
├── 06-rotation/
│   ├── context.md                         # Pre-placement rotation
│   └── tasks.md                           # 5 tasks: keyboard, snap integration
│
├── 07-selection-delete/
│   ├── context.md                         # Selection, deletion, cleanup
│   └── tasks.md                           # 6 tasks: toolbar, keyboard, cleanup
│
├── v1.0-README.md                         # V1.0 overview, dependency graph, strategy
│
├── 08-bridge-piece/
│   ├── context.md                         # Bridge piece spec & design
│   └── tasks.md                           # 5 tasks: definition, panel, styling
│
├── 09-canvas-viewport/
│   ├── context.md                         # Zoom & pan design, viewBox approach
│   └── tasks.md                           # 8 tasks: store, zoom, pan, controls
│
├── 10-drag-placed-pieces/
│   ├── context.md                         # Move interaction flow, DragStore changes
│   └── tasks.md                           # 7 tasks: store, initiation, drop, cancel
│
├── 11-save-load/
│   ├── context.md                         # localStorage auto-save, serialization format
│   └── tasks.md                           # 6 tasks: types, serialize, auto-save
│
├── 12-undo-redo/
│   ├── context.md                         # Command pattern, action types
│   └── tasks.md                           # 7 tasks: store, actions, integration
│
└── 13-ui-polish/
    ├── context.md                         # Quick wins: clear, stats, help panel
    └── tasks.md                           # 5 tasks: independent UI improvements
```

## How to Use This Structure

### Starting Out

1. Read [README.md](README.md) for project context
2. Check [CHECKLIST.md](CHECKLIST.md) for overall progress
3. Start with Feature 1: Read `01-scaffolding/context.md`, then work through `01-scaffolding/tasks.md`

### During Development

- Open the feature folder for the feature you're working on
- Reference `context.md` for design decisions and constraints
- Follow `tasks.md` step-by-step
- Update `CHECKLIST.md` as you complete tasks

### Dependencies

Each feature lists its dependencies in its `context.md`. Features build on each other:

```
F1 (Scaffolding)
  ↓
F2 (Data Model)  ←─ must complete before F3 and F4
  ↓ ↓
  F3 (Pieces)   F4 (Canvas)  ←─ can work in parallel
    ↓               ↓
    └───→ F5 (Drag & Snap) ←─ depends on both
        ↓ ↓
        F6 (Rotation) + F7 (Delete) ←─ can work in parallel
```

### V1.0 Dependencies

```
F8 (Bridge)  F9 (Viewport)  F11 (Save/Load)  ←─ all independent
               ↓
           F10 (Drag Placed)  ←─ after F9
               ↓
           F12 (Undo/Redo)  ←─ after F10
F13 (UI Polish)  ←─ independent (13.5 needs F9)
```

## Content in Each Feature Folder

### `context.md`

Contains:

- **Feature title and purpose**
- **Design decisions** and rationale
- **Files to create/modify** with action descriptions
- **Acceptance criteria** (definition of done)
- **Dependencies** on other features
- **Key specifications** (geometry, algorithms, etc.)

Use this to understand _why_ things are designed a certain way.

### `tasks.md`

Contains:

- **Numbered tasks** (1.1, 1.2, ... 1.12 for Feature 1, etc.)
- **Step-by-step instructions** for each task
- **Code snippets** where relevant
- **Deliverable** for each task (what gets completed)
- **Test guidance** (what to verify)

Use this to work through the implementation day-by-day. Each task should be completable in 1-2 hours.

### `CHECKLIST.md`

- Track which tasks are done
- See dependencies and blocking status
- Record completion dates and notes
- View overall MVP progress

## Important Notes

### Task Granularity

Each task is designed to be:

- **Completable in 1-2 hours** of focused work
- **Independently testable** (can verify it works before moving on)
- **Clear deliverable** (know when it's done)

### Code Snippets

The `tasks.md` files include code snippets and boilerplate. These are:

- **Starting points**, not complete implementations
- **Example patterns** to show the expected structure
- **Ready to adapt** for your specific implementation

Don't copy-paste blindly — understand what the code does and adjust as needed.

### Testing as You Go

Each feature has unit tests built in. Don't skip tests:

- Tests verify the math is correct (especially geometry in Feature 2)
- Tests prevent regressions when you refactor
- Tests give you confidence the feature works

Run `pnpm test:unit` frequently.

## Success Criteria

The MVP is **done** when:

1. ✅ All 7 features completed (all tasks in CHECKLIST.md checked)
2. ✅ `pnpm check` passes (TypeScript strict)
3. ✅ `pnpm test:unit` passes (all tests)
4. ✅ `pnpm test:e2e` passes (basic flow works)
5. ✅ `pnpm build` produces static output (no errors)
6. ✅ You can build a closed oval (4 straights + 8 curves) and verify it closes
7. ✅ Deployed to GitHub Pages and accessible via URL

## Getting Help

If you get stuck on a task:

1. **Read the `context.md`** for that feature — it explains the design
2. **Check the test file** for the task — tests show expected behavior
3. **Refer to the copilot instructions** for coding conventions: [.github/copilot-instructions.md](../.github/copilot-instructions.md)
4. **Look at previous features** for patterns (e.g., if store structure is confusing, look at Feature 2 stores)

## References

- [Product Brief](../docs/product-brief.md) — Vision, MVP scope, Phase 2 ideas
- [AI Workflows](../docs/ai-workflows.md) — Development patterns, agent handoff
- [Copilot Instructions](../.github/copilot-instructions.md) — Coding conventions, patterns
- [Svelte 5 Instructions](../.github/instructions/svelte.instructions.md) — Component patterns
- [TypeScript Instructions](../.github/instructions/typescript.instructions.md) — Type safety
- [Testing Instructions](../.github/instructions/testing.instructions.md) — Testing patterns
