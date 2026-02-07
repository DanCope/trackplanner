# SvelteKit Static Site — AI-Assisted Workflows

## Overview

This document describes the recommended workflows for building a SvelteKit static site with AI assistance, from initial scaffolding through deployment to GitHub Pages.

## Agents

| Agent                  | Purpose                           | Model                   | When to Use                                       |
| ---------------------- | --------------------------------- | ----------------------- | ------------------------------------------------- |
| **@product-lead**      | Scope shaping & MVP definition    | Claude Opus / GPT-5.2   | When you have raw ideas and need product guidance |
| **@sveltekit-planner** | Architecture & feature planning   | Claude Opus / GPT-5.2   | Before starting any significant feature           |
| **@sveltekit-dev**     | Implementation, coding, debugging | Claude Sonnet / GPT-4.1 | For all hands-on development work                 |

### Agent Handoff Flow

```
@sveltekit-planner  →  "Implement Plan"  →  @sveltekit-dev  →  "Write Tests"  →  @sveltekit-dev
```

The planner creates a structured implementation plan, then hands off to the dev agent for coding. After implementation, the dev agent can self-handoff to write tests.

## Prompt Commands

| Command               | Purpose                                                                 |
| --------------------- | ----------------------------------------------------------------------- |
| `/scaffold-sveltekit` | Initialize a new SvelteKit project with static + GitHub Pages config    |
| `/new-page`           | Create a new route with page, load function, and nav integration        |
| `/new-component`      | Create a reusable component with types, tests, and barrel export        |
| `/verify-static`      | Run full verification pipeline (types, lint, test, build, output check) |
| `/handoff-project`    | Export project to a dedicated repo using MANIFEST.md as the inventory   |

## Instruction Files (Auto-Applied)

| File                         | Applies To                   | What It Enforces                                        |
| ---------------------------- | ---------------------------- | ------------------------------------------------------- |
| `svelte.instructions.md`     | `**/*.svelte`                | Svelte 5 runes, component patterns, base path usage     |
| `typescript.instructions.md` | `**/*.ts, **/*.js`           | Strict types, naming, SvelteKit load function patterns  |
| `testing.instructions.md`    | `**/*.test.ts, **/*.spec.ts` | Vitest/Playwright patterns, static-specific test checks |

These activate automatically when Copilot is editing files matching their glob patterns.

## Skills

| Skill                     | Purpose                                                               |
| ------------------------- | --------------------------------------------------------------------- |
| `sveltekit-static-deploy` | Static adapter config, GitHub Actions workflow, troubleshooting guide |

Skills are loaded automatically when the AI determines they're relevant to the current task.

---

## Recommended Development Workflows

### 1. Project Kickoff

```
You                          AI
 │                            │
 ├─ /scaffold-sveltekit ─────►│ Creates full project structure
 │                            │ Configures adapter-static
 │                            │ Sets up GitHub Actions
 │                            │ Installs dependencies
 │◄── Ready to develop ──────┤
```

**Steps:**

1. Create a new repository on GitHub
2. Clone it locally
3. Copy `.github/agents/`, `.github/prompts/`, `.github/instructions/`, `.github/skills/` from research repo
4. Run `/scaffold-sveltekit` to initialize the project
5. Push to `main` — GitHub Actions will deploy to Pages
6. Enable GitHub Pages (Settings → Pages → Source: GitHub Actions)

### 2. Feature Development (Plan → Implement → Verify)

This is the core loop for adding any feature:

```
@product-lead   @sveltekit-planner            @sveltekit-dev              /verify-static
 │               │                             │                           │
 ├─ Shape scope  ├─ Analyze codebase           │                           │
 ├─ Define MVP   ├─ Identify constraints       │                           │
 ├─ Stage phases ├─ Create task breakdown      │                           │
 ├─ Hand off plan ────────►│ "Implement Plan" ────────►│                            │
 │                             ├─ Create/edit files         │
 │                             ├─ Follow instructions       │
 │                             ├─ Run type checks           │
 │                             ├─ "Write Tests" ──► self    │
 │                             ├─ Write unit + e2e tests    │
 │                             ├─ Run /verify-static ─────►│
 │                             │                            ├─ pnpm check
 │                             │                            ├─ pnpm lint
 │                             │                            ├─ pnpm test:unit
 │                             │                            ├─ pnpm build
 │                             │                            ├─ Inspect output
 │                             │                            ├─ Check for violations
 │                             │◄── Report ────────────────┤
```

