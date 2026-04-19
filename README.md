<div align="center">
  <img src="https://raw.githubusercontent.com/opellen/scaff/master/assets/scaff-logo-wordmark.webp" alt="Scaff Logo" width="180"/>
  <p><strong>Agile, goal-centric AI harness. Just markdown.</strong></p>
  <p>The present that you and AI immediately understand — <code>CONTEXT.md</code>, <code>GOAL.md</code>, <code>ROADMAP.md</code></p>
  <p>
    Open <code>CONTEXT.md</code> and see <b>the current context</b>.<br/>
    Open <code>GOAL.md</code> and see <b>what to do now</b>.<br/>
    Open <code>ROADMAP.md</code> and see <b>the current big picture</b>.
  </p>
  <p><strong>English</strong> · <a href="README.ko.md">한국어</a></p>
</div>

## What is it?

Scaff is a pure markdown-based, lightweight context scaffolding.
No CLI, no hooks, no MCP — just markdown files that let you and AI instantly know what to do right now.

## What does it solve?

**Context management is heavier than the context itself.**
Existing frameworks maintain context across sessions with CLIs, hooks, and MCP servers.
Even light exploration triggers CLI runs, hooks intercept every action,
and if MCP servers are configured, tool definitions alone consume tokens even in sessions that don't use them.

**What you need to do right now isn't visible.**
The current goal is scattered across state files, task lists, and design documents.
You can't just open one file and immediately see "what to do now".

In Scaff, one question maps to one file.
What should I do now? → `GOAL.md`. What is this project? → `CONTEXT.md`. The overall plan? → `ROADMAP.md`.
No digging around. No tools, no runtime.

## Quick start

```bash
npx @opellen/scaff init
```

Markdown commands are installed in your project. No CLI needed after this.

```
/scaff:scout          # Start session — just remember this
```

Whether it's a new project or an existing codebase, scout reads the current state and guides you to the next step.
Got existing code? It starts with context setup (`/scaff:context`). Empty project? It starts by exploring your idea through conversation.

Most commands auto-run `init` on first use — `/scaff:goal "my goal"` works immediately without typing `init`.

### Options

```bash
scaff init --docs .planning      # Use a different path instead of docs/
scaff init --codebase src        # Point templates at a sub-directory codebase (default: .)
scaff init --tools cursor        # Install for a specific tool
scaff init --tools cursor,windsurf  # Multiple tools
scaff init --no-subagent         # Disable subagent delegation (enabled by default)
scaff init --root path/to/proj   # Install into a different project directory
scaff init --force               # Overwrite existing files
scaff init --dry-run             # Preview files to install
```

> [!NOTE]
> Scaff works with `Claude Code`, `Cursor`, `Windsurf`, and [20+ other tools](docs/supported-tools.md).
> Verified with `Claude Code`. Other tools have adapters ready — not yet battle-tested.

## Document structure

```
docs/
├── CONTEXT.md       ← Project context, principles, workflow
├── GOAL.md          ← Current objective and checklist
├── CHECKPOINT.md    ← Last session progress
├── DESIGN.md        ← Implementation design (as needed)
├── PLAN.md          ← Implementation plan (auto-generated for complex tasks)
├── ROADMAP.md       ← Milestone-based overall plan
├── OVERVIEW.md      ← Full project overview (as needed)
└── suspended/       ← Suspended goals
```

| Document | Question it answers | Lifespan |
|----------|-------------------|----------|
| `CONTEXT.md` | What is this project and how do I work on it? | Project lifetime |
| `GOAL.md` | What should I do right now? | Until goal is achieved |
| `CHECKPOINT.md` | Where did the last session leave off? | Per session (overwritten) |
| `DESIGN.md` | How do I implement this? | Until goal is achieved |
| `PLAN.md` | How do I implement this task? | Auto-generated → auto-archived |
| `ROADMAP.md` | Where am I in the big picture? | Project lifetime |
| `OVERVIEW.md` | What does this whole project look like? | Project lifetime |

