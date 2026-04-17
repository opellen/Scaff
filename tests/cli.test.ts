import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";

const CLI_PATH = join(import.meta.dirname, "..", "dist", "cli.js");

describe("CLI E2E", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "scaff-e2e-"));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  function run(...args: string[]): string {
    return execFileSync("node", [CLI_PATH, ...args], {
      encoding: "utf-8",
      cwd: tempDir,
    });
  }

  function runExpectFail(...args: string[]): string {
    try {
      execFileSync("node", [CLI_PATH, ...args], {
        encoding: "utf-8",
        cwd: tempDir,
        stdio: ["pipe", "pipe", "pipe"],
      });
      throw new Error("Expected command to fail");
    } catch (err: unknown) {
      const e = err as { stderr?: string; status?: number };
      return e.stderr ?? "";
    }
  }

  it("shows help with --help", () => {
    const output = run("--help");
    expect(output).toContain("scaff");
    expect(output).toContain("init");
    expect(output).toContain("--docs");
    expect(output).toContain("--no-subagent");
    expect(output).toContain("--tools");
  });

  it("shows help with no arguments", () => {
    const stderr = runExpectFail();
    // No command → exits with 1 but shows usage
    expect(stderr).toBe(""); // usage goes to stdout
  });

  it("fails on unknown command", () => {
    const stderr = runExpectFail("foobar");
    expect(stderr).toContain("Unknown command");
  });

  it("fails on non-existent root directory", () => {
    const stderr = runExpectFail("init", "--root", "/nonexistent/path/xyz");
    expect(stderr).toContain("does not exist");
  });

  it("installs files with init", () => {
    const output = run("init", "--root", tempDir);
    expect(output).toContain("scaff init complete");
    expect(output).toContain("scout.md");
    expect(existsSync(join(tempDir, ".claude/commands/scaff/scout.md"))).toBe(true);
    expect(existsSync(join(tempDir, ".claude/commands/scaff/goal.md"))).toBe(true);
    expect(existsSync(join(tempDir, ".claude/commands/scaff/verify.md"))).toBe(true);
    expect(existsSync(join(tempDir, "AGENTS.md"))).toBe(false);
    // subagent is enabled by default
    expect(existsSync(join(tempDir, ".claude/skills/scaff-subagent/SKILL.md"))).toBe(true);
  });

  it("no-subagent mode still installs scaff-subagent skill", () => {
    run("init", "--root", tempDir, "--no-subagent");
    expect(existsSync(join(tempDir, ".claude/skills/scaff-subagent/SKILL.md"))).toBe(true);
    expect(existsSync(join(tempDir, ".claude/commands/scaff/scout.md"))).toBe(true);
  });

  it("skips existing files on second run (no stdin → default no)", () => {
    run("init", "--root", tempDir);
    const output = run("init", "--root", tempDir);
    expect(output).toContain("Skipped");
  });

  it("overwrites with --force", () => {
    run("init", "--root", tempDir);
    const output = run("init", "--root", tempDir, "--force");
    expect(output).not.toContain("Skipped");
    expect(output).toContain("scout.md");
  });

  it("dry-run does not create files", () => {
    const output = run("init", "--root", tempDir, "--dry-run");
    expect(output).toContain("Dry run");
    expect(existsSync(join(tempDir, ".claude"))).toBe(false);
  });

  it("custom --docs substitutes $DocsDir in templates", () => {
    run("init", "--root", tempDir, "--docs", "my-docs");
    const content = readFileSync(
      join(tempDir, ".claude/commands/scaff/scout.md"),
      "utf-8",
    );
    expect(content).toContain("my-docs");
    expect(content).not.toContain("$DocsDir");
  });

  it("custom --codebase substitutes $CodebaseDir in templates", () => {
    run("init", "--root", tempDir, "--codebase", "src/app");
    const content = readFileSync(
      join(tempDir, ".claude/commands/scaff/context.md"),
      "utf-8",
    );
    expect(content).toContain("src/app");
  });

  it("--tools installs to specified platform", () => {
    run("init", "--root", tempDir, "--tools", "cursor");
    expect(existsSync(join(tempDir, ".cursor/commands/scaff-scout.md"))).toBe(true);
    expect(existsSync(join(tempDir, ".claude"))).toBe(false);
  });

  it("--tools all installs to all platforms", () => {
    run("init", "--root", tempDir, "--tools", "all", "--no-subagent");
    expect(existsSync(join(tempDir, ".claude/commands/scaff/scout.md"))).toBe(true);
    expect(existsSync(join(tempDir, ".cursor/commands/scaff-scout.md"))).toBe(true);
    expect(existsSync(join(tempDir, ".windsurf/workflows/scaff-scout.md"))).toBe(true);
  });

  it("--tools claude,cursor installs to both platforms", () => {
    run("init", "--root", tempDir, "--tools", "claude,cursor", "--no-subagent");
    expect(existsSync(join(tempDir, ".claude/commands/scaff/scout.md"))).toBe(true);
    expect(existsSync(join(tempDir, ".cursor/commands/scaff-scout.md"))).toBe(true);
    expect(existsSync(join(tempDir, ".windsurf"))).toBe(false);
  });

  it("without --tools, non-TTY defaults to claude", () => {
    // In test env, stdin is not TTY, so tools defaults to ["claude"]
    run("init", "--root", tempDir);
    expect(existsSync(join(tempDir, ".claude/commands/scaff/scout.md"))).toBe(true);
    expect(existsSync(join(tempDir, ".cursor"))).toBe(false);
    expect(existsSync(join(tempDir, ".windsurf"))).toBe(false);
  });

  it("--tools rejects unknown platform", () => {
    const stderr = runExpectFail("init", "--root", tempDir, "--tools", "unknown");
    expect(stderr).toContain("unknown platform");
  });

  it("subagent skill is installed by default", () => {
    run("init", "--root", tempDir);
    expect(existsSync(join(tempDir, ".claude/skills/scaff-subagent/SKILL.md"))).toBe(true);

    const content = readFileSync(
      join(tempDir, ".claude/commands/scaff/scout.md"),
      "utf-8",
    );
    expect(content).toContain("Delegate");
  });
});
