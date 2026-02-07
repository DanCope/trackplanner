# Feature 1 Tasks: Project Scaffolding

## Task 1.1: Initialize SvelteKit Project

Create a new SvelteKit project with static adapter and TypeScript.

**Steps:**

1. Run `pnpm create svelte@latest trackplanner` (or use existing approach)
2. Select: TypeScript strict, ESLint, Prettier
3. Run `cd trackplanner && pnpm install`
4. Verify `pnpm dev` starts server

**Deliverable:**

- Initial project structure with `src/`, `package.json`, `svelte.config.js`, `tsconfig.json`
- Dev server runs without errors

---

## Task 1.2: Configure SvelteKit Static Adapter

Set up `adapter-static` for prerendering and GitHub Pages compatibility.

**Steps:**

1. Install `@sveltejs/adapter-static`
2. Update `svelte.config.js`:
   - Import `import adapter from '@sveltejs/adapter-static'`
   - Set `adapter: adapter({ pages: 'build', assets: 'build', fallback: 'index.html' })`
   - Set `prerender: { entries: ['/'] }` in kit config
3. Create `src/routes/+layout.ts` with `export const prerender = true`
4. Test: `pnpm build` succeeds and produces `build/index.html`

**Deliverable:**

- Static adapter integrated
- Build output is pure HTML/CSS/JS, no Node runtime needed

---

## Task 1.3: Set Up Environment Variables & Base Path

Configure GitHub Pages base path handling.

**Steps:**

1. Create `.env.example` with `BASE_PATH=/trackplanner` (or `/` for direct Pages domain)
2. Create `.env.local` (not committed) with actual base path for local dev
3. Update `svelte.config.js` to read `BASE_PATH`:
   ```js
   const baseUrl = process.env.BASE_PATH || "/";
   export default {
     kit: {
       paths: {
         base: baseUrl,
       },
       // ... rest of config
     },
   };
   ```
4. Verify `pnpm build` works with both `BASE_PATH=/` and a repo-specific path

**Deliverable:**

- Base path configurable via env var
- Build works for both local (/) and GitHub Pages (/repo-name/) deployment

---

## Task 1.4: Configure Tailwind CSS v4

Set up Tailwind CSS with v4 and proper configuration.

**Steps:**

1. Install `tailwindcss` and `postcss` and `autoprefixer`
2. Create `tailwind.config.ts`:

   ```ts
   import type { Config } from "tailwindcss";

   export default {
     content: ["./src/**/*.{html,js,svelte,ts}"],
     theme: {
       extend: {},
     },
     plugins: [],
   } satisfies Config;
   ```

3. Create `postcss.config.js`:
   ```js
   export default {
     plugins: {
       tailwindcss: {},
       autoprefixer: {},
     },
   };
   ```
4. Create `src/app.css`:
   ```css
   @import "tailwindcss/base";
   @import "tailwindcss/components";
   @import "tailwindcss/utilities";
   ```
5. Import `src/app.css` in `src/routes/+layout.svelte`
6. Test: create a page with Tailwind classes, verify styles apply in dev and build

**Deliverable:**

- Tailwind CSS compiles and applies to elements
- Build includes bundled Tailwind CSS

---

## Task 1.5: Configure TypeScript Strict Mode

Ensure strict type checking is enforced.

**Steps:**

1. Update `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "strict": true,
       "noImplicitAny": true,
       "strictNullChecks": true,
       "strictFunctionTypes": true,
       "esModuleInterop": true,
       "skipLibCheck": true,
       "forceConsistentCasingInFileNames": true
     }
   }
   ```
2. Run `pnpm check` — should pass with no errors
3. Verify all `.svelte` and `.ts` files type-check

**Deliverable:**

- `pnpm check` passes
- TypeScript strict mode enforced

---

## Task 1.6: Set Up Vitest & Testing Library

Configure unit testing with Vitest and @testing-library/svelte.

**Steps:**

1. Install `vitest`, `@testing-library/svelte`, `@testing-library/dom`, `jsdom`
2. Create `vite.config.ts`:

   ```ts
   import { defineConfig } from "vitest/config";
   import { sveltekit } from "@sveltejs/kit/vite";

   export default defineConfig({
     plugins: [sveltekit()],
     test: {
       globals: true,
       environment: "jsdom",
     },
   });
   ```

3. Add test script to `package.json`: `"test:unit": "vitest"`
4. Create a simple placeholder test: `src/lib/utils/example.test.ts`
5. Verify `pnpm test:unit` runs (even if just one test)

**Deliverable:**

- `pnpm test:unit` runs successfully
- Testing library is ready for future unit tests

---

## Task 1.7: Set Up Playwright E2E Tests

Configure end-to-end testing with Playwright.

**Steps:**

