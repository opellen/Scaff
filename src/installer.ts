import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { join, dirname } from "node:path";
import { resolveTemplates, renderFile, type ScaffConfig } from "./templates.js";

export interface InstallResult {
  files: string[];
  skipped: string[];
}

export type PromptFn = (question: string) => Promise<string>;

function createDefaultPrompt(): { prompt: PromptFn; close: () => void } {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  let closed = false;
  rl.on("close", () => { closed = true; });

  const prompt: PromptFn = (question: string) => {
    if (closed) return Promise.resolve("");
    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        resolve(answer.trim().toLowerCase());
      });
      rl.once("close", () => resolve(""));
    });
  };

  return { prompt, close: () => rl.close() };
}

export async function install(
  config: ScaffConfig,
  prompt?: PromptFn,
): Promise<InstallResult> {
  const defaultPrompt = prompt ? null : createDefaultPrompt();
  const askUser = prompt ?? defaultPrompt!.prompt;
  const entries = resolveTemplates(config);
  const files: string[] = [];
  const skipped: string[] = [];

  let applyAll: "overwrite" | "skip" | null = null;

  try {
    for (const entry of entries) {
      const dst = join(config.root, entry.dst);
      const dir = dirname(dst);

      if (existsSync(dst) && !config.force) {
        if (applyAll === "skip") {
          skipped.push(entry.dst);
          continue;
        }
        if (applyAll !== "overwrite") {
          const answer = await askUser(`  ${entry.dst} already exists. Overwrite? [y/N/a(all)/s(skip all)] `);
          if (answer === "a" || answer === "all") {
            applyAll = "overwrite";
          } else if (answer === "s") {
            applyAll = "skip";
            skipped.push(entry.dst);
            continue;
          } else if (answer !== "y" && answer !== "yes") {
            skipped.push(entry.dst);
            continue;
          }
        }
      }

      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      const content = renderFile(entry, config);
      writeFileSync(dst, content, "utf-8");
      files.push(entry.dst);
    }

    const docsDir = join(config.root, config.docsDir);
    if (!existsSync(docsDir)) {
      mkdirSync(docsDir, { recursive: true });
    }
  } finally {
    defaultPrompt?.close();
  }

  return { files, skipped };
}

export function dryRun(config: ScaffConfig): { files: string[] } {
  const entries = resolveTemplates(config);
  const files = entries.map((e) => e.dst);
  return { files };
}
