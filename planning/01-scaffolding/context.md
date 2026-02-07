# Feature 1: Project Scaffolding

Bootstrap the SvelteKit project with static adapter, Tailwind v4, TypeScript strict mode, and GitHub Actions deployment.

## Context

This is the foundation — everything else depends on correct scaffolding. The project must:

- Run locally with `pnpm dev`
- Build to static HTML/CSS/JS with `pnpm build`
- Deploy to GitHub Pages via GitHub Actions
- Have TypeScript strict mode and testing infrastructure ready

## Design Decisions

1. **Static Adapter:** `adapter-static` from SvelteKit, configured for prerendering
2. **Base Path:** Read from `BASE_PATH` environment variable (set by GitHub Actions)
3. **Tailwind v4:** Latest version with improved bundling
4. **Testing:** Vitest + @testing-library/svelte for units, Playwright for E2E
5. **Type Safety:** `tsconfig.json` with `"strict": true`

## Files to Create/Modify

| File                           | Action | Notes                                     |
| ------------------------------ | ------ | ----------------------------------------- |
| `package.json`                 | Create | Full deps, scripts                        |
| `svelte.config.js`             | Create | Static adapter config                     |
| `tsconfig.json`                | Create | Strict mode                               |
| `vite.config.ts`               | Create | Vitest setup                              |
| `tailwind.config.ts`           | Create | Tailwind v4 config                        |
| `src/app.html`                 | Create | Root HTML template                        |
| `src/app.css`                  | Create | Tailwind imports, global styles           |
| `src/routes/+layout.svelte`    | Create | Root layout with Tailwind                 |
| `src/routes/+layout.ts`        | Create | `prerender = true`                        |
| `src/routes/+page.svelte`      | Create | Home page                                 |
| `.github/workflows/deploy.yml` | Create | GitHub Actions → Pages                    |
| `playwright.config.ts`         | Create | E2E test config                           |
| `.gitignore`                   | Create | Node modules, build output, test coverage |
| `README.md` (root)             | Create | Setup & development guide                 |

## Acceptance Criteria

- [ ] `pnpm install` succeeds
- [ ] `pnpm dev` starts a dev server on `localhost:5173`
- [ ] `pnpm build` produces `build/` folder with static HTML/CSS/JS
- [ ] `pnpm check` passes (TypeScript type check)
- [ ] `pnpm lint` passes (if eslint configured)
- [ ] `pnpm test:unit` runs (even if no tests yet)
- [ ] `pnpm test:e2e` runs (basic page load test)
- [ ] GitHub Actions workflow file is valid
- [ ] Can push to `main` branch and have Pages deployment start
- [ ] `https://<username>.github.io/trackplanner/` serves the built site (or mirror URL if different repo)

## Notes

- Use `@sveltejs/adapter-static` version matching SvelteKit version
- Environment variable `BASE_PATH` should default to `/` for local dev, `process.env.BASE_PATH` in config
- Tailwind v4 uses new bundling — ensure `tailwind.config.ts` is properly loaded
- E2E tests should verify base path is applied to all links
