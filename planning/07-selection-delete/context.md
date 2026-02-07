# Feature 7: Selection & Deletion

Allow users to select placed pieces and delete them with button or keyboard shortcut.

## Context

Users interact with the layout by selecting pieces (click) and deleting them (Delete/Backspace key or button). Deletion must clean up all connections to avoid orphaned state.

## Files to Create/Modify

| File                                | Type   | Action                       |
| ----------------------------------- | ------ | ---------------------------- |
| `src/lib/components/Toolbar.svelte` | Create | Delete button, piece count   |
| `src/lib/components/Canvas.svelte`  | Modify | Select on click              |
| Main page                           | Modify | Wire delete keyboard handler |

## Acceptance Criteria

- [ ] Click piece highlights it
- [ ] Click canvas deselects
- [ ] Delete button removes selected piece
- [ ] Delete/Backspace key removes selected piece
- [ ] Connections cleaned up on delete
- [ ] Cannot interact with other pieces while one selected (optional feature polish)

## Dependencies

- Feature 4: Canvas and selection store
- All previous features
