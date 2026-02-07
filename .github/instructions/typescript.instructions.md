```instructions
---
applyTo: "**/*.ts,**/*.js"
name: TypeScript Standards
description: "TypeScript coding conventions for SvelteKit projects"
---

# TypeScript Standards

## General

- Use TypeScript strict mode (`"strict": true` in tsconfig)
- Prefer `interface` over `type` for object shapes (unless unions/intersections needed)
- Export types explicitly: `export interface`, `export type`
- Use `satisfies` operator for type-safe object literals
- Avoid `any` — use `unknown` and narrow with type guards

## Functions

- All functions must have explicit return types (except arrow functions in callbacks)
- Use `const` arrow functions for module-level utilities
- Prefer named exports over default exports

## SvelteKit Load Functions

```ts
// +page.ts
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params, fetch }) => {
  // Data fetching happens at BUILD TIME for static sites
  return {
    /* typed data */
  };
};
```

- Always type load functions with generated types from `./$types`
- Remember: load functions run at **build time** during prerendering
- No access to runtime request data (cookies, headers) in static mode

## Stores (Svelte 5 Rune-based)

- Use `.svelte.ts` extension for files containing runes
- Prefer rune-based reactive state over legacy Svelte stores
- Export reactive state as module-level `$state()` or use class-based stores

## Naming

- Variables, functions: `camelCase`
- Types, interfaces, classes: `PascalCase`
- Constants: `UPPER_SNAKE_CASE` for true constants, `camelCase` for derived
- Files: `kebab-case.ts` for utilities, `PascalCase.svelte` for components

## Imports

- Use `$lib/` alias for `src/lib/` imports
- Use `$app/paths`, `$app/navigation`, `$app/stores` for SvelteKit APIs
- Group imports: svelte/kit → $lib → relative → types

```