1. Install `@playwright/test`
2. Create `playwright.config.ts`:

   ```ts
   import { defineConfig, devices } from "@playwright/test";

   export default defineConfig({
     testDir: "./tests",
     fullyParallel: true,
     webServer: {
       command: "pnpm build && pnpm preview",
       port: 4173,
       reuseExistingServer: false,
     },
     use: {
       baseURL: "http://localhost:4173/" + (process.env.BASE_PATH || "").slice(1),
     },
     projects: [
       { name: "chromium", use: { ...devices["Desktop Chrome"] } },
       { name: "webkit", use: { ...devices["Desktop Safari"] } },
       { name: "firefox", use: { ...devices["Desktop Firefox"] } },
     ],
   });
   ```

3. Create `tests/` folder
4. Create `tests/home.test.ts`:

   ```ts
   import { test, expect } from "@playwright/test";

   test("home page loads", async ({ page }) => {
     await page.goto("/");
     expect(page).toBeTruthy();
   });
   ```

5. Add script to `package.json`: `"test:e2e": "playwright test"`
6. Verify `pnpm test:e2e` runs

**Deliverable:**

- `pnpm test:e2e` runs successfully
- Playwright test infrastructure ready

---

## Task 1.8: Create GitHub Actions Deployment Workflow

Set up automated deployment to GitHub Pages on push to main.

**Steps:**

1. Create `.github/workflows/deploy.yml`:

   ```yaml
   name: Deploy

   on:
     push:
       branches: [main]

   jobs:
     build:
       runs-on: ubuntu-latest
       permissions:
         contents: read
         pages: write
         id-token: write

       steps:
         - uses: actions/checkout@v4
         - uses: pnpm/action-setup@v2
         - uses: actions/setup-node@v4
           with:
             node-version: 20
             cache: pnpm

         - run: pnpm install
         - run: pnpm build
         - run: pnpm test:unit
         - run: pnpm test:e2e

         - uses: actions/upload-pages-artifact@v2
           with:
             path: ./build

         - name: Deploy to GitHub Pages
           id: deployment
           uses: actions/deploy-pages@v2
   ```

2. Note: Ensure repo has GitHub Pages enabled (Settings → Pages → Source: GitHub Actions)
3. Test by pushing to `main` — workflow should run

**Deliverable:**

- GitHub Actions workflow defined
- Deployment pipeline is ready (manual trigger until repo is set up)

---

## Task 1.9: Create Root Layout & Home Page

Set up the foundational Svelte pages.

**Steps:**

1. Create `src/routes/+layout.svelte`:

   ```svelte
   <script lang="ts">
     import '../app.css';
   </script>

   <slot />
   ```

2. Create `src/routes/+layout.ts`:
   ```ts
   export const prerender = true;
   ```
3. Create `src/routes/+page.svelte`:
   ```svelte
   <h1>TrackPlanner</h1>
   <p>Layout planner coming soon...</p>
   ```
4. Verify `pnpm dev` renders the page with Tailwind classes applied

**Deliverable:**

- Home page renders
- Layout hierarchy established
- CSS imports work

---

## Task 1.10: Create Project Documentation

Write setup and development guide.

**Steps:**

1. Create `README.md` with:
   - Project description
   - Development commands (`pnpm install`, `pnpm dev`, `pnpm build`, `pnpm test:unit`, `pnpm test:e2e`)
   - Deployment instructions
   - Tech stack summary
2. Create `DEVELOPMENT.md` with:
   - Local setup steps
   - Useful VS Code extensions
   - Common tasks and how to run them
   - Troubleshooting tips
3. Keep `.env.example` in repo, add real `.env.local` to `.gitignore`

**Deliverable:**

- README.md documents how to develop and deploy
- DEVELOPMENT.md provides quick reference for common tasks

---

## Task 1.11: Set Up .gitignore

Create proper gitignore file.

**Steps:**

1. Create `.gitignore`:
   ```
   node_modules/
   .env.local
   .env.*.local
   build/
   .svelte-kit/
   dist/
   .DS_Store
   *.log
   coverage/
   .playwright/
   test-results/
   ```

**Deliverable:**

- Build artifacts and local config not committed

---

## Task 1.12: Final Verification

Verify the complete setup end-to-end.

**Steps:**

1. Fresh clone: `git clone <repo>`, `cd trackplanner`, `pnpm install`
2. Run `pnpm check` — no errors
3. Run `pnpm dev` — page loads at `localhost:5173`
4. Run `pnpm build` — no errors, `build/` folder created with `index.html`
5. Run `pnpm preview` — can preview the build
6. Run `pnpm test:unit` — at least one test passes
7. Run `pnpm test:e2e` — at least one test passes
8. Verify base path: in `src/routes/+page.svelte`, add `<a href="/test">test</a>`, build, check build HTML to confirm href includes base path if set

**Deliverable:**

- Full development → build → test pipeline works
- Ready for Feature 2
