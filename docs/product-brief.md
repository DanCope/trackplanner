# Product Brief: TrackPlanner

## Vision

A browser-based layout planner for Tomy Trainmaster (Plarail-compatible) train tracks. Drag pieces onto a canvas and snap them to open connection ports to build layouts. The app models geometrically perfect connections so you can verify a layout will close properly before building it on the floor — avoiding the compounding alignment errors that cause buckling and disconnection on aging track pieces.

- **Users:** You, planning layouts for your toddler's train set.
- **Platform:** Desktop browser, deployed as a static site on GitHub Pages.
- **Secondary goal:** Learn SvelteKit, Svelte 5, and GitHub Pages deployment.

## MVP (Phase 1)

### Included

- **SVG canvas** — fixed size, desktop only
- **2 piece types** — short straight, 45° curve
- **Side panel** — piece palette, drag pieces from panel onto canvas
- **Connection-port snapping** — drag a piece near open ports; available ports highlight; piece snaps into position and correct rotation on drop
- **Port visualization** — connected ports (green), open/available ports (amber)
- **Piece selection** — click to select a placed piece
- **Delete** — remove selected piece (keyboard Delete/Backspace or a button)
- **Rotation** — rotate a piece before placement to choose which port to connect from
- **Configurable geometry** — curve radius and straight length defined in a config file, hardcoded to standard Plarail dimensions (adjustable later after measurement)
- **8-direction support** — N, NE, E, SE, S, SW, W, NW — emergent from the connection model, not a separate feature

### Excluded from MVP

- Long straight piece (Phase 2)
- Y-intersection / turnout (Phase 2)
- Save/load layouts (Phase 2)
- Undo/redo (Phase 2)
- Loop closure detection (Phase 2)
- Bridge / overlapping piece (Phase 3)
- Mobile / touch support (Cut)
- Grid-based placement (Cut — incompatible with 45° geometry)

### Success Criteria

1. Can place short straights and curves by snapping to open ports
2. Pieces visually connect at correct positions and angles
3. Can build a closed oval (4 straights + 8 curves) and verify it closes
4. Can identify when a layout _won't_ close — open ports remain amber
5. Deployed and accessible on GitHub Pages

### Estimated Complexity

**Moderate.** The hardest part is the drag-to-snap interaction and the 2D coordinate transforms for piece placement. The data model (pieces with ports) is clean, SVG rendering is straightforward, and validation is trivial once the model works. SvelteKit learning curve adds overhead but the app is client-side only — no SSR/data-loading complexity.

## Phase 2: More Pieces & Persistence

**Value:** Builds out the full piece set and makes layouts persist across sessions.

| Feature                  | Value  | Complexity | Notes                                                  |
| ------------------------ | ------ | ---------- | ------------------------------------------------------ |
| Long straight (2× short) | High   | Low        | Just different port positions — same snap system       |
| Y-intersection (turnout) | High   | Moderate   | 3-port piece, first branching element                  |
| Save/load (localStorage) | Medium | Low        | Serialize piece array to JSON                          |
| Undo/redo                | Medium | Moderate   | Action stack pattern                                   |
| Loop closure detection   | High   | Moderate   | Graph walk: follow ports from any piece back to itself |

**Prerequisites from Phase 1:** Stable data model, working snap system, SVG rendering pipeline.

**Deployable independently:** Yes — each feature adds standalone value.

## Phase 3: Advanced Pieces

| Feature                        | Value  | Complexity | Notes                                                           |
| ------------------------------ | ------ | ---------- | --------------------------------------------------------------- |
| Bridge piece (long incline)    | Medium | High       | Introduces z-layer; overlapping allowed; visual differentiation |
| Piece count / inventory limits | Low    | Low        | "I only have 6 curves" constraint                               |

## Parked Ideas

| Idea                                             | Why Parked                                                                    |
| ------------------------------------------------ | ----------------------------------------------------------------------------- |
| Mobile/touch support                             | Desktop-only is fine for the use case; touch drag adds significant complexity |
| Grid-based placement                             | Incompatible with 45° curve geometry; connection-port snapping is superior    |
| Piece-to-piece physics snapping                  | Unnecessary — connection-port system gives exact alignment                    |
| Stress visualization (show where slop compounds) | Cool idea but out of scope; geometric perfection already solves the problem   |
| Export/share layouts                             | No need until there's a second user                                           |

## Open Questions

1. **Curve radius:** Using Plarail standard (~143mm radius, ~54mm short straight) until measured. Stored in config file for easy adjustment.
2. **Canvas size:** How large? Suggestion: sized to fit a typical oval (roughly 8 short-straight-lengths wide × 6 tall) with some margin. Can adjust after MVP.
3. **First piece placement:** Where does the first piece go? Suggestion: center of canvas, horizontal.

## Technical Constraints

| Constraint                      | Impact                                                                          |
| ------------------------------- | ------------------------------------------------------------------------------- |
| Static adapter — no server code | All logic client-side; no `+page.server.ts`                                     |
| GitHub Pages base path          | All asset/link references via `$app/paths` `base`                               |
| Prerendered                     | Single page app with `prerender = true`; all interactivity is client-side JS    |
| Svelte 5                        | Use runes (`$state`, `$derived`, `$effect`, `$props`), snippets, callback props |
| TypeScript strict               | Typed piece definitions, port interfaces, transform math                        |

## Core Data Model (Sketch)

```typescript
interface Port {
	id: string;
	position: Vec2; // Relative to piece origin
	direction: Direction; // N, NE, E, SE, S, SW, W, NW
}

interface PieceDefinition {
	type: 'straight' | 'curve';
	ports: Port[];
	svgPath: string; // SVG path data for rendering
}

interface PlacedPiece {
	id: string;
	type: PieceDefinition;
	position: Vec2; // World position
	rotation: number; // Degrees (multiples of 45)
	connections: Map<string, string>; // portId → connected piece's portId
}

type Direction = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';
```

## Decision Log

| Date       | Decision                                     | Context                                                               |
| ---------- | -------------------------------------------- | --------------------------------------------------------------------- |
| 2026-02-07 | Connection-port snapping over grid placement | 45° curves don't align to square grid edges; port snapping is exact   |
| 2026-02-07 | 4 directions → 8 directions                  | 45° curves require NE/SE/SW/NW; emergent from connection model        |
| 2026-02-07 | Cut Y-intersection from MVP                  | 3-port piece adds branching complexity; straights + curves are enough |
| 2026-02-07 | Desktop-only                                 | User plans on laptop; toddler doesn't use the app                     |
| 2026-02-07 | Hardcode Plarail standard dimensions         | User will measure real pieces later; config file makes it adjustable  |
