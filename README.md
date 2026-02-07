# TrackPlanner

Browser-based layout planner for Tomy Trainmaster (Plarail-compatible) train tracks.

## Overview

TrackPlanner lets you drag train track pieces onto a canvas and snap them to connection ports to build layouts. The app models geometrically perfect connections so you can verify a layout will close properly before building it on the floor — avoiding the compounding alignment errors that cause buckling and disconnection on aging track pieces.

**Status:** In development (MVP Phase 1)

## Features

### MVP (Phase 1)

- 🎨 **SVG canvas** with drag-and-drop piece placement
- 🧲 **Connection-port snapping** — pieces auto-align to open ports with correct rotation
- 🔧 **Two piece types** — short straight, 45° curve
- 🎯 **Port visualization** — connected ports (green), open/available ports (amber)
- ✨ **Piece selection and deletion** — click to select, Delete/Backspace to remove
- 🔄 **8-direction support** — N, NE, E, SE, S, SW, W, NW
- ⚙️ **Configurable geometry** — dimensions stored in config file

### Planned

- Long straight pieces, Y-intersections/turnouts
- Save/load layouts (localStorage)
- Undo/redo functionality
- Loop closure detection

## Tech Stack

- **SvelteKit** — static site generation with file-based routing
- **Svelte 5** — component framework with runes API
- **TypeScript** — strict mode for type safety
- **Tailwind CSS v4** — utility-first styling
- **Vitest** — unit testing
- **Playwright** — E2E testing
- **GitHub Pages** — deployment target

## Development

### Prerequisites

- Node.js 22+
- pnpm

### Setup

```bash
# Install dependencies (after scaffolding)
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Testing

```bash
# Type check
pnpm check

# Lint
pnpm lint

# Run unit tests
pnpm test:unit

# Run E2E tests
pnpm test:e2e

# Full verification pipeline
# Use the /verify-static prompt
```

### Deployment

Push to `main` branch — GitHub Actions will automatically build and deploy to GitHub Pages.

## AI-Assisted Development

This project includes custom AI agents and prompts to accelerate development:

### Agents

- **@sveltekit-planner** — Architecture and feature planning (use before major features)
- **@sveltekit-dev** — Implementation, coding, and debugging

### Prompts

- **/scaffold-sveltekit** — Initialize the SvelteKit project structure
- **/new-page** — Create a new route with proper conventions
- **/new-component** — Create a reusable component with tests
- **/verify-static** — Pre-deployment verification pipeline

See [docs/ai-workflows.md](docs/ai-workflows.md) for detailed workflow guidance.

## Documentation

- [Product Brief](docs/product-brief.md) — Vision, requirements, and decision log
- [AI Workflows](docs/ai-workflows.md) — Recommended development patterns
- [Copilot Instructions](.github/copilot-instructions.md) — Coding conventions

## Static Site Constraints

This is a statically-built site with no server runtime:

- No `+page.server.ts` or `+server.ts` files
- All data loading happens at build time
- Dynamic routes must export `entries()` function
- All links use `{base}/path` pattern for GitHub Pages compatibility

## Data Model

Track pieces are modeled with connection ports:

```typescript
interface Port {
  id: string;
  position: Vec2; // Relative to piece origin
  direction: Direction; // N, NE, E, SE, S, SW, W, NW
}

interface PlacedPiece {
  id: string;
  type: PieceDefinition;
  position: Vec2; // World position
  rotation: number; // Degrees (multiples of 45)
  connections: Map<string, string>;
}
```

## License

MIT