Start with just `GOAL.md` and expand to `ROADMAP.md`, or lay out the big picture in `ROADMAP.md` and drill down to `GOAL.md`. Either way, Scaff keeps "what to do now" visible on markdown.

<details>
<summary>GOAL.md example</summary>

```markdown
---
id: session-auth
goal: Migrate auth from JWT to session-based
status: in-progress
started: 2026-04-04
---

## Tasks

- [x] 1. Set up session store
- [ ] 2. Replace middleware — Step 1/2 (session middleware in progress)
  - [x] 2.1. Implement session middleware
  - [ ] 2.2. Remove legacy JWT code
- [ ] 3. DB schema migration
- [ ] 4. Integration tests
```

</details>

<details>
<summary>CONTEXT.md example</summary>

```markdown
# Project Overview
Express + PostgreSQL REST API server.
Auth migration from JWT to session-based in progress.

# Architecture
- src/server/ — HTTP routing (Express)
- src/auth/ — Auth middleware
- src/db/ — Database access layer

# Principles
- Zero downtime during migration
- Backward compatibility with existing clients

# Resources
- DB: PostgreSQL 14, migrations via prisma
- Auth: express-session + connect-pg-simple
```

</details>

<details>
<summary>ROADMAP.md example</summary>

```markdown
---
id: api-v2
title: API v2 migration
status: active
started: 2026-03-01
---

- [x] **M1: Auth migration**
- [ ] **M2: Rate limiting**
- [ ] **M3: API versioning**
```

</details>

## Commands

| Command | Description |
|---------|-------------|
| `/scaff:scout` | Start session — read docs, assess current state, suggest next action |
| `/scaff:go` | Execute goal — proceed through `GOAL.md` tasks in order |
| `/scaff:context` | Create and sync `CONTEXT.md` |
| `/scaff:goal` | `GOAL.md` management (init, breakdown, checkpoint, suspend, resume, archive) |
| `/scaff:design` | `DESIGN.md` management (init, sync, archive) |
| `/scaff:roadmap` | `ROADMAP.md` milestone management (init, add, archive) |
| `/scaff:overview` | `OVERVIEW.md` full project overview |
| `/scaff:verify` | Verify consistency across goal, design, and implementation |
| `/scaff:recap` | Session wrap-up — sync decisions into living documents |

### Invocation

You don't always need to type `/scaff:` — when intent is clear from context, natural language works too.

| Path | `/scaff` required? | Example |
|------|-------------------|---------|
| **Explicit invocation** | Yes | `/scaff goal init`, `/scaff:goal init & design init` |
| **Confirming a recent recommendation** | No | AI: "Recommend `/scaff:goal init`" → User: "ok" / "go" |
| **Continuation in active flow** | No | (after goal init) User: "breakdown now" |

With clear context, natural language alone triggers execution. `/scaff` serves as an escape hatch when context is ambiguous.

## Usage flow

### Applying to an existing project

```
You: /scaff:scout
AI:  Found an existing codebase. No CONTEXT.md yet.
     Set up project context with `/scaff:context`?

You: /scaff:context init
AI:  ✓ docs/CONTEXT.md created
     To set a goal: `/scaff:goal init`

You: /scaff:goal Migrate auth module from JWT to session-based
AI:  ✓ docs/GOAL.md created (5 tasks)
     Recommend `/scaff:design init` — implementation task with file-level decisions.

You: /scaff:design init
AI:  ✓ docs/DESIGN.md created
     Session store selection, migration strategy, rollback plan included

You: /scaff:go
AI:  Task 1/5: Set up session store... ✓ done
     Task 2/5: Replace middleware... ✓ done
     Task 3/5 requires DB schema changes. Proceed?
```

### New project

