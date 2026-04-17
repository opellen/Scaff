import type { PlatformAdapter } from "./types.js";
import { stripFrontmatter, yamlFrontmatter } from "./yaml.js";

export const continueAdapter: PlatformAdapter = {
  id: "continue",
  displayName: "Continue",
  configDir: ".continue",
  commandPath: (name) => `.continue/prompts/scaff-${name}.prompt`,
  formatCommand: (body, meta) => {
    const stripped = stripFrontmatter(body);
    const fm = yamlFrontmatter({
      name: `scaff-${meta.name}`,
      description: meta.description,
      invokable: "true",
    });
    return fm + stripped;
  },
};
