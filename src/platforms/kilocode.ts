import type { PlatformAdapter } from "./types.js";
import { stripFrontmatter } from "./yaml.js";

export const kilocode: PlatformAdapter = {
  id: "kilocode",
  displayName: "Kilo Code",
  configDir: ".kilocode",
  commandPath: (name) => `.kilocode/workflows/scaff-${name}.md`,
  formatCommand: (body) => stripFrontmatter(body),
};
