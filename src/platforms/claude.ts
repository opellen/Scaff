import type { PlatformAdapter } from "./types.js";

export const claude: PlatformAdapter = {
  id: "claude",
  displayName: "Claude Code",
  configDir: ".claude",
  commandPath: (name) => `.claude/commands/scaff/${name}.md`,
  formatCommand: (body) => body,
};
