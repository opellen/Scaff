import type { PlatformAdapter } from "./types.js";
import { stripFrontmatter, yamlFrontmatter } from "./yaml.js";

export const codebuddy: PlatformAdapter = {
  id: "codebuddy",
  displayName: "CodeBuddy",
  configDir: ".codebuddy",
  commandPath: (name) => `.codebuddy/commands/scaff/${name}.md`,
  formatCommand: (body, meta) => {
    const stripped = stripFrontmatter(body);
    const fm = yamlFrontmatter({
      name: `scaff:${meta.name}`,
      description: meta.description,
      "argument-hint": "[command arguments]",
    });
    return fm + stripped;
  },
};
