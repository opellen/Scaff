import chalk from "chalk";
import { SCAFF_LOGO, SCAFF_LOGO_HEIGHT, SCAFF_LOGO_WIDTH } from "./ascii-logo.js";
import { t } from "../i18n/index.js";
import { brand, brandInner } from "./colors.js";

export async function showWelcome(): Promise<void> {
  if (!process.stdin.isTTY) return;

  const cols = process.stdout.columns ?? 80;
  const compact = cols < 60;

  const lines = buildScreen(compact);
  process.stdout.write("\n" + lines.join("\n") + "\n\n");

  await waitForEnter();
}

function buildScreen(compact: boolean): string[] {
  const rightLines = [
    brand.bold("Scaff"),
    chalk.dim(t("welcome.tagline")),
    "",
    chalk.dim(t("welcome.setsUp")),
    "  " + chalk.dim("•") + " " + t("welcome.skills"),
    "  " + chalk.dim("•") + " " + t("welcome.commands"),
    "",
    brand(t("welcome.pressEnter")),
  ];

  if (compact) {
    return rightLines;
  }

  const gap = "    ";
  const totalRows = Math.max(SCAFF_LOGO_HEIGHT, rightLines.length);

  const result: string[] = [];
  for (let i = 0; i < totalRows; i++) {
    const logo = i < SCAFF_LOGO_HEIGHT ? colorLogoRow(i) : " ".repeat(SCAFF_LOGO_WIDTH);
    const text = i < rightLines.length ? rightLines[i] : "";
    result.push(logo + gap + text);
  }
  return result;
}

function colorLogoRow(row: number): string {
  const frame = SCAFF_LOGO.frame[row];
  const inner = SCAFF_LOGO.inner[row];
  let result = "";
  for (let j = 0; j < SCAFF_LOGO_WIDTH; j++) {
    const innerCh = inner[j];
    if (innerCh !== " ") {
      result += brandInner(innerCh);
      continue;
    }
    const frameCh = frame[j];
    result += frameCh === " " ? " " : brand(frameCh);
  }
  return result;
}

function waitForEnter(): Promise<void> {
  return new Promise<void>((resolve) => {
    const { stdin } = process;
    const wasRaw = stdin.isRaw ?? false;

    stdin.setRawMode(true);
    stdin.resume();

    const onData = (buf: Buffer): void => {
      const key = buf[0];
      if (key === 0x0d || key === 0x0a) {
        cleanup();
        resolve();
      } else if (key === 0x03) {
        cleanup();
        process.exit(0);
      }
    };

    const cleanup = (): void => {
      stdin.removeListener("data", onData);
      stdin.setRawMode(wasRaw);
      stdin.pause();
    };

    stdin.on("data", onData);
  });
}
