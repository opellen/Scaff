import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { install, dryRun, type PromptFn } from "../src/installer.js";
import type { ScaffConfig } from "../src/templates.js";

describe("installer", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "scaff-test-"));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  function makeConfig(overrides?: Partial<ScaffConfig>): ScaffConfig {
    return { tools: ["claude"], subagent: false, root: tempDir, docsDir: "docs", codebaseDir: ".", ...overrides };
  }

  const alwaysNo: PromptFn = async () => "n";
  const alwaysYes: PromptFn = async () => "y";

  describe("install - default", () => {
    it("creates core command files", async () => {
      const result = await install(makeConfig());

      expect(result.files).toContain(".claude/commands/scaff/scout.md");
      expect(result.files).toContain(".claude/commands/scaff/goal.md");
      expect(result.files).toContain(".claude/commands/scaff/context.md");
      expect(result.files).toContain(".claude/commands/scaff/design.md");
      expect(result.files).toContain(".claude/commands/scaff/roadmap.md");
      expect(result.files).toContain(".claude/commands/scaff/verify.md");
      expect(result.files).toContain(".claude/commands/scaff/recap.md");

      expect(existsSync(join(tempDir, ".claude/commands/scaff/scout.md"))).toBe(true);
      expect(existsSync(join(tempDir, ".claude/commands/scaff/goal.md"))).toBe(true);
    });

    it("creates scaff-subagent skill by default", async () => {
      const result = await install(makeConfig());
      expect(result.files).toContain(".claude/skills/scaff-subagent/SKILL.md");
    });

    it("creates docs/ directory", async () => {
      await install(makeConfig());
      expect(existsSync(join(tempDir, "docs"))).toBe(true);
    });

    it("does not create AGENTS.md", async () => {
      await install(makeConfig());
      expect(existsSync(join(tempDir, "AGENTS.md"))).toBe(false);
    });

    it("renders scout.md with substituted paths", async () => {
      await install(makeConfig());
      const content = readFileSync(
        join(tempDir, ".claude/commands/scaff/scout.md"),
        "utf-8",
      );
      expect(content).not.toContain("@if");
      expect(content).not.toContain("$DocsDir");
      expect(content).toContain("docs/CONTEXT.md");
    });
  });

  describe("install - custom paths", () => {
    it("substitutes custom docsDir", async () => {
      await install(makeConfig({ docsDir: "my-docs" }));
      const content = readFileSync(
        join(tempDir, ".claude/commands/scaff/scout.md"),
        "utf-8",
      );
      expect(content).toContain("my-docs");
      expect(content).not.toContain("$DocsDir");
    });

    it("substitutes custom codebaseDir", async () => {
      await install(makeConfig({ codebaseDir: "src/app" }));
      const content = readFileSync(
        join(tempDir, ".claude/commands/scaff/context.md"),
        "utf-8",
      );
      expect(content).toContain("src/app");
      expect(content).not.toContain("$CodebaseDir");
    });

    it("creates custom docs directory", async () => {
      await install(makeConfig({ docsDir: "custom/docs" }));
      expect(existsSync(join(tempDir, "custom/docs"))).toBe(true);
    });
  });

  describe("install - subagent", () => {
    it("creates scaff-subagent skill", async () => {
      const result = await install(makeConfig({ subagent: true }));
      expect(result.files).toContain(".claude/skills/scaff-subagent/SKILL.md");
      expect(existsSync(join(tempDir, ".claude/skills/scaff-subagent/SKILL.md"))).toBe(true);
    });

    it("scout.md contains subagent delegation", async () => {
      await install(makeConfig({ subagent: true }));
      const content = readFileSync(
        join(tempDir, ".claude/commands/scaff/scout.md"),
        "utf-8",
      );
      expect(content).toContain("Delegate");
      expect(content).toContain("scaff-subagent");
    });
  });

  describe("install - file protection", () => {
    it("overwrites existing files with --force", async () => {
      await install(makeConfig());

      const result = await install(makeConfig({ force: true }));
      expect(result.files.length).toBeGreaterThan(0);
      expect(result.skipped).toHaveLength(0);
    });

    it("skips when user answers no", async () => {
      await install(makeConfig());

      const result = await install(makeConfig(), alwaysNo);
      expect(result.files).toHaveLength(0);
      expect(result.skipped.length).toBeGreaterThan(0);
      expect(result.skipped).toContain(".claude/commands/scaff/scout.md");
    });

    it("overwrites when user answers yes", async () => {
      await install(makeConfig());

      const scoutPath = join(tempDir, ".claude/commands/scaff/scout.md");
      writeFileSync(scoutPath, "custom content", "utf-8");

      const result = await install(makeConfig(), alwaysYes);
      expect(result.files.length).toBeGreaterThan(0);

      const content = readFileSync(scoutPath, "utf-8");
      expect(content).not.toBe("custom content");
    });

    it("preserves content when skipping", async () => {
      await install(makeConfig());

      const scoutPath = join(tempDir, ".claude/commands/scaff/scout.md");
      writeFileSync(scoutPath, "custom content", "utf-8");

      await install(makeConfig(), alwaysNo);

      const content = readFileSync(scoutPath, "utf-8");
      expect(content).toBe("custom content");
    });
  });

  describe("install - apply all / skip all", () => {
    it("overwrites all remaining files when user answers 'a'", async () => {
      await install(makeConfig());

      let firstCall = true;
      const answerA: PromptFn = async () => {
        if (firstCall) { firstCall = false; return "a"; }
        throw new Error("should not prompt again after 'a'");
      };

      const result = await install(makeConfig(), answerA);
      expect(result.files.length).toBeGreaterThan(0);
      expect(result.skipped).toHaveLength(0);
    });

    it("skips all remaining files when user answers 's'", async () => {
      await install(makeConfig());

      let firstCall = true;
      const answerS: PromptFn = async () => {
        if (firstCall) { firstCall = false; return "s"; }
        throw new Error("should not prompt again after 's'");
      };

      const result = await install(makeConfig(), answerS);
      expect(result.files).toHaveLength(0);
      expect(result.skipped.length).toBeGreaterThan(0);
    });

    it("'all' works as alias for 'a'", async () => {
      await install(makeConfig());

      let firstCall = true;
      const answerAll: PromptFn = async () => {
        if (firstCall) { firstCall = false; return "all"; }
        throw new Error("should not prompt again after 'all'");
      };

      const result = await install(makeConfig(), answerAll);
      expect(result.files.length).toBeGreaterThan(0);
      expect(result.skipped).toHaveLength(0);
    });
  });

  describe("install - multi-platform", () => {
    it("installs to cursor platform", async () => {
      const result = await install(makeConfig({ tools: ["cursor"] }));
      expect(result.files).toContain(".cursor/commands/scaff-scout.md");
      expect(existsSync(join(tempDir, ".cursor/commands/scaff-scout.md"))).toBe(true);

      const content = readFileSync(join(tempDir, ".cursor/commands/scaff-scout.md"), "utf-8");
      expect(content).toContain("name: /scaff-scout");
      expect(content).toContain("id: scaff-scout");
      expect(content).toContain("category: Workflow");
    });

    it("installs to multiple platforms simultaneously", async () => {
      const result = await install(makeConfig({ tools: ["claude", "cursor"] }));
      expect(result.files).toContain(".claude/commands/scaff/scout.md");
      expect(result.files).toContain(".cursor/commands/scaff-scout.md");
    });

    it("skills install for all platforms", async () => {
      const result = await install(makeConfig({ tools: ["claude", "cursor"], subagent: true }));
      expect(result.files).toContain(".claude/skills/scaff-subagent/SKILL.md");
      expect(result.files).toContain(".cursor/skills/scaff-subagent/SKILL.md");
    });

    it("cline adapter uses markdown header instead of YAML frontmatter", async () => {
      await install(makeConfig({ tools: ["cline"] }));
      const content = readFileSync(join(tempDir, ".clinerules/workflows/scaff-scout.md"), "utf-8");
      expect(content).toMatch(/^# scaff-scout\n/);
      expect(content).not.toMatch(/^---\n/);
    });

    it("github-copilot uses .prompt.md extension", async () => {
      const result = await install(makeConfig({ tools: ["github-copilot"] }));
      expect(result.files).toContain(".github/prompts/scaff-scout.prompt.md");
    });
  });

  describe("dryRun", () => {
    it("returns file list without creating files", () => {
      const result = dryRun(makeConfig());
      expect(result.files.length).toBeGreaterThan(0);
      expect(existsSync(join(tempDir, ".claude"))).toBe(false);
    });
  });
});
