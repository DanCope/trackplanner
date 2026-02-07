```prompt
---
name: new-component
description: Create a reusable Svelte 5 component with TypeScript and Tailwind
agent: sveltekit-dev
tools:
  - codebase
  - readFile
  - editFiles
  - createFile
  - textSearch
---

# Create New Svelte Component

Create a reusable Svelte 5 component following project conventions.

## Context

- Review existing components: [components](../../src/lib/components/)
- Follow conventions: [svelte instructions](../instructions/svelte.instructions.md)

## Component: `${input:componentName:Button}`

## Requirements

1. Create `src/lib/components/${input:componentName}.svelte`:
   - Use `<script lang="ts">` with Svelte 5 runes
   - Define a `Props` interface for all component props
   - Use `$props()` for prop declaration with sensible defaults
   - Use Tailwind CSS for styling
   - Include accessibility attributes (ARIA, semantic HTML)
   - Support `children` snippet prop if the component wraps content

2. Create `src/lib/components/${input:componentName}.test.ts`:
   - Test rendering with required props
   - Test optional prop defaults
   - Test user interactions if applicable
   - Test accessibility (roles, labels)

3. Export from `src/lib/components/index.ts` barrel file (if it exists)

## Component purpose: ${input:purpose:Describe what this component does}

```
