import { describe, it, expect } from "vitest";
import {
  getAdapter,
  getAdapters,
  getAllAdapters,
  PLATFORM_IDS,
  type CommandMeta,
} from "../src/platforms/index.js";
import { skillInstallPath } from "../src/skills/generate.js";

const meta: CommandMeta = {
  name: "scout",
  description: "Project scout (project-name)",
  category: "Workflow",
  tags: ["workflow", "scaff", "scout"],
};

const sampleContent = `---
name: "scaff:scout"
description: "Project scout (project-name)"
category: Workflow
tags: [workflow, scaff, scout]
---
# Scout content here
`;

describe("platforms", () => {
  describe("registry", () => {
    it("PLATFORM_IDS contains all 24 platforms", () => {
      expect(PLATFORM_IDS).toHaveLength(24);
    });

    it("getAdapter returns undefined for unknown id", () => {
      expect(getAdapter("unknown")).toBeUndefined();
    });

    it("getAdapters throws for unknown id", () => {
      expect(() => getAdapters(["claude", "nope"])).toThrow("Unknown platform: nope");
    });

    it("getAllAdapters returns all adapters", () => {
      expect(getAllAdapters()).toHaveLength(24);
    });
  });

  // ── Per-platform output verification ─────────────────────────

  describe("claude adapter", () => {
    const adapter = getAdapter("claude")!;
    it("commandPath", () => {
      expect(adapter.commandPath("scout")).toBe(".claude/commands/scaff/scout.md");
    });
    it("formatCommand preserves template (pass-through)", () => {
      expect(adapter.formatCommand(sampleContent, meta)).toBe(sampleContent);
    });
  });

  describe("cursor adapter", () => {
    const adapter = getAdapter("cursor")!;
    it("commandPath", () => {
      expect(adapter.commandPath("scout")).toBe(".cursor/commands/scaff-scout.md");
    });
    it("formatCommand emits name/id/category/description", () => {
      const out = adapter.formatCommand(sampleContent, meta);
      expect(out).toContain("name: /scaff-scout");
      expect(out).toContain("id: scaff-scout");
      expect(out).toContain("category: Workflow");
      expect(out).toContain("description: Project scout (project-name)");
      expect(out).toContain("# Scout content here");
    });
  });

  describe("windsurf adapter", () => {
    const adapter = getAdapter("windsurf")!;
    it("commandPath", () => {
      expect(adapter.commandPath("goal")).toBe(".windsurf/workflows/scaff-goal.md");
    });
    it("formatCommand emits name/description/category/tags", () => {
      const out = adapter.formatCommand(sampleContent, meta);
      expect(out).toContain('name: "scaff:scout"');
      expect(out).toContain("description: Project scout (project-name)");
      expect(out).toContain("category: Workflow");
      expect(out).toContain("tags: [workflow, scaff, scout]");
    });
  });

  describe("cline adapter", () => {
    const adapter = getAdapter("cline")!;
    it("commandPath uses .clinerules/workflows/", () => {
      expect(adapter.commandPath("scout")).toBe(".clinerules/workflows/scaff-scout.md");
    });
    it("formatCommand uses markdown header", () => {
      const out = adapter.formatCommand(sampleContent, meta);
      expect(out).toMatch(/^# scaff-scout\n/);
      expect(out).toContain("Project scout (project-name)");
      expect(out).not.toContain("---");
    });
  });

  describe("codex adapter", () => {
    const adapter = getAdapter("codex")!;
    it("commandPath installs as skill file", () => {
      expect(adapter.commandPath("scout")).toBe(".codex/skills/scaff-scout/SKILL.md");
    });
    it("formatCommand preserves content", () => {
      expect(adapter.formatCommand(sampleContent, meta)).toBe(sampleContent);
    });
  });

  describe("github-copilot adapter", () => {
    const adapter = getAdapter("github-copilot")!;
    it("commandPath", () => {
      expect(adapter.commandPath("scout")).toBe(".github/prompts/scaff-scout.prompt.md");
    });
    it("formatCommand emits description only", () => {
      const out = adapter.formatCommand(sampleContent, meta);
      expect(out).toContain("description: Project scout (project-name)");
      expect(out).not.toMatch(/^name:/m);
    });
  });

  describe("continue adapter", () => {
    const adapter = getAdapter("continue")!;
    it("commandPath", () => {
      expect(adapter.commandPath("scout")).toBe(".continue/prompts/scaff-scout.prompt");
    });
    it("formatCommand emits name/description/invokable", () => {
      const out = adapter.formatCommand(sampleContent, meta);
      expect(out).toContain("name: scaff-scout");
      expect(out).toContain("description: Project scout (project-name)");
      expect(out).toContain("invokable: true");
    });
  });

  describe("amazon-q adapter", () => {
    const adapter = getAdapter("amazon-q")!;
    it("commandPath", () => {
      expect(adapter.commandPath("scout")).toBe(".amazonq/prompts/scaff-scout.md");
    });
    it("formatCommand emits description only", () => {
      const out = adapter.formatCommand(sampleContent, meta);
      expect(out).toContain("description: Project scout (project-name)");
    });
  });

  describe("antigravity adapter", () => {
    const adapter = getAdapter("antigravity")!;
    it("commandPath uses .agent/workflows/", () => {
      expect(adapter.commandPath("scout")).toBe(".agent/workflows/scaff-scout.md");
    });
    it("formatCommand emits description only", () => {
      const out = adapter.formatCommand(sampleContent, meta);
      expect(out).toContain("description: Project scout (project-name)");
      expect(out).not.toMatch(/^name:/m);
    });
  });

  describe("auggie adapter", () => {
    const adapter = getAdapter("auggie")!;
    it("commandPath", () => {
      expect(adapter.commandPath("scout")).toBe(".augment/commands/scaff-scout.md");
    });
    it("formatCommand emits description + argument-hint", () => {
      const out = adapter.formatCommand(sampleContent, meta);
      expect(out).toContain("description: Project scout (project-name)");
      expect(out).toContain("argument-hint: command arguments");
    });
  });

  describe("codebuddy adapter", () => {
    const adapter = getAdapter("codebuddy")!;
    it("commandPath", () => {
      expect(adapter.commandPath("scout")).toBe(".codebuddy/commands/scaff/scout.md");
    });
    it("formatCommand emits name/description/argument-hint", () => {
      const out = adapter.formatCommand(sampleContent, meta);
      expect(out).toContain('name: "scaff:scout"');
      expect(out).toContain("description: Project scout (project-name)");
      expect(out).toContain('argument-hint: "[command arguments]"');
    });
  });

  describe("costrict adapter", () => {
    const adapter = getAdapter("costrict")!;
    it("commandPath uses .cospec/scaff/commands/", () => {
      expect(adapter.commandPath("scout")).toBe(".cospec/scaff/commands/scaff-scout.md");
    });
    it("formatCommand emits description + argument-hint", () => {
      const out = adapter.formatCommand(sampleContent, meta);
      expect(out).toContain("description: Project scout (project-name)");
      expect(out).toContain("argument-hint: command arguments");
    });
  });

  describe("crush adapter", () => {
    const adapter = getAdapter("crush")!;
    it("commandPath", () => {
      expect(adapter.commandPath("scout")).toBe(".crush/commands/scaff/scout.md");
    });
    it("formatCommand emits name/description/category/tags", () => {
      const out = adapter.formatCommand(sampleContent, meta);
      expect(out).toContain('name: "scaff:scout"');
      expect(out).toContain("description: Project scout (project-name)");
      expect(out).toContain("category: Workflow");
      expect(out).toContain("tags: [workflow, scaff, scout]");
    });
  });

  describe("factory adapter", () => {
    const adapter = getAdapter("factory")!;
    it("commandPath", () => {
      expect(adapter.commandPath("scout")).toBe(".factory/commands/scaff-scout.md");
    });
    it("formatCommand emits description + argument-hint", () => {
      const out = adapter.formatCommand(sampleContent, meta);
      expect(out).toContain("description: Project scout (project-name)");
      expect(out).toContain("argument-hint: command arguments");
    });
  });

  describe("gemini adapter", () => {
    const adapter = getAdapter("gemini")!;
    it("commandPath uses .toml extension", () => {
      expect(adapter.commandPath("scout")).toBe(".gemini/commands/scaff/scout.toml");
    });
    it("formatCommand emits TOML with description + prompt", () => {
      const out = adapter.formatCommand(sampleContent, meta);
      expect(out).toContain('description = "Project scout (project-name)"');
      expect(out).toContain('prompt = """');
      expect(out).toContain("# Scout content here");
      expect(out).not.toContain("---");
    });
  });

  describe("iflow adapter", () => {
    const adapter = getAdapter("iflow")!;
    it("commandPath", () => {
      expect(adapter.commandPath("scout")).toBe(".iflow/commands/scaff-scout.md");
    });
    it("formatCommand emits name/id/category/description", () => {
      const out = adapter.formatCommand(sampleContent, meta);
      expect(out).toContain("name: /scaff-scout");
      expect(out).toContain("id: scaff-scout");
      expect(out).toContain("category: Workflow");
      expect(out).toContain("description: Project scout (project-name)");
    });
  });

  describe("kilocode adapter", () => {
    const adapter = getAdapter("kilocode")!;
    it("commandPath", () => {
      expect(adapter.commandPath("scout")).toBe(".kilocode/workflows/scaff-scout.md");
    });
    it("formatCommand strips frontmatter entirely", () => {
      const out = adapter.formatCommand(sampleContent, meta);
      expect(out).not.toContain("---");
      expect(out).toContain("# Scout content here");
    });
  });

  describe("kiro adapter", () => {
    const adapter = getAdapter("kiro")!;
    it("commandPath", () => {
      expect(adapter.commandPath("scout")).toBe(".kiro/prompts/scaff-scout.prompt.md");
    });
    it("formatCommand emits description only", () => {
      const out = adapter.formatCommand(sampleContent, meta);
      expect(out).toContain("description: Project scout (project-name)");
      expect(out).not.toMatch(/^name:/m);
    });
  });

  describe("opencode adapter", () => {
    const adapter = getAdapter("opencode")!;
    it("commandPath", () => {
      expect(adapter.commandPath("scout")).toBe(".opencode/command/scaff-scout.md");
    });
    it("formatCommand emits description only", () => {
      const out = adapter.formatCommand(sampleContent, meta);
      expect(out).toContain("description: Project scout (project-name)");
    });
  });

  describe("pi adapter", () => {
    const adapter = getAdapter("pi")!;
    it("commandPath", () => {
      expect(adapter.commandPath("scout")).toBe(".pi/prompts/scaff-scout.md");
    });
    it("formatCommand emits description only", () => {
      const out = adapter.formatCommand(sampleContent, meta);
      expect(out).toContain("description: Project scout (project-name)");
      expect(out).not.toMatch(/^name:/m);
    });
  });

  describe("qoder adapter", () => {
    const adapter = getAdapter("qoder")!;
    it("commandPath", () => {
      expect(adapter.commandPath("scout")).toBe(".qoder/commands/scaff/scout.md");
    });
    it("formatCommand emits name/description/category/tags", () => {
      const out = adapter.formatCommand(sampleContent, meta);
      expect(out).toContain('name: "scaff:scout"');
      expect(out).toContain("description: Project scout (project-name)");
      expect(out).toContain("category: Workflow");
      expect(out).toContain("tags: [workflow, scaff, scout]");
    });
  });

  describe("qwen adapter", () => {
    const adapter = getAdapter("qwen")!;
    it("commandPath uses .toml extension", () => {
      expect(adapter.commandPath("scout")).toBe(".qwen/commands/scaff-scout.toml");
    });
    it("formatCommand emits TOML with description + prompt", () => {
      const out = adapter.formatCommand(sampleContent, meta);
      expect(out).toContain('description = "Project scout (project-name)"');
      expect(out).toContain('prompt = """');
      expect(out).toContain("# Scout content here");
      expect(out).not.toContain("---");
    });
  });

  describe("roocode adapter", () => {
    const adapter = getAdapter("roocode")!;
    it("commandPath", () => {
      expect(adapter.commandPath("scout")).toBe(".roo/commands/scaff-scout.md");
    });
    it("formatCommand uses markdown header", () => {
      const out = adapter.formatCommand(sampleContent, meta);
      expect(out).toMatch(/^# scaff-scout\n/);
      expect(out).not.toContain("---");
    });
  });

  describe("trae adapter", () => {
    const adapter = getAdapter("trae")!;
    it("supportsCommands is false (skills-only)", () => {
      expect(adapter.supportsCommands).toBe(false);
    });
  });

  // ── Smoke test: all adapters well-formed ─────────────────────

  describe("all adapters have required shape", () => {
    for (const id of PLATFORM_IDS) {
      it(`${id} adapter is well-formed`, () => {
        const adapter = getAdapter(id)!;
        expect(adapter).toBeDefined();
        expect(adapter.id).toBe(id);
        expect(adapter.displayName).toBeTruthy();
        expect(adapter.configDir).toMatch(/^\./);
        expect(adapter.commandPath("test")).toBeTruthy();
        expect(skillInstallPath(adapter, "scaff-subagent"))
          .toMatch(/\/skills\/scaff-subagent\/SKILL\.md$/);
        const out = adapter.formatCommand(sampleContent, meta);
        expect(out).toBeTruthy();
        expect(out).toContain("Scout content here");
      });
    }
  });
});
