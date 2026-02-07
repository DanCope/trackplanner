```skill
---
name: sveltekit-static-deploy
description: "Build and deploy SvelteKit sites statically to GitHub Pages. Use this skill when configuring static adapters, setting  GitHub Actions deployment workflows, troubleshooting prerender errors, or managing base paths for GitHub Pages project sites."
---

# SvelteKit Static Deployment Skill

## Capabilities

This skill handles the full static deployment pipeline for SvelteKit apps on GitHub Pages:

- Configure `@sveltejs/adapter-static` for GitHub Pages
- Set up GitHub Actions deployment workflows
- Troubleshoot prerender and static build errors
- Manage base path configuration for project sites vs user sites
- Handle 404 fallback pages
- Optimize static output (precompression, asset handling)

## Static Adapter Configuration

### svelte.config.js

```js
import adapter from "@sveltejs/adapter-static";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      pages: "build",
      assets: "build",
      fallback: "404.html",
      precompress: false,
      strict: true,
    }),
    paths: {
      base: process.argv.includes("dev") ? "" : process.env.BASE_PATH,
    },
  },
};

export default config;
```

### Root Layout (src/routes/+layout.ts)

```ts
export const prerender = true;
```

### Required Static Files

- `static/.nojekyll` — empty file, prevents GitHub Pages Jekyll processing

## GitHub Actions Workflow

### .github/workflows/deploy.yml

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: "main"

jobs:
  build_site:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install
      - run: pnpm run build
        env:
          BASE_PATH: "/${{ github.event.repository.name }}"
      - uses: actions/upload-pages-artifact@v3
        with:
          path: "build/"

  deploy:
    needs: build_site
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

## Common Issues & Solutions

### Issue: Links broken on GitHub Pages

**Cause:** Hardcoded absolute paths without base prefix.
**Fix:** Always use `base` from `$app/paths`:

```svelte
<script>
  import { base } from '$app/paths';
</script>
<a href="{base}/about">About</a>
<img src="{base}/images/logo.png" alt="Logo" />
```

### Issue: Dynamic routes fail to prerender

**Cause:** Static adapter doesn't know which parameter values to generate.
**Fix:** Export `entries()` function:

```ts
// src/routes/blog/[slug]/+page.ts
import type { EntryGenerator } from "./$types";

export const entries: EntryGenerator = () => {
  return [{ slug: "first-post" }, { slug: "second-post" }];
};
```

### Issue: `+page.server.ts` or `+server.ts` causing build failure

**Cause:** Server-only files are incompatible with static adapter.
**Fix:** Move logic to `+page.ts` (universal load function) or fetch client-side.

### Issue: 404 page not working on GitHub Pages

**Cause:** Missing fallback configuration.
**Fix:** Set `fallback: '404.html'` in adapter options. GitHub Pages automatically serves `404.html` for unmatched routes.

### Issue: Trailing slash mismatches

**Cause:** GitHub Pages expects `/path/index.html` not `/path.html`.
**Fix:** Add to root layout if needed:

```ts
export const trailingSlash = "always";
```

## GitHub Pages Setup Checklist

1. [ ] Repository Settings → Pages → Source: "GitHub Actions"
2. [ ] `@sveltejs/adapter-static` installed and configured
3. [ ] `src/routes/+layout.ts` exports `prerender = true`
4. [ ] `svelte.config.js` has `paths.base` configured for non-root deployment
5. [ ] `static/.nojekyll` file exists
6. [ ] `.github/workflows/deploy.yml` created
7. [ ] No `+page.server.ts` or `+server.ts` files in project
8. [ ] All links use `{base}/path` pattern
9. [ ] Dynamic routes export `entries()` function
10. [ ] Build succeeds locally: `BASE_PATH=/repo-name pnpm build`

```
