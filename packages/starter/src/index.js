export { prepareAiResources } from "./prepare-ai-resources.js";
export {
  bundledScaffoldingDir,
  createProject,
  defaultScaffoldTemplate,
  listScaffoldTemplates
} from "./create-project.js";
export { bundledDocsDir, defaultDocsOutputDir, syncDocs } from "./sync-docs.js";
export { defaultAgentsFile, syncAgentsGuidance } from "./sync-agents.js";
export {
  bundledSkillsDir,
  defaultProjectSkillsDir,
  defaultProjectSkillsDirs,
  syncBundledSkills
} from "./sync-skills.js";
export {
  defaultClaudeMemoryFile,
  syncClaudeCodeMemory
} from "./sync-claude.js";
export { syncLocalGitExclude } from "./sync-git-exclude.js";
