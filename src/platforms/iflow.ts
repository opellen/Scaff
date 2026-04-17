import type { PlatformAdapter, CommandMeta } from "./types.js";
import {
  stripFrontmatter,
  yamlFrontmatter,
  type YamlFieldValue,
} from "./yaml.js";

export const iflow: PlatformAdapter = {
  id: "iflow",
  displayName: "iFlow",
  configDir: ".iflow",
  commandPath: (name) => `.iflow/commands/scaff-${name}.md`,
  formatCommand: (body, meta: CommandMeta) => {
    const stripped = stripFrontmatter(body);
    const fields: Record<string, YamlFieldValue> = {
      name: `/scaff-${meta.name}`,
      id: `scaff-${meta.name}`,
    };
    if (meta.category) fields.category = meta.category;
    fields.description = meta.description;
    return yamlFrontmatter(fields) + stripped;
  },
};
