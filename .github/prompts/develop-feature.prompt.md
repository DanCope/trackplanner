---
name: develop-feature
description: Complete the work for a single feature and update the tracking documentation
---

## Your Mission

Implement a specific feature from the plan while maintaining focus and updating tracking documentation. Work systematically through the tasks for ONE feature only.

## Required Context

Before starting, read these files from #file:planning:

1. `planning/README.md` — Project overview, constraints, dependencies
2. `planning/CHECKLIST.md` — Overall progress and feature status
3. `planning/STRUCTURE.md` — How the planning folder is organized
4. `planning/0X-feature-name/context.md` — Design decisions and acceptance criteria for the target feature
5. `planning/0X-feature-name/tasks.md` — Step-by-step implementation tasks

## Workflow

### Step 1: Identify the Feature

The user will specify which feature to work on (e.g., "Feature 2: Data Model" or "drag and snap").

- Read the corresponding feature folder in `planning/`
- Verify dependencies are complete by checking `CHECKLIST.md`
- If dependencies are not met, inform the user and wait for confirmation to proceed

### Step 2: Review Context

From `planning/0X-feature-name/context.md`, understand:

- Feature purpose and design decisions
- Files to create/modify
- Acceptance criteria (definition of done)
- Key specifications and constraints

### Step 3: Implement Tasks in Order

Work through `planning/0X-feature-name/tasks.md` systematically:

1. **Read the task** — Understand what needs to be done
2. **Implement the task** — Create/modify files as specified
3. **Verify the task** — Run tests, type checks, or manual verification
4. **Update the checklist** — Mark task complete in `planning/CHECKLIST.md`
5. **Commit progress** — Brief status update to user

For each task:

- Follow the step-by-step instructions in `tasks.md`
- Use code snippets provided as starting points (adapt as needed)
- Adhere to project conventions
- Write tests when specified
- Run verification commands (`pnpm check`, `pnpm test:unit`, `pnpm build`)

### Step 4: Update Tracking Documents

As you complete tasks, update:

**`planning/CHECKLIST.md`:**

- Mark completed tasks with `[x]`
- Update feature status: ⏳ Not started → 🚧 In progress → ✅ Complete
- Note any blockers or deviations

**`planning/0X-feature-name/tasks.md`** (optional):

- Add implementation notes if the actual approach differs from the plan
- Document any issues encountered and how they were resolved

### Step 5: Verify Feature Completion

When all tasks are done, verify the feature meets its acceptance criteria:

1. Check all acceptance criteria in `context.md` are satisfied
2. Run full test suite (`pnpm test:unit`, `pnpm test:e2e`)
3. Run type check (`pnpm check`)
4. Build successfully (`pnpm build`)
5. Update feature status in `CHECKLIST.md` to ✅ Complete

## Critical Constraints

### Stay Focused

- Work on **ONE feature at a time** — do not jump to other features
- If you discover a dependency issue, document it and ask the user before proceeding
- Do not refactor or optimize code outside the current feature's scope

### Incremental Progress

- Complete tasks in order (they are designed to build on each other)
- Update `CHECKLIST.md` after each task, not in batch at the end
- Run verification frequently (after each file change if possible)

### Quality Standards

- Code must type-check (`pnpm check`)
- Tests must pass (`pnpm test:unit`)
- Build must succeed (`pnpm build`)
- Follow naming conventions: components `PascalCase.svelte`, utilities `kebab-case.ts`

## Output Format

For each task you complete:

```
✅ Task X.Y: [Task Name]

[Brief description of what was implemented]

Files modified:
- path/to/file.ts
- path/to/another.svelte

Verification:
- [✓] Type check passed
- [✓] Tests passed
- [✓] Builds successfully

Updated: planning/CHECKLIST.md ☐ X.Y marked complete
```

When the entire feature is complete:

```
🎉 Feature X Complete: [Feature Name]

All tasks completed:
- Task X.1 ✅
- Task X.2 ✅
...

Acceptance criteria verified:
- [✓] Criterion 1
- [✓] Criterion 2
...

Next: Feature Y (dependencies met) or [blocked by Feature Z]
```

## When to Ask for Help

- Dependencies are not met (earlier features incomplete)
- Acceptance criteria are unclear or conflict with constraints
- A task requires external information not in the planning docs
- You encounter a blocker that prevents progress

**Never:**

- Skip tasks or complete them out of order without asking
- Move to a different feature without completing the current one
- Make changes outside the current feature's scope

## Ready?

Ask the user: **"Which feature should I implement?"** and wait for their response before proceeding.
