# TrackPlanner

Browser-based layout planner for Tomy Trainmaster (Plarail-compatible) train tracks.

## Overview

TrackPlanner helps you design train track layouts before building them physically. Drag track pieces onto a canvas and snap them to connection ports. The app models geometrically perfect connections so you can verify a layout will close properly — avoiding alignment errors that cause buckling and disconnection on aging track pieces.

## Tech Stack

- **SvelteKit** with static adapter (deployed to GitHub Pages)
- **Svelte 5** with runes (`$state`, `$derived`, `$effect`)
- **TypeScript** in strict mode
- **Tailwind CSS v4** for styling
- **Vitest** + Testing Library for unit/component tests
- **Playwright** for E2E tests

## Development

### Prerequisites

- Node.js 20+
- pnpm (recommended) or npm

### Setup

```sh
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open browser to http://localhost:5173
```

### Development Commands

```sh
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm check        # Type check
pnpm lint         # Lint code
pnpm format       # Format code with Prettier
pnpm test:unit    # Run unit tests
pnpm test:e2e     # Run E2E tests
pnpm test         # Run all tests
```

## Deployment

The app is deployed to GitHub Pages via GitHub Actions. On every push to `main`:

1. Project builds with `pnpm build`
2. Tests run (`test:unit` and `test:e2e`)
3. Static output is deployed to GitHub Pages

View the live site at: `https://<username>.github.io/trackplanner/`

### Local Production Build

```sh
# Build static site
pnpm build

# Preview the production build
pnpm preview
```

## Project Structure

```
src/
  lib/
    components/     # Reusable Svelte 5 components
    utils/          # Helper functions
    types/          # TypeScript type definitions
  routes/
    +layout.svelte  # Root layout
    +layout.ts      # Export prerender = true
    +page.svelte    # Home page
static/             # Static assets (robots.txt, .nojekyll)
tests/              # Playwright E2E tests
planning/           # Implementation planning docs
```

## Documentation

- [Product Brief](docs/product-brief.md) — Vision and requirements
- [AI Workflows](docs/ai-workflows.md) — Development patterns
- [Planning](planning/README.md) — Implementation plan and progress

## License

Private project for personal use.
