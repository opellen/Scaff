import type { PlatformAdapter } from "./types.js";
import { stripFrontmatter, yamlFrontmatter } from "./yaml.js";

export const antigravity: PlatformAdapter = {
  id: "antigravity",
  displayName: "Antigravity",
  configDir: ".agent",
  commandPath: (name) => `.agent/workflows/scaff-${name}.md`,
  formatCommand: (body, meta) => {
    const stripped = stripFrontmatter(body);
    const fm = yamlFrontmatter({ description: meta.description });
    return fm + stripped;
  },
};
