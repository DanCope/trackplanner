# Crash Course on Svelte 5 for React Developers

This guide is tailored to React developers and uses real code from this TrackPlanner project. It focuses on Svelte 5 runes, SvelteKit structure, and how Svelte files map to React concepts.

## 1) Project setup differences (SvelteKit vs React)

### Tooling and build

- React (common): Vite or Next.js; React runtime + JSX transform; hooks for state/effects.
- SvelteKit: compiler-driven. Svelte compiles components to highly optimized JavaScript at build time. Fewer runtime abstractions.

This repo uses SvelteKit + Svelte 5 + TypeScript + Tailwind. SvelteKit provides:

- File-based routing (routes are files/folders in `src/routes`).
- Unified app HTML template in `src/app.html`.
- Adapters for deployment (this project is static and uses prerendering).

Static site note: `+layout.ts` exports `prerender = true`, which tells SvelteKit to prerender pages at build time (no server runtime).

Snippet from the project:

```ts
export const prerender = true;
```

That line is from [src/routes/+layout.ts](src/routes/+layout.ts).

### Data loading

- React: fetch in components (e.g., `useEffect`) or server components in Next.
- SvelteKit (static): data loading happens in `+page.ts` or `+layout.ts`, and runs at build time for prerendered sites.

This project currently uses client-side logic, but the pattern is baked into the structure.

## 2) Project structure (SvelteKit mental model)

Key locations in this repo:

- `src/routes/`: file-based routes. `+page.svelte` is the root page, `+layout.svelte` wraps all pages.
- `src/lib/`: reusable components, utilities, stores, and types (similar to `src/components` + `src/utils` in React apps).
- `static/`: static assets copied as-is into the build.
- `build/`: output of `pnpm build`.

In React terms:

- `src/routes/+page.svelte` is like a top-level React route component.
- `src/routes/+layout.svelte` is like an app shell component wrapping all pages.
- `src/lib/components/*` are React-like components, but compiled rather than interpreted at runtime.

## 3) Anatomy of a Svelte 5 component (with React analogies)

A Svelte component is a single file with three main sections:

1. `<script>` (logic)
2. Markup (template)
3. Optional `<style>` (scoped CSS)

### Example: `TrackPiece.svelte`

Snippet from [src/lib/components/TrackPiece.svelte](src/lib/components/TrackPiece.svelte):

```svelte
<script lang="ts">
	import type { PlacedPiece } from '$lib/types';
	import { PLARAIL_CONFIG } from '$lib/config';
	import PortIndicator from './PortIndicator.svelte';

	interface Props {
		piece: PlacedPiece;
		isSelected?: boolean;
		onSelect?: () => void;
	}

	let { piece, isSelected = false, onSelect }: Props = $props();

	const scale = PLARAIL_CONFIG.mmToPixels;
	const transform = $derived(
		`translate(${piece.position.x * scale}, ${piece.position.y * scale}) rotate(${piece.rotation})`
	);
</script>

<g {transform} onclick={onSelect} class:selected={isSelected}>
	<path
		d={piece.definition.svgPath}
		stroke="#374151"
		stroke-width="2"
		transform={`scale(${scale})`}
		vector-effect="non-scaling-stroke"
		fill="none"
		stroke-linecap="round"
	/>

	{#each piece.definition.ports as port}
		<PortIndicator
			position={{ x: port.position.x * scale, y: port.position.y * scale }}
			isConnected={piece.connections.has(port.id)}
		/>
	{/each}

	{#if isSelected}
		<rect x="-30" y="-30" width="60" height="60" stroke="blue" stroke-width="2" fill="none" />
	{/if}
</g>
```

#### React comparisons

- Props: Svelte 5 uses `$props()` instead of `export let` or React function props. React: `function TrackPiece({ piece, isSelected, onSelect }) { ... }`.
- State and derived values: Svelte 5 uses runes like `$state()` and `$derived()`. React: `useState` and `useMemo`.
- Events: `onclick={onSelect}` is similar to `onClick={onSelect}` in React, but note Svelte uses lowercase DOM event names (`onclick`).
- Conditional classes: `class:selected={isSelected}` is like `className={isSelected ? 'selected' : ''}`.
- Conditionals: `{#if ...}` and loops `{#each ...}` are part of the template (no JSX, no array map in markup).

#### Svelte-only details

- `transform` is computed with `$derived(...)`. React equivalent is `useMemo` or inline string building, but Svelte reactivity is tracked by compiler.
- The component template is compiled, so only values used in markup trigger reactive updates (no virtual DOM diffing).

### Example: `Canvas.svelte`

Snippet from [src/lib/components/Canvas.svelte](src/lib/components/Canvas.svelte):

```svelte
<script lang="ts">
	import TrackPiece from '$lib/components/TrackPiece.svelte';
	import { layoutStore } from '$lib/stores/layout.svelte';
	import { selectionStore } from '$lib/stores/selection.svelte';

	const width = 1200;
	const height = 800;

	const handleCanvasClick = (event: MouseEvent): void => {
		if (event.target === event.currentTarget) {
			selectionStore.deselect();
		}
	};
</script>

<svg
	{width}
	{height}
	viewBox={`0 0 ${width} ${height}`}
	class="rounded border border-gray-300 bg-white"
	onclick={handleCanvasClick}
>
	{#each layoutStore.pieces as piece (piece.id)}
		<TrackPiece
			{piece}
			isSelected={selectionStore.isSelected(piece.id)}
			onSelect={() => selectionStore.select(piece.id)}
		/>
	{/each}
</svg>
```

React comparisons:

