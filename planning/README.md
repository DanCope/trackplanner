# TrackPlanner MVP Planning

## Overview

This folder contains the detailed breakdown of the TrackPlanner MVP (Phase 1) into 7 features with ordered, implementable tasks.

## Project Context

**TrackPlanner** is a browser-based layout planner for Tomy Trainmaster (Plarail-compatible) train tracks. Users drag pieces onto a canvas and snap them to connection ports to build layouts.

- **Platform:** Desktop browser, static site on GitHub Pages
- **Tech Stack:** SvelteKit + Svelte 5 + TypeScript + Tailwind CSS v4
- **Target:** Single-page app, all client-side logic

## Static Site Constraints

- **No server code:** All logic client-side, no `+page.server.ts` or `+server.ts`
- **Prerendered:** Single page with `prerender = true`, all interactivity is client-side
- **Base path aware:** All assets/links use `$app/paths` `base`
- **GitHub Pages:** Deployed via GitHub Actions workflow

## Feature Structure

Each feature folder contains:

- `context.md` — Background, design decisions, constraints
- `acceptance-criteria.md` — Definition of done
- `tasks.md` — Numbered, ordered, implementable tasks
- `dependencies.md` — What must be done before this feature

### Features

1. **Project Scaffolding** — Initialize SvelteKit + static adapter + Tailwind + testing
2. **Data Model & Geometry** — Type system + math utilities (Vec2, Direction, rotation, transforms)
3. **Piece Definitions & SVG** — Define short straight and 45° curve pieces, render as SVG
4. **Canvas & Layout Store** — SVG canvas + reactive store for pieces and connections
5. **Drag & Snap** — Drag from panel → snap to open ports on canvas
6. **Piece Rotation** — Rotate pieces before placement (R key, 45° steps)
7. **Selection & Delete** — Select pieces, delete with button/keyboard, clean up connections

## Dependency Order

```
Scaffolding (1)
    ↓
Data Model (2)
    ↓ ↓
Geometry + Pieces (3)
    ↓
Canvas & Store (4)
    ↓
Drag & Snap (5)
    ↓ ↓
Rotation (6) + Selection (7)
```

**Parallelizable:** Features 3 and 4 can be worked in parallel after Feature 2; Features 6 and 7 can follow Feature 5 in parallel.

## Testing Strategy

| Layer            | Tool                     | Coverage Target                     |
| ---------------- | ------------------------ | ----------------------------------- |
| Geometry         | Vitest                   | >90% branch coverage                |
| Connection logic | Vitest                   | All port-matching scenarios         |
| Snap math        | Vitest                   | All 8 directions × both piece types |
| Components       | Vitest + Testing Library | Rendering, props, interaction       |
| Full workflow    | Playwright               | Drag → snap → place → delete        |
| Build            | `pnpm build`             | Static output, no prerender errors  |

## Success Criteria (MVP Done)

1. ✅ Can place short straights and curves by snapping to open ports
2. ✅ Pieces visually connect at correct positions and angles
3. ✅ Can build a closed oval (4 straights + 8 curves) and verify it closes
4. ✅ Can identify when a layout won't close — open ports remain amber
5. ✅ Deployed and accessible on GitHub Pages

## Key Files

- [Product Brief](../docs/product-brief.md) — Vision, requirements, decision log
- [Copilot Instructions](../.github/copilot-instructions.md) — Coding conventions
- [AI Workflows](../docs/ai-workflows.md) — Development patterns
