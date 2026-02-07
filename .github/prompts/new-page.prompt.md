```prompt
---
name: new-page
description: Scaffold a new SvelteKit route with page, layout, and load function
agent: sveltekit-dev
tools:
  - codebase
  - readFile
  - editFiles
  - createFile
  - listDirectory
---

# Create New SvelteKit Page

Scaffold a new route for a statically-generated SvelteKit site.

## Context

- Review existing routes: [routes](../../src/routes/)
- Follow component conventions: [svelte instructions](../instructions/svelte.instructions.md)
- Check layout hierarchy: [root layout](../../src/routes/+layout.svelte)

## Route: `${input:routePath:/about}`

## Requirements

1. Create `src/routes${input:routePath}/+page.svelte` with:
   - Proper TypeScript `<script lang="ts">` block
   - Svelte 5 runes for any reactive state
   - Tailwind CSS styling
   - SEO-friendly `<svelte:head>` with title and meta description
   - Import `base` from `$app/paths` if the page contains any links

2. Create `src/routes${input:routePath}/+page.ts` if data loading is needed:
   - Type the load function with `PageLoad` from `./$types`
   - Remember: this runs at **build time** during prerendering
   - Export `prerender = true` (inherited from root, but explicit is fine)

3. If the route is dynamic (contains `[param]`):
   - Export an `entries()` function listing all valid parameter values
   - This is **required** for the static adapter to prerender all pages

4. Add navigation link to the new page in the appropriate layout or nav component
   - Use `{base}/path` pattern for the href

## Page description: ${input:pageDescription:Describe what this page should contain}

```