```
You: /scaff:scout Let's discuss building a real-time collaborative editor
AI:  (Discovery Mode — exploring tech stack, requirements, constraints)
     ...
     ✓ docs/CONTEXT.md created

You: /scaff:roadmap init
AI:  ✓ docs/ROADMAP.md created
     ├── M1: Core editor engine
     ├── M2: Real-time sync (CRDT)
     └── M3: Deployment & infrastructure

You: /scaff:goal
AI:  Selecting M1 from ROADMAP.md.
     ✓ docs/GOAL.md created

You: /scaff:goal breakdown
AI:  Decomposed into 7 subtasks

You: /scaff:goal breakdown 3
AI:  Decomposed Task 3 into 4 subtasks (3.1–3.4)

You: /scaff:go
AI:  Task 1/7: Project initialization... ✓ done
     Task 2/7: Editor core implementation... ✓ done
     Several tasks completed. Save progress with `/scaff:goal checkpoint`?

You: /scaff:goal checkpoint
AI:  ✓ docs/CHECKPOINT.md saved
     (If the session drops, the next scout picks up where you left off)

     ... (continue in next session, all tasks complete)

You: /scaff:goal archive
AI:  ✓ Archived 4 files to docs/archive/goals/2026-04-04-editor-core/
     (GOAL.md, DESIGN.md, PLAN.md, CHECKPOINT.md)
     Marked M1 done in ROADMAP.md.
```

### Resuming work

```
You: /scaff:scout
AI:  CONTEXT.md ✓ | GOAL.md ✓ (3/5 complete)
     You were working on API endpoints in the previous session.
     Resume with `/scaff:go`?
```

### Handling blockers

When something comes up mid-goal that must be fixed first:

```
You: (during Goal A) Let's fix this dependency bug first.
AI:  Suggest: /scaff:goal suspend + /scaff:goal "Fix dependency bug"
You: ok
AI:  ✓ Goal A suspended to docs/suspended/goal-a/
     ✓ New GOAL.md created for the blocker.

     ... (work through the blocker, archive when done)

You: /scaff:goal resume
AI:  Resumed: Goal A. Continue with /scaff:go?
```

Nested blockers follow the same pattern — suspend stacks, resume presents a list when multiple goals are paused.

## From the **gap**

> **Heavy workflows weren't always necessary.**
>
> All I wanted was a small fix — did I really need all this?
> Exhaustive discussions with question bombardment and airtight specifications weren't always necessary.
> Thorough processes are appealing. But AI kept absorbing more and more,
> and I started to think that maybe the safety nets we want to lean on were, in many cases, becoming excessive shackles.
> Yet context needed to persist.
>
> **I wanted to focus on the present.**
>
> I wanted to pull the "current goal" out from under specs and task lists.
> I wanted to create a "present" that both I and AI could immediately understand and focus on.
> Whether you grow from small to large, or descend from the big picture —
> either direction, I wanted a structure where "what to do now" is immediately visible.
>
> **I wanted to fill the gap.**
>
> I sometimes start with OpenSpec and cross over to Scaff, and vice versa.
> Sometimes I equip Superpowers.
> What works well should still be used well.
> I needed something that could sit in front of — or between — completeness and power.

## Notation

Scaff's commands and skills aren't written as plain prose. They follow a small markdown notation — `## Constraints`, `(condition) => action` dispatch rules, `for each`, `loop until` — designed from research and prompt-engineering findings on how LLMs reliably follow declarative rules over procedural text. The result: shorter templates, fewer tokens, and more reliable rule-following from the LLM.

If you're modifying a command or skill template, read [docs/NOTATION.md](docs/NOTATION.md) first — it's the reference for the syntax and priority rules. For the rationale and research background behind the notation, see [docs/notation-guide.md](docs/notation-guide.md).

## Contributing

Bug fixes, documentation improvements — PRs welcome.

### Development

```bash
git clone https://github.com/opellen/scaff.git
cd scaff
npm install
npm run build
npm test
```

## License

MIT License — see [LICENSE](LICENSE) for details.