### 3. Adding a New Page

```
You                          AI (@sveltekit-dev via /new-page)
 │                            │
 ├─ /new-page ───────────────►│
 │  route: /blog              │
 │  desc: Blog listing page   │
 │                            ├─ Creates +page.svelte
 │                            ├─ Creates +page.ts (if data needed)
 │                            ├─ Adds entries() for dynamic routes
 │                            ├─ Updates navigation
 │                            ├─ Uses {base}/blog in links
 │◄── Page ready ────────────┤
```

### 4. Adding a Reusable Component

```
You                          AI (@sveltekit-dev via /new-component)
 │                            │
 ├─ /new-component ──────────►│
 │  name: Card                │
 │  purpose: Content card     │
 │                            ├─ Creates Card.svelte
 │                            ├─ Defines Props interface
 │                            ├─ Uses $props() with defaults
 │                            ├─ Creates Card.test.ts
 │                            ├─ Updates barrel export
 │◄── Component ready ───────┤
```

### 5. Pre-Deployment Verification

Run `/verify-static` before every push to `main`. This catches:

- TypeScript errors that would break the build
- Server-only files that are incompatible with static adapter
- Hardcoded paths that will break on GitHub Pages
- Missing `entries()` on dynamic routes
- Prerender errors

### 6. Debugging a Failed Deployment

When the GitHub Actions build fails:

1. Check the Actions tab for the error log
2. Ask `@sveltekit-dev` with the error message
3. The `sveltekit-static-deploy` skill automatically provides context about common static build issues
4. Run `/verify-static` locally to reproduce and fix

---

## What Makes This Effective

### Why Plan Before Implementing?

The planner agent uses a **reasoning-heavy model** (Opus/GPT-5.2) to think through architecture, identify static-adapter constraints, and create ordered task lists. This prevents the most common mistake: building something that can't be statically rendered.

### Why Separate Agents?

- **Planner** uses expensive, high-reasoning models — worth it for architecture decisions
- **Dev** uses faster, cost-effective models — better for the high volume of edits during implementation
- Handoffs maintain context between planning and coding phases

### Why Auto-Applied Instructions?

Every time Copilot edits a `.svelte` file, it automatically knows to use Svelte 5 runes, `base` path for links, and accessibility patterns. No need to repeat these in every prompt — they're injected by the glob-matched instruction files.

### Why a Verification Prompt?

Static sites have a unique failure mode: they build fine locally but break on deployment because of server-only code, missing base paths, or un-enumerated dynamic routes. The `/verify-static` prompt catches all of these before they reach CI.

### Why a Manifest?

Not everything in the research repo belongs to every project. The `MANIFEST.md` file in each project directory explicitly declares which agents, prompts, instructions, and skills should travel with the project. This prevents exporting research-only artifacts (like `@product-lead`) and ensures nothing is forgotten. Update the manifest every time you create or change an artifact for the project.

---

## Project Handoff

When planning is complete and you're ready to start development:

1. Review `MANIFEST.md` — confirm all artifacts are listed and Include flags are correct
2. Run `/handoff-project` with the project name and target directory path
3. The prompt reads the manifest and copies/generates everything into the target
4. Follow the **Post-Handoff Checklist** in the manifest to finalize the target repo

```
You                          AI (via /handoff-project)
 │                            │
 ├─ /handoff-project ────────►│
 │  project: sveltekit-ghpages│
 │  target: ~/source/tracker  │
 │                            ├─ Read MANIFEST.md
 │                            ├─ Copy documentation
 │                            ├─ Copy agents (Include: Yes only)
 │                            ├─ Copy prompts
 │                            ├─ Copy instructions
 │                            ├─ Copy skills
 │                            ├─ Generate copilot-instructions.md
 │                            ├─ Generate AGENTS.md
 │                            ├─ Create .nojekyll
 │◄── Handoff report ────────┤
```

## Next Steps

After handoff, follow the Post-Handoff Checklist in the project's MANIFEST.md to initialize git, run `/scaffold-sveltekit`, and deploy to GitHub Pages.
