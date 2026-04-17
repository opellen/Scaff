import type { PlatformAdapter } from "./types.js";
import { stripFrontmatter } from "./yaml.js";

export const roocode: PlatformAdapter = {
  id: "roocode",
  displayName: "RooCode",
  configDir: ".roo",
  commandPath: (name) => `.roo/commands/scaff-${name}.md`,
  formatCommand: (body, meta) => {
    const stripped = stripFrontmatter(body);
    return `# scaff-${meta.name}\n\n${meta.description}\n\n${stripped}`;
  },
};
