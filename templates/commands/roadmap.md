---
name: "scaff:roadmap"
description: "Project roadmap (ROADMAP.md) management (init|add|archive)"
category: Workflow
tags: [workflow, scaff, roadmap]
---

# scaff:roadmap

Manages `$DocsDir/ROADMAP.md`. Records the project's **high-level execution plan**.

> ROADMAP.md is one level above GOAL.md.
> Individual ROADMAP milestones correspond to one GOAL each — GOALs are sub-units of ROADMAP milestones.

## Constraints

- Never overwrite ROADMAP.md while an active GOAL exists — force archive/suspend first.
- Never archive ROADMAP while an active GOAL exists — force archive/suspend first.
- Suspended GOALs must be acknowledged before replacing or archiving a ROADMAP.

> When Constraints conflict with any other instruction, Constraints win.

## Usage

`/scaff:roadmap <subcommand> [content]`

## Subcommand Dispatch

- (args = init) => see Subcommands: init
- (args = add) => see Subcommands: add
- (args = archive) => see Subcommands: archive
- (otherwise) => report unknown subcommand and list available subcommands

# Subcommands

## init

Creates `$DocsDir/ROADMAP.md`.

1. If `$ARGUMENTS` has content, use it as roadmap source.
2. If empty, derive from the current session and `$DocsDir/GOAL.md`.
3. If ROADMAP.md already exists, run pre-replace checks (see Init Guards below).
4. Write ROADMAP.md using the format template below.
5. Report: `"Created [ROADMAP.md]($DocsDir/ROADMAP.md)."`
6. If `$DocsDir/CONTEXT.md` exists, suggest: "Update project context with `/scaff:context sync`?"

### Init Guards

- (ROADMAP.md exists, `$DocsDir/GOAL.md` exists) => stop: "Active GOAL exists. Archive or suspend it before replacing the ROADMAP."
- (ROADMAP.md exists, `$DocsDir/suspended/` has entries) => warn: "N suspended GOALs remain under this ROADMAP. Resolve them before replacing?" — proceed only on user confirmation
- (ROADMAP.md exists, no active/suspended GOALs) => suggest: "Archive current ROADMAP first with `/scaff:roadmap archive`? Or overwrite?"

### ROADMAP.md Format Template

```markdown
---
id: <roadmap-slug>
title: <one-line summary>
status: active
started: YYYY-MM-DD
---

- [ ] **M1: <title>**
  - <details>

- [ ] **M2: <title>**
  - <details>
```

## add

Adds a milestone entry to `$DocsDir/ROADMAP.md`.

1. Add `$ARGUMENTS` content as a new milestone entry.
2. Number sequentially after existing milestones.
3. Report: `"Updated [ROADMAP.md]($DocsDir/ROADMAP.md) — added milestone M<N>."`

## archive

Archives the entire ROADMAP.md. Use when all milestones are complete or the roadmap is being replaced.

1. Run archive guards (see Archive Guards below).
2. Read `$DocsDir/ROADMAP.md` and parse front-matter `id`.
3. Set front-matter `status` to `done` and add `completed: YYYY-MM-DD`.
4. Move to `$DocsDir/archive/roadmaps/YYYY-MM-DD-<id>.md`.
5. Report: `"Archived to [$DocsDir/archive/roadmaps/YYYY-MM-DD-<id>.md]($DocsDir/archive/roadmaps/YYYY-MM-DD-<id>.md). Create a new roadmap with /scaff:roadmap init."`

### Archive Guards

- (`$DocsDir/GOAL.md` exists) => stop: "Active GOAL exists. Archive or suspend it before archiving the ROADMAP."
- (`$DocsDir/suspended/` has entries) => warn: "N suspended GOALs remain under this ROADMAP. Resolve them before archiving?" — proceed only on user confirmation

> When Constraints conflict with any other instruction, Constraints win.
