# Copilot Instructions for TrackPlanner

## Project Purpose

TrackPlanner is a browser-based layout planner for Tomy Trainmaster (Plarail-compatible) train tracks. Users drag pieces onto a canvas and snap them to connection ports to build layouts. The app models geometrically perfect connections so layouts can be verified before building them physically.

**Deployment:** Static site on GitHub Pages  
**Tech Stack:** SvelteKit + Svelte 5 + TypeScript + Tailwind CSS v4  
**Target Platform:** Desktop browsers only

## Repository Structure

```
.github/
  agents/              # Custom AI agents
  prompts/             # Reusable prompt templates
  instructions/        # Path-scoped instruction files
  skills/              # Portable skills (agentskills.io)
  workflows/           # GitHub Actions (deploy.yml)
docs/
  product-brief.md     # Product vision and requirements
  ai-workflows.md      # AI-assisted development workflows
src/
  lib/
    components/        # Reusable Svelte 5 components
    utils/             # Helper functions
    types/             # TypeScript type definitions
  routes/              # SvelteKit file-based routing
  app.html             # Root HTML template
  app.css              # Global styles (Tailwind imports)
static/
  .nojekyll            # Prevent GitHub Pages Jekyll processing
tests/                 # Playwright E2E tests
```

## Critical Constraints

### Static Site Limitations

- **No server runtime** — all logic runs client-side at build time
- **No `+page.server.ts` or `+server.ts`** — these require a server
- **All data loading in `+page.ts` / `+layout.ts`** — prerendered at build time
- **Dynamic routes must export `entries()`** to enumerate all paths
- **Always use `base` from `$app/paths`** for links and assets

### Svelte 5 Requirements

- Use runes: `$state()`, `$derived()`, `$effect()`, `$props()`, `$bindable()`
- Use snippets instead of slots for reusable template blocks
- Use callback props instead of `createEventDispatcher`

### GitHub Pages Deployment

- `static/.nojekyll` must exist to prevent Jekyll processing
- Base path configured via `BASE_PATH` environment variable
- All links must use `{base}/path` pattern

## Available Agents

| Agent                              | Purpose                    | When to Use                         |
| ---------------------------------- | -------------------------- | ----------------------------------- |
| [sveltekit-planner](agents/sveltekit-planner.agent.md) | Architecture & planning    | Before starting any major feature   |
| [sveltekit-dev](agents/sveltekit-dev.agent.md)         | Implementation & debugging | All hands-on development work       |

## Available Prompts

| Prompt                                        | Purpose                                  |
| --------------------------------------------- | ---------------------------------------- |
| [/scaffold-sveltekit](prompts/scaffold-sveltekit.prompt.md) | Initialize new SvelteKit project         |
| [/new-page](prompts/new-page.prompt.md)       | Create a new route with proper structure |
| [/new-component](prompts/new-component.prompt.md) | Create a reusable component with tests   |
| [/verify-static](prompts/verify-static.prompt.md) | Pre-deployment verification pipeline     |

## Auto-Applied Instructions

These instruction files automatically activate when editing matching file types:

- [svelte.instructions.md](instructions/svelte.instructions.md) → `**/*.svelte` — Svelte 5 component conventions
- [typescript.instructions.md](instructions/typescript.instructions.md) → `**/*.ts, **/*.js` — TypeScript patterns
- [testing.instructions.md](instructions/testing.instructions.md) → `**/*.test.ts, **/*.spec.ts` — Testing patterns

## Available Skills

- [sveltekit-static-deploy](skills/sveltekit-static-deploy/SKILL.md) — Static adapter config, GitHub Actions workflow, troubleshooting

## Coding Conventions

### Component Structure

- Components in `src/lib/components/` use `PascalCase.svelte`
- Each component has a co-located `.test.ts` file
- Export from `src/lib/components/index.ts` barrel file
- Use TypeScript `interface Props` pattern with `$props()`

### File Naming

- Components: `PascalCase.svelte`
- Routes: `+page.svelte`, `+layout.svelte`
- Utilities: `kebab-case.ts`
- Stores: `kebab-case.svelte.ts`

### Imports

- Use `$lib/` alias for `src/lib/` imports
- Use `$app/paths` for `base` path
- Use `$app/stores`, `$app/navigation` for SvelteKit APIs

### Testing

- Unit tests with Vitest + `@testing-library/svelte`
- E2E tests with Playwright in `tests/` directory
- Verify static build succeeds: `pnpm build`
- Run full verification: `/verify-static`

## Workflow

1. **Plan** — Use `@sveltekit-planner` to analyze architecture before coding
2. **Implement** — Use `@sveltekit-dev` to create components, routes, and features
3. **Test** — Write unit and E2E tests; run `/verify-static`
4. **Deploy** — Push to `main`; GitHub Actions deploys to Pages

## Development Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Build static site
pnpm preview      # Preview production build
pnpm check        # Type check
pnpm lint         # Lint code
pnpm test:unit    # Run Vitest unit tests
pnpm test:e2e     # Run Playwright E2E tests
```

## Core Data Model

The app models train track pieces with connection ports:

```ts
interface Port {
  id: string;
  position: Vec2;        // Relative to piece origin
  direction: Direction;  // N, NE, E, SE, S, SW, W, NW
}

interface PieceDefinition {
  type: "straight" | "curve";
  ports: Port[];
  svgPath: string;
}

interface PlacedPiece {
  id: string;
  type: PieceDefinition;
  position: Vec2;        // World position
  rotation: number;      // Degrees (multiples of 45)
  connections: Map<string, string>;  // portId → connected piece's portId
}
```

## References

- Product vision and requirements: [docs/product-brief.md](docs/product-brief.md)
- AI-assisted development workflows: [docs/ai-workflows.md](docs/ai-workflows.md)
