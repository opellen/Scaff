---
name: "scaff:context"
description: "Project context (CONTEXT.md) management (init|sync)"
category: Workflow
tags: [workflow, scaff, context]
---

# scaff:context

Manages `$DocsDir/CONTEXT.md`. Records the **current working context** of the project.

> CONTEXT.md is not a project overview or summary.
> It captures what is being worked on now, which resources are referenced, and what principles/workflows apply — **context the AI needs immediately at session start**.

## Constraints

- Never overwrite CONTEXT.md without user confirmation.
- Target ~100 lines or less — this file is read at every session start.

> When Constraints conflict with any other instruction, Constraints win.

## Usage

`/scaff:context <subcommand> [content]`

## Subcommand Dispatch

- (args = init) => see Subcommands: init
- (args = sync) => see Subcommands: sync
- (args unclear, no subcommand) => prompt the user to choose init or sync

# Subcommands

## init

Creates `$DocsDir/CONTEXT.md`.

1. If CONTEXT.md already exists, notify and confirm overwrite.
2. If `$ARGUMENTS` has content, incorporate it.
3. Write project-specific context based on the current session discussion.
4. Use the skeleton below as a baseline, extending with project-specific sections.
5. Report: `"Created [CONTEXT.md]($DocsDir/CONTEXT.md)."`

**Skeleton:**

```markdown
# Project Brief
- <1-2 lines: what this project is and who it's for>
- <1-2 lines: core architecture or stack>
- For deeper architecture/decisions, see `$DocsDir/OVERVIEW.md` (if present).

# Goal Hierarchy
- If `$DocsDir/ROADMAP.md` exists, it contains the milestone plan.
  - Mark ROADMAP.md milestones as `done` when completed.
  - GOAL.md objectives are sub-units of ROADMAP.md milestones.

# Current Objective
- If `$DocsDir/GOAL.md` exists, treat it as the top priority.

# Principles

# Workflow
1. Add tasks to GOAL.md `## Tasks`
2. Implement code in `$CodebaseDir`
3. On completion, mark status as `done` and check off GOAL.md checklist
4. GOAL.md YAML front-matter must include an `id` field (slug format)
5. Save session progress with `/scaff:goal checkpoint` → `$DocsDir/CHECKPOINT.md`
   - Single file, overwritten each session — captures latest state for session handoff
```

**Project-specific sections** — extend the skeleton with sections appropriate to the project:

- **Resources**: Key file/directory paths and their descriptions
- **Process**: Project-specific procedures (e.g., porting rules, analysis doc management)
- **Index/Tables**: Frequently referenced item lists (e.g., analysis topics, API endpoints)
- **Extended Principles**: Project-specific principles (e.g., 1:1 logic preservation, no magic numbers)

## sync

Reviews current CONTEXT.md and **proposes updates**.

1. Read `$DocsDir/CONTEXT.md`. If absent, suggest init.
2. If `$ARGUMENTS` has content, use it as update direction.
3. Identify changes from the current session discussion that should be reflected.
4. Present changes in **diff format**:
   - Content to add
   - Content to modify
   - Outdated content to remove/update
5. Apply the changes.
6. Report: `"Updated [CONTEXT.md]($DocsDir/CONTEXT.md)."`

> When Constraints conflict with any other instruction, Constraints win.
