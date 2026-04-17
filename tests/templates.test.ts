import { describe, it, expect } from "vitest";
import { resolveTemplates, type ScaffConfig } from "../src/templates.js";

describe("resolveTemplates", () => {
  const baseConfig: ScaffConfig = {
    tools: ["claude"],
    subagent: false,
    root: "/tmp/test",
    docsDir: "docs",
    codebaseDir: ".",
  };

  it("returns core commands and skills by default", () => {
    const entries = resolveTemplates(baseConfig);
    const dsts = entries.map((e) => e.dst);

    expect(dsts).toContain(".claude/commands/scaff/scout.md");
    expect(dsts).toContain(".claude/commands/scaff/goal.md");
    expect(dsts).toContain(".claude/commands/scaff/context.md");
    expect(dsts).toContain(".claude/commands/scaff/design.md");
    expect(dsts).toContain(".claude/commands/scaff/roadmap.md");
    expect(dsts).toContain(".claude/commands/scaff/verify.md");
    expect(dsts).toContain(".claude/commands/scaff/recap.md");
    expect(dsts).toContain(".claude/skills/scaff-subagent/SKILL.md");
  });

  it("installs skills regardless of subagent flag", () => {
    const entries = resolveTemplates({ ...baseConfig, subagent: true });
    const dsts = entries.map((e) => e.dst);
    expect(dsts).toContain(".claude/skills/scaff-subagent/SKILL.md");
    expect(dsts).toContain(".claude/commands/scaff/scout.md");
  });

  it("trae installs skills only (no commands)", () => {
    const entries = resolveTemplates({ ...baseConfig, tools: ["trae"] });
    const dsts = entries.map((e) => e.dst);
    expect(dsts).toContain(".trae/skills/scaff-subagent/SKILL.md");
    expect(dsts.some((d) => d.startsWith(".trae/commands"))).toBe(false);
  });
});
