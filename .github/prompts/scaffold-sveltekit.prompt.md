```prompt
---
name: scaffold-sveltekit
description: Scaffold a new SvelteKit static site project ready for GitHub Pages
agent: sveltekit-dev
tools:
  - createFile
  - editFiles
  - runInTerminal
  - readFile
  - listDirectory
---

# Scaffold SvelteKit Static Site

Create a new SvelteKit project configured for static generation and GitHub Pages deployment.

## Steps

1. **Initialize project** with `pnpm create svelte@latest` (choose skeleton project, TypeScript)

2. **Install dependencies:**

   ```
   pnpm add -D @sveltejs/adapter-static
   pnpm add -D tailwindcss @tailwindcss/vite
   pnpm add -D vitest @testing-library/svelte jsdom
   pnpm add -D playwright @playwright/test
   ```

3. **Configure `svelte.config.js`** for static adapter with GitHub Pages support:
   - `fallback: '404.html'`
   - `paths.base` from `BASE_PATH` env var

4. **Set up root layout** (`src/routes/+layout.ts`):
   - `export const prerender = true;`

5. **Configure Tailwind CSS v4** in `src/app.css`:
   - `@import 'tailwindcss';`

6. **Create static files:**
   - `static/.nojekyll` (empty file)
   - `static/favicon.png`

7. **Create GitHub Actions workflow** (`.github/workflows/deploy.yml`)

8. **Create AGENTS.md** at project root with build commands and conventions

9. **Copy agent/prompt/instruction files** from research repo to project `.github/`

## Project name: ${input:projectName:my-sveltekit-site}

## Repository name: ${input:repoName:my-sveltekit-site}

```
