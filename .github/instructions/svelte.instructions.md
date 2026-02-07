```instructions
---
applyTo: "**/*.svelte"
name: Svelte Component Standards
description: "Coding conventions for Svelte 5 components"
---

# Svelte 5 Component Standards

## Runes (Svelte 5)

- Use `$state()` for reactive state — never use `let x = value` for reactive variables
- Use `$derived()` for computed values — replaces `$:` reactive declarations
- Use `$effect()` for side effects — replaces `$:` reactive statements with side effects
- Use `$props()` for component props — replaces `export let`
- Use `$bindable()` for two-way bindable props
- Use `$inspect()` for development debugging only — remove before committing

## Component Structure

Follow this order within `<script lang="ts">`:

1. Imports
2. Props declaration (`$props()`)
3. State declarations (`$state()`)
4. Derived values (`$derived()`)
5. Effects (`$effect()`)
6. Functions and event handlers

## Props Pattern

```svelte
<script lang="ts">
  interface Props {
    required: string;
    optional?: number;
    children?: import('svelte').Snippet;
  }

  let { required, optional = 42, children }: Props = $props();
</script>
```

## Snippets (Svelte 5)

- Use `{#snippet name()}...{/snippet}` for reusable template blocks
- Use `{@render snippet()}` to render snippets
- Prefer snippets over slots for new components

## Event Handling

- Use callback props instead of `createEventDispatcher`
- Name callbacks with `on` prefix: `onclick`, `onsubmit`, `onchange`

## Styling

- Use Tailwind CSS utility classes as the primary styling method
- Use `class:` directive for conditional classes
- Avoid `<style>` blocks unless component-scoped CSS is specifically needed
- Use the `cn()` utility for complex conditional class logic

## Accessibility

- All interactive elements must be keyboard accessible
- Images require `alt` attributes
- Use semantic HTML elements (`<nav>`, `<main>`, `<article>`, etc.)
- ARIA attributes where semantic HTML is insufficient

## Static Site Considerations

- Always import `base` from `$app/paths` for links: `<a href="{base}/about">`
- Never use `goto()` without accounting for base path
- No browser APIs in module-level code — guard with `$effect()` or `onMount()`

```