- Store usage: `layoutStore.pieces` is rune-based state (similar to a global state hook or Zustand store, but without React context).
- `#each` replaces `array.map(...)` in JSX.
- Event handling is direct on elements; no synthetic event system.

### Example: Root layout

Snippet from [src/routes/+layout.svelte](src/routes/+layout.svelte):

```svelte
<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
```

React comparisons:

- `children` is explicit and rendered via `{@render children()}` (Svelte 5 snippet API). React: `{children}`.
- `<svelte:head>` is like Next.js `Head` or React Helmet.

## 4) Svelte 5 reactivity vs React hooks

Svelte 5 uses runes for reactivity:

- `$state()` for local reactive state (React `useState`).
- `$derived()` for computed values (React `useMemo`).
- `$effect()` for side effects (React `useEffect`).

Example from the layout store in [src/lib/stores/layout.svelte.ts](src/lib/stores/layout.svelte.ts):

```ts
export class LayoutStore {
	pieces = $state<PlacedPiece[]>([]);

	addPiece(piece: PlacedPiece): void {
		this.pieces = [...this.pieces, piece];
	}

	removePiece(id: string): void {
		this.pieces = this.pieces.filter((piece: PlacedPiece) => piece.id !== id);

		for (const piece of this.pieces) {
			const portsToRemove: string[] = [];
			piece.connections.forEach((targetId: string, portId: string) => {
				if (targetId.startsWith(`${id}:`)) {
					portsToRemove.push(portId);
				}
			});

			portsToRemove.forEach((portId: string) => piece.connections.delete(portId));
		}
	}
}
```

React comparisons:

- This is similar to a class-based store (e.g., MobX or Zustand), but the state is tracked by the compiler via `$state`.
- Updating `pieces` triggers rerendering of any template that references `layoutStore.pieces`.

## 5) Working with data and types

Svelte components can use TypeScript directly. Types live in `src/lib/types` and are imported via the `$lib` alias.

Example from [src/lib/pieces/definitions.ts](src/lib/pieces/definitions.ts):

```ts
export const shortStraight: PieceDefinition = {
	type: 'straight',
	ports: [
		{
			id: 'A',
			position: { x: 0, y: -halfLength },
			direction: 'S'
		},
		{
			id: 'B',
			position: { x: 0, y: halfLength },
			direction: 'N'
		}
	],
	svgPath: `M ${-width / 2} ${-halfLength} L ${width / 2} ${-halfLength} L ${
		width / 2
	} ${halfLength} L ${-width / 2} ${halfLength} Z`
};
```

React comparisons:

- Pure TS module looks identical to React projects, but Svelte components import and render these definitions directly in templates.

## 6) Page component example (`+page.svelte`)

Snippet from [src/routes/+page.svelte](src/routes/+page.svelte):

```svelte
<script lang="ts">
	import Canvas from '$lib/components/Canvas.svelte';
	import { curve45, shortStraight } from '$lib/pieces';
	import { layoutStore } from '$lib/stores/layout.svelte';
	import type { PlacedPiece, Vec2 } from '$lib/types';
	import { addVec2, directionToAngle, rotateVec2Simple } from '$lib/utils/geometry';

	const desiredCenter: Vec2 = { x: 300, y: 200 };
	const portA = curve45.ports.find((port) => port.id === 'A');
	const portB = curve45.ports.find((port) => port.id === 'B');

	if (!portA || !portB) {
		throw new Error('Curve definition missing ports A or B');
	}

	const rawCirclePieces: PlacedPiece[] = [];
	let currentPosition: Vec2 = { x: 0, y: 0 };
	let currentRotation = 0;

	for (let i = 0; i < 8; i++) {
		const piece: PlacedPiece = {
			id: `circle-${i}`,
			definition: curve45,
			position: currentPosition,
			rotation: currentRotation,
			connections: new Map()
		};

		rawCirclePieces.push(piece);

		const portBWorld = addVec2(currentPosition, rotateVec2Simple(portB.position, currentRotation));
		const portBWorldAngle = directionToAngle(portB.direction) + currentRotation;
		const nextRotation =
			(((portBWorldAngle - directionToAngle(portA.direction)) % 360) + 360) % 360;

		currentPosition = portBWorld;
		currentRotation = nextRotation;
	}

	rawCirclePieces.forEach((piece) => {
		layoutStore.addPiece({
			...piece,
			position: addVec2(piece.position, offset)
		});
	});
</script>

<main class="mx-auto max-w-6xl p-8">
	<h1 class="mb-3 text-3xl font-bold">TrackPlanner</h1>
	<p class="mb-2 text-sm text-gray-600">
		Click a piece to select it. Click empty canvas to clear selection.
	</p>
	<Canvas />
</main>
```

React comparisons:

- This is similar to a root React component with some initialization logic in `useEffect`. Here it runs immediately when the module is evaluated (Svelte runs module code once at component creation).
- You can put logic directly in the script block; no explicit return needed.

## 7) Things to unlearn from React (and what to adopt)

- No virtual DOM: Svelte updates DOM nodes directly based on compiled dependency tracking.
- No hooks: you use runes and ordinary variables; state is reactive without `useState` or `useReducer`.
- No `className`: Svelte uses `class=` directly.
- No `onClick`: Svelte uses `onclick`.
- No prop drilling for events: callback props are simple and common.
- Templates are not JavaScript: `{#if}`, `{#each}`, `{:else}` are Svelte template syntax.

## 8) Suggested next steps

1. Pick a component (like `TrackPiece.svelte`) and rewrite one React component in Svelte to get comfortable with the syntax.
2. Add a small derived value using `$derived()` and observe how reactivity works without hooks.
3. Introduce a tiny `+page.ts` load function to see how SvelteKit handles static data at build time.
