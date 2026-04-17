import type { PlatformAdapter } from "./types.js";
import { stripFrontmatter } from "./yaml.js";

export const cline: PlatformAdapter = {
  id: "cline",
  displayName: "Cline",
  configDir: ".cline",
  commandPath: (name) => `.clinerules/workflows/scaff-${name}.md`,
  formatCommand: (body, meta) => {
    const stripped = stripFrontmatter(body);
    return `# scaff-${meta.name}\n\n${meta.description}\n\n${stripped}`;
  },
};
