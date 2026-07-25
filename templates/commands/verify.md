---
name: "scaff:verify"
description: "Verify implementation against goal, design, and code"
category: Workflow
tags: [workflow, scaff, verify]
---

# scaff:verify

Cross-checks the current implementation state against GOAL.md and DESIGN.md to surface gaps before archiving.

## Constraints

<!-- @if subagent -->
- **Delegate** evidence gathering (e.g., reading files, running checks) to **subagents** — verification synthesis stays with main. Direct work is limited to one-line fixes, except where `scaff-subagent` designates work main-only (iterative collaboration, 2nd-iteration rework, evolving design).
- Report subagent results to the user.
- (first subagent dispatch of the session, or first dispatch after a compaction) => load the `scaff-subagent` skill BEFORE dispatching and say so in one line (e.g. "scaff-subagent loaded — dispatching <task> → <model> (<rationale>)"). A dispatch without this load+announcement is a violation: the skill's dispatch rules (model selection/reporting, prompt requirements, post-verify) only bind once its content is actually in context.
<!-- @else -->
- Perform analysis and verification tasks directly.
- Report results to the user.
<!-- @endif -->
- Design Alignment focuses on structural decisions, not style preferences — ignore cosmetic differences.
- Task Coverage is mechanical — checkbox state vs code presence, low ambiguity.
- Assign severity based on the strongest evidence available — for a claim about the code, no concrete signal means don't flag. (Absence of implementation for an unchecked task is itself a concrete signal.)
- Omit issues without a `file:line` pointer and a concrete action.

> When Constraints conflict with any other instruction, Constraints win.

## Usage

`/scaff:verify [focus area]`

- If `$ARGUMENTS` has content, use it as the focus area for verification.
- If empty, infer the verification scope from the current session context (recent work, active goal, design).

# Workflow

## Phase 1 — Read Context

Read `$DocsDir/GOAL.md` and `$DocsDir/DESIGN.md` at once (parallel if supported, sequential otherwise). Skip if already in session context. A file read error means the file does not exist — **do NOT retry failed reads.**
- If GOAL.md has front-matter `id`, glob `$DocsDir/logs/*-<goal-id>-*.md` and read the latest 1-2 for session history.

### Check Dispatch

- (GOAL + DESIGN) => run full verification (Phases 2–4)
- (GOAL only) => skip Phase 2, run Phases 3–4
- (DESIGN only) => skip Phases 3–4, run Phase 2
- (neither, $ARGUMENTS given) => freeform check against `$ARGUMENTS`
- (neither, no $ARGUMENTS) => ask the user what to verify

## Phase 2 — Design Alignment

> Requires: DESIGN.md. Skip if absent.

Check whether the implementation follows the planned architecture.

1. Scan DESIGN.md for structural decisions (file layout, module boundaries, execution flow).
2. Compare each against the actual codebase.
3. Flag contradictions as **CONFLICT** — "Deviates from design: \<decision\>"
4. Spot new/modified files that break project conventions.
5. Flag convention breaks as **STYLE** — "Breaks project pattern: \<details\>"

## Phase 3 — Task Coverage

> Requires: GOAL.md.

Walk every checkbox in GOAL.md (including nested sub-tasks) and classify each:

- (checked `[x]`) => counted as done
- (unchecked `[ ]`, codebase evidence found) => **REVIEW** — likely done but unmarked
- (unchecked `[ ]`, no codebase evidence) => **BLOCKED** — work remains

Output: `done / total` with list of unmarked and blocked items.

## Phase 4 — Intent Match

> Requires: GOAL.md with at least one completed task.

For each completed task, check whether the implementation matches what the task describes:

1. Locate relevant code paths via function names, types, or module structure.
2. Evaluate whether the code behavior matches the stated goal.
3. Flag mismatches as **DRIFT** — "Implementation differs from stated intent: \<details\>"

If `$ARGUMENTS` narrows the scope, focus on that area first.

## Phase 5 — Report

```
## Verify Summary

| Check            | Result                |
|------------------|-----------------------|
| Design Alignment | clean / N conflicts   |
| Task Coverage    | done/total (N issues) |
| Intent Match     | N drifts found        |
```

**Issues (ordered by severity):**

- **BLOCKED**: Incomplete work that must be finished
- **CONFLICT**: Implementation contradicts design decisions
- **DRIFT**: Completed work that doesn't match stated intent
- **REVIEW**: Ambiguous situations needing user judgment
- **STYLE**: Convention deviations worth considering

### Archive Readiness

- (highest = BLOCKED or CONFLICT) => do not archive — resolve first
- (highest = DRIFT) => archive at your discretion
- (highest = REVIEW) => surface the REVIEW items and let the user decide before archiving — REVIEW means user judgment is required
- (highest = STYLE) => archive — cosmetic findings do not block
- (no issues) => clear to archive

## Work Principles

<!-- @if subagent -->
- Load the `scaff-subagent` skill, then follow its delegation principles and workflow.
<!-- @endif -->

> When Constraints conflict with any other instruction, Constraints win.
