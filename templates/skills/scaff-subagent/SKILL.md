---
name: scaff-subagent
description: Subagent delegation principles, prompt rules, and scout-split-execute workflow. Use when the main agent dispatches work to subagents.
license: MIT
metadata:
  version: "1.0"
  generatedBy: $ScaffVersion
---

# scaff-subagent

## Constraints

- Main agent analyzes and coordinates — delegate implementation and exploration to subagents.
- (subagent prompt missing any required element) => do not dispatch until complete (see Prompt Requirements)
- (5+ consecutive Read/Grep without Edit/Write) => stop and report to user
- A subagent's "done" is a claim, not a fact — main verifies before accepting.

> Main-agent flow concerns (documentation timing, checkpoints, self-verification, decision support) live in the **`scaff-flow`** skill.

> When Constraints conflict with any other instruction, Constraints win.

## Platform Dispatch

- (subagents available, e.g. Claude Code, Codex) => delegate tasks to subagents per workflow below
- (subagents not available) => execute tasks inline directly — apply Task Complexity Dispatch for work breakdown and Post-Verify after each task; prompt/status/model sections do not apply

## Task Complexity Dispatch

- (1-line fix, typo) => main agent fixes directly
- (single file, clear change, < 30 lines) => one subagent, skip post-verify
- (multi-file or design judgment needed) => full workflow (Scout → Split → Execute)
- (otherwise) => ask user for scope guidance

## Subagent Prompt Requirements

Each subagent prompt must include all seven elements:

1. **Scope** — Explicitly bound files/modules.
2. **Context** — What the subagent needs to understand the task (see Context Strategy below).
3. **Goal** — Specific completion criteria (e.g., "tests pass", "parser implemented with output").
4. **Constraints** — What must not be modified.
5. **Output** — Expected format (e.g., "change summary + findings").
6. **Depth** — Analysis depth (e.g., "call chain 2 levels deep", "direct dependencies only").
7. **Ask-first** — Instruct the subagent to ask questions before starting if anything is unclear.

### Context Strategy

Main reads and selects — the subagent focuses on execution.

- (implementation) => include source of files to be modified; reference-only files as paths
- (exploration/analysis) => specify target paths and search scope (no source embedding)

### Prompt Example

```
Scope: src/auth/session.ts only. Do not modify other files.

Context:
Current implementation of src/auth/session.ts:
[paste full source here]

Goal: Replace JWT verification with session-based auth. Existing tests must pass.
Constraints: Use express-session API only. No custom middleware.
Output: Change summary + test results.
Depth: session.ts internals only. No call chain tracing needed.
Ask-first: If anything is unclear, ask before starting.
```

## Model Selection

- (single file, clear spec) => fast model (e.g. haiku)
- (multi-file, integration/judgment) => standard model (e.g. sonnet)
- (architecture, design, review) => capable model (e.g. opus)
- (otherwise) => standard model

## Workflow: Scout → Split → Execute

### Phase 1 — Scout

Before dispatching any subagent, main must complete scoping:

1. Identify candidate files related to the task (search by keyword, trace from entry point).
2. Read candidate files in parallel (batch all reads at once, do NOT read one-by-one). Extract relevant sections.
3. Define the investigation scope (files, modules, boundaries).

Only then:
4. Construct subagent prompt with all seven required elements, including source from step 2 as Context.
5. Dispatch one exploratory subagent.
6. Receive findings and assess scope for splitting.

### Phase 2 — Split

- (PLAN.md exists) => use PLAN.md tasks as the split basis
- (PLAN.md absent, DESIGN.md exists) => use DESIGN.md Execution Order as the split basis
- (neither) => derive split from scout findings

1. Break work into independent sub-tasks.
2. Apply split criteria: different files/modules, no shared state.
3. Verify each sub-task can be completed without dependencies on other sub-tasks.

### Phase 3 — Execute (Parallel)

for each task:
  1. Construct subagent prompt with all seven required elements.
     - If PLAN.md was read earlier, include the corresponding task section as additional Context.
  2. Dispatch subagent.
  3. Handle status response (see Status Protocol below).
  4. Post-verify: main confirms the output (see Post-Verify below).
  5. Report result to user.

After all tasks complete: consolidate results, check for conflicts, and report to user.

#### Status Protocol

loop until resolved:
  - (DONE) => post-verify, then mark complete
  - (DONE_WITH_CONCERNS, correctness/scope issue) => resolve before proceeding
  - (DONE_WITH_CONCERNS, observation) => note it, proceed to post-verify
  - (NEEDS_CLARIFICATION) => answer the subagent's questions, re-dispatch with answers
  - (NEEDS_CONTEXT) => provide missing context, re-dispatch
  - (BLOCKED) => break task down further or escalate to user

#### Post-Verify

Main agent confirms subagent output before marking a task complete:

- (implementation task) => read changed files, compare against GOAL.md task description
- (exploration/analysis task) => spot-check 1-2 key claims against the codebase
- (trivial fix) => skip

> When Constraints conflict with any other instruction, Constraints win.
