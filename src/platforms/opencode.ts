import type { PlatformAdapter } from "./types.js";
import { stripFrontmatter, yamlFrontmatter } from "./yaml.js";

export const opencode: PlatformAdapter = {
  id: "opencode",
  displayName: "OpenCode",
  configDir: ".opencode",
  commandPath: (name) => `.opencode/command/scaff-${name}.md`,
  formatCommand: (body, meta) => {
    const stripped = stripFrontmatter(body);
    const fm = yamlFrontmatter({ description: meta.description });
    return fm + stripped;
  },
};
