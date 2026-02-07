```instructions
---
applyTo: "**/*.test.ts,**/*.spec.ts,**/tests/**,**/e2e/**"
name: Testing Standards
description: "Testing conventions for SvelteKit projects using Vitest and Playwright"
---

# Testing Standards

## Unit Tests (Vitest)

- Use `describe`/`it` blocks with descriptive names
- Follow Arrange–Act–Assert pattern
- Test file location: co-located as `Component.test.ts` or in `src/lib/**/*.test.ts`
- Mock external dependencies — never make real network calls
- Use `@testing-library/svelte` for component tests

### Component Testing Pattern

```ts
import { render, screen } from "@testing-library/svelte";
import { expect, describe, it } from "vitest";
import MyComponent from "./MyComponent.svelte";

describe("MyComponent", () => {
  it("renders with required props", () => {
    render(MyComponent, { props: { title: "Hello" } });
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});
```

## E2E Tests (Playwright)

- Test files in `tests/` directory with `.test.ts` extension
- Test user-visible behavior and navigation flows
- Use `page.goto()` with base path awareness
- Prefer `getByRole`, `getByText` locators over CSS selectors
- Each test should be independent — no shared state between tests

## Static Site Specific

- Verify that `pnpm build` succeeds without errors (catches prerender issues)
- Test that all internal links resolve to valid pages
- Verify 404 page renders correctly
- Check that `base` path is applied to all links in production build

## Coverage

- Aim for >80% branch coverage on utility functions
- Component tests should cover: rendering, props, user interactions, edge cases
- E2E tests should cover: navigation, page content, error states

```
