# Feature 4: Canvas & Layout State Management

Create the SVG canvas viewport and the reactive store that manages all placed pieces, their positions, rotations, and connections.

## Context

The layout store is the single source of truth for the entire app. It tracks:

- All placed pieces and their state
- Connections between ports
- Selection state

The canvas renders this state and allows click-to-select interaction.

## Files to Create

| File                                 | Type      | Purpose                                              |
| ------------------------------------ | --------- | ---------------------------------------------------- |
| `src/lib/stores/layout.svelte.ts`    | Store     | Reactive piece state, add/remove/update, connections |
| `src/lib/stores/layout.test.ts`      | Tests     | Unit tests for store mutations                       |
| `src/lib/stores/selection.svelte.ts` | Store     | Currently selected piece ID                          |
| `src/lib/components/Canvas.svelte`   | Component | SVG viewport, renders pieces, handles selection      |
| `src/lib/components/Canvas.test.ts`  | Tests     | Component tests                                      |
| `src/lib/utils/connections.ts`       | Utilities | `findSnapTarget`, `connectPorts`, `disconnectPorts`  |
| `src/lib/utils/connections.test.ts`  | Tests     | Connection logic tests                               |

## Acceptance Criteria

- [ ] Layout store creates, reads, updates, deletes pieces
- [ ] Selections state updates on click
- [ ] Canvas renders all pieces and listens to store changes
- [ ] Connection logic finds snap targets correctly
- [ ] Connections track port relationships

## Dependencies

- Feature 3: Piece definitions and rendering
- Feature 2: Geometry utilities
