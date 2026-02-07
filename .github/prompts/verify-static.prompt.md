```prompt
---
name: verify-static
description: Verify the SvelteKit project builds correctly for static deployment
agent: sveltekit-dev
tools:
  - runInTerminal
  - readFile
  - problems
  - textSearch
---

# Verify Static Build

Run a full verification pipeline to ensure the SvelteKit project is ready for static deployment to GitHub Pages.

## Checks

1. **Type check:** `pnpm check` — ensure no TypeScript errors
2. **Lint:** `pnpm lint` — ensure code style compliance
3. **Unit tests:** `pnpm test:unit` — run Vitest suite
4. **Build:** `pnpm build` — full static build with adapter-static
5. **Inspect output:** List the `build/` directory to verify expected pages were generated
6. **Check for server files:** Search for `+page.server.ts` or `+server.ts` files (these will break static builds)
7. **Check base path usage:** Search for hardcoded absolute paths that should use `base` from `$app/paths`

## Report

Summarize results as:

| Check           | Status | Notes                   |
| --------------- | ------ | ----------------------- |
| Type check      | ✅/❌  | Details                 |
| Lint            | ✅/❌  | Details                 |
| Unit tests      | ✅/❌  | Details                 |
| Build           | ✅/❌  | Details                 |
| Output files    | ✅/❌  | List of generated pages |
| No server files | ✅/❌  | Any violations found    |
| Base path usage | ✅/❌  | Any hardcoded paths     |

```
