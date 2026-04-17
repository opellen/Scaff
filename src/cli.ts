#!/usr/bin/env node

import { resolve } from "node:path";
import { existsSync } from "node:fs";
import { install, dryRun } from "./installer.js";
import type { ScaffConfig } from "./templates.js";
import { PLATFORM_IDS, DEFAULT_PLATFORM, isValidPlatform } from "./platforms/index.js";
import { showWelcome } from "./ui/welcome.js";
import { selectPlatforms } from "./prompts/platform-select.js";
import { t } from "./i18n/index.js";
import chalk from "chalk";
import { brand } from "./ui/colors.js";
import { extend } from "./extend.js";

function printUsage(): void {
  console.log(`
scaff — Lightweight context scaffolding for AI coding

Usage:
  scaff init [options]
  scaff extend <path> [--force] [--root <dir>]

Options:
  --docs <dir>      Documentation directory (default: docs)
  --codebase <dir>  Codebase directory (default: .)
  --tools <list>    Target platforms: comma-separated, or "all" (default: claude)
                    Available: ${PLATFORM_IDS.join(", ")}
  --no-subagent     Disable subagent delegation (enabled by default)
  --root <dir>      Target directory (default: cwd)
  --force           Overwrite existing files without prompting
  --dry-run         Preview without writing files
  -h, --help        Show this help

Commands:
  init              Install scaff into the current project
  extend <path>     Install a local extension (reads <path>/scaff-extend.yml)
`);
}

function parseArgs(argv: string[]): {
  command: string | null;
  positional: string[];
  docsDir: string;
  codebaseDir: string;
  tools: string[] | null;
  subagent: boolean;
  root: string;
  force: boolean;
  dryRun: boolean;
  help: boolean;
} {
  let command: string | null = null;
  const positional: string[] = [];
  let docsDir = "docs";
  let codebaseDir = ".";
  let tools: string[] | null = null;
  let subagent = true;
  let root = process.cwd();
  let force = false;
  let isDryRun = false;
  let help = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "-h" || arg === "--help") {
      help = true;
    } else if (arg === "--docs") {
      const next = argv[++i];
      if (!next) {
        console.error("Error: --docs requires a directory path");
        process.exit(1);
      }
      docsDir = next;
    } else if (arg === "--codebase") {
      const next = argv[++i];
      if (!next) {
        console.error("Error: --codebase requires a directory path");
        process.exit(1);
      }
      codebaseDir = next;
    } else if (arg === "--tools") {
      const next = argv[++i];
      if (!next) {
        console.error("Error: --tools requires a platform list");
        process.exit(1);
      }
      if (next === "all") {
        tools = [...PLATFORM_IDS];
      } else {
        tools = next.split(",").map((id) => id.trim());
        for (const id of tools) {
          if (!isValidPlatform(id)) {
            console.error(`Error: unknown platform "${id}". Available: ${PLATFORM_IDS.join(", ")}`);
            process.exit(1);
          }
        }
      }
    } else if (arg === "--no-subagent") {
      subagent = false;
    } else if (arg === "--force") {
      force = true;
    } else if (arg === "--dry-run") {
      isDryRun = true;
    } else if (arg === "--root") {
      const next = argv[++i];
      if (!next) {
        console.error("Error: --root requires a directory path");
        process.exit(1);
      }
      root = resolve(next);
    } else if (!arg.startsWith("-")) {
      if (command === null) {
        command = arg;
      } else {
        positional.push(arg);
      }
    } else {
      console.error(`Unknown option: ${arg}`);
      printUsage();
      process.exit(1);
    }
  }

  return { command, positional, docsDir, codebaseDir, tools, subagent, root, force, dryRun: isDryRun, help };
}

async function runExtend(args: {
  positional: string[];
  root: string;
  force: boolean;
}): Promise<void> {
  const extPath = args.positional[0];
  if (!extPath) {
    console.error("Error: scaff extend requires a path argument");
    printUsage();
    process.exit(1);
  }
  const resolvedExt = resolve(extPath);
  if (!existsSync(resolvedExt)) {
    console.error(`Error: extension path does not exist: ${resolvedExt}`);
    process.exit(1);
  }
  if (!existsSync(args.root)) {
    console.error(`Error: target directory does not exist: ${args.root}`);
    process.exit(1);
  }

  try {
    const result = await extend(resolvedExt, {
      force: args.force,
      root: args.root,
    });

    if (result.commandsAdded.length > 0) {
      console.log(
        `${chalk.green("\u2713")} Commands added: ${result.commandsAdded.join(", ")}`,
      );
    }
    if (result.commandsSkipped.length > 0) {
      console.log(
        `${chalk.yellow("~")} Commands skipped: ${result.commandsSkipped.join(", ")}`,
      );
    }
    if (result.hooksApplied.length > 0) {
      console.log(
        `${chalk.green("\u2713")} Hooks applied: ${result.hooksApplied.join(", ")}`,
      );
    }
    if (result.dependenciesChecked.length > 0) {
      console.log(`${chalk.green("\u2713")} Dependencies: all found`);
    }
    process.exit(0);
  } catch (err) {
    console.error(`Error: ${(err as Error).message}`);
    process.exit(1);
  }
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (args.help || !args.command) {
    printUsage();
    process.exit(args.help ? 0 : 1);
  }

  if (args.command === "extend") {
    await runExtend(args);
    return;
  }

  if (args.command !== "init") {
    console.error(`Unknown command: ${args.command}`);
    printUsage();
    process.exit(1);
  }

  if (!existsSync(args.root)) {
    console.error(`Error: target directory does not exist: ${args.root}`);
    process.exit(1);
  }

  let tools: string[];
  if (args.tools) {
    tools = args.tools;
  } else if (process.stdin.isTTY && !args.dryRun) {
    await showWelcome();
    tools = await selectPlatforms(args.root);
  } else {
    tools = [DEFAULT_PLATFORM];
  }

  const config: ScaffConfig = {
    tools,
    subagent: args.subagent,
    root: args.root,
    docsDir: args.docsDir,
    codebaseDir: args.codebaseDir,
    force: args.force,
  };

  if (args.dryRun) {
    const result = dryRun(config);
    console.log(t("cli.dryRun") + "\n");
    for (const file of result.files) {
      console.log(`  ${chalk.green("+")} ${file}`);
    }
    return;
  }

  const result = await install(config);
  console.log(t("cli.complete") + "\n");

  if (result.files.length > 0) {
    console.log(t("cli.installed"));
    for (const file of result.files) {
      console.log(`  ${chalk.green("+")} ${file}`);
    }
  }

  if (result.skipped.length > 0) {
    console.log("\n" + t("cli.skipped"));
    for (const file of result.skipped) {
      console.log(`  ${chalk.yellow("~")} ${file}`);
    }
  }

  console.log("\n" + brand(t("cli.nextSteps")));
  console.log("  " + chalk.dim("1.") + " " + t("cli.step1"));
  console.log("  " + chalk.dim("2.") + " " + t("cli.step2").replace("{cmd}", brand("/scaff:scout")));

  process.exit(0);
}

main();
