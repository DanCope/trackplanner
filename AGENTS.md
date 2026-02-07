# TrackPlanner

Browser-based layout planner for Tomy Trainmaster (Plarail-compatible) train tracks.

## Purpose

Drag train track pieces onto a canvas and snap them to connection ports to build layouts. The app models geometrically perfect connections so you can verify a layout will close properly before building it on the floor — avoiding compounding alignment errors that cause buckling and disconnection on aging track pieces.

**User:** Planning layouts for a toddler's train set  
**Platform:** Desktop browser, deployed as a static site on GitHub Pages  
**Tech Stack:** SvelteKit + Svelte 5 + TypeScript + Tailwind CSS v4

## Repository Structure

```
.github/
  agents/              # Custom AI agents for development
  prompts/             # Reusable prompt templates
  instructions/        # Path-scoped instruction files
  skills/              # Portable skills (agentskills.io)
  workflows/           # GitHub Actions deployment
docs/
  product-brief.md     # Product vision and requirements
  ai-workflows.md      # AI-assisted development workflows
src/
  lib/
    components/        # Reusable Svelte 5 components
    utils/             # Helper functions and geometry math
    types/             # TypeScript type definitions
  routes/              # SvelteKit file-based routing
static/
  .nojekyll            # Prevent GitHub Pages Jekyll processing
tests/                 # Playwright E2E tests
```

## Core Features

### MVP (Phase 1)

- SVG canvas with drag-and-drop piece placement
- Connection-port snapping system (pieces auto-align to open ports)
- Two piece types: short straight, 45° curve
- Port visualization: connected (green), open (amber)
- Piece selection and deletion
- 8-direction support (N, NE, E, SE, S, SW, W, NW)

### Future Phases

- Additional piece types (long straight, Y-intersection/turnout)
- Save/load layouts (localStorage)
- Undo/redo
- Loop closure detection

## Key Conventions

### Static Site Constraints

- **No server runtime** — all logic is client-side
- **No `+page.server.ts` or `+server.ts` files**
- All data loading in `+page.ts` / `+layout.ts` (runs at build time)
- Dynamic routes must export `entries()` function
- Always use `base` from `$app/paths` for links and assets

### Svelte 5 Patterns

- Use runes: `$state()`, `$derived()`, `$effect()`, `$props()`
- Use snippets instead of slots
- Use callback props instead of `createEventDispatcher`

### TypeScript

- Strict mode enabled
- Explicit return types on all functions
- Use `interface` for object shapes

## Available Agents

- **@sveltekit-planner** — Architecture and feature planning (use before major features)
- **@sveltekit-dev** — Implementation, coding, debugging

## Available Prompts

- **/scaffold-sveltekit** — Initialize new SvelteKit project
- **/new-page** — Create a new route with proper structure
- **/new-component** — Create a reusable component with tests
- **/verify-static** — Pre-deployment verification pipeline

## Development Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Build static site
pnpm preview      # Preview production build
pnpm check        # Type check
pnpm lint         # Lint code
pnpm test:unit    # Run Vitest tests
pnpm test:e2e     # Run Playwright tests
```

## Data Model

```ts
interface Port {
  id: string;
  position: Vec2; // Relative to piece origin
  direction: Direction; // N, NE, E, SE, S, SW, W, NW
}

interface PieceDefinition {
  type: "straight" | "curve";
  ports: Port[];
  svgPath: string;
}

interface PlacedPiece {
  id: string;
  type: PieceDefinition;
  position: Vec2; // World position
  rotation: number; // Degrees (multiples of 45)
  connections: Map<string, string>; // portId → connected piece's portId
}
```

## References

- [Product brief](docs/product-brief.md) — Vision, requirements, decision log
- [AI workflows](docs/ai-workflows.md) — Recommended development patterns
- [Copilot instructions](.github/copilot-instructions.md) — Detailed coding conventions
