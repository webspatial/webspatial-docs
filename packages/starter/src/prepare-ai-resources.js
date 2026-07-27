import path from "node:path";
import { syncAgentsGuidance } from "./sync-agents.js";
import { syncClaudeCodeMemory } from "./sync-claude.js";
import { defaultDocsOutputDir, syncDocs } from "./sync-docs.js";
import { syncLocalGitExclude } from "./sync-git-exclude.js";
import { defaultProjectSkillsDirs, syncBundledSkills } from "./sync-skills.js";

export const defaultDocsDirName = defaultDocsOutputDir;

export async function prepareAiResources(options = {}) {
  const projectDir = path.resolve(options.projectDir ?? process.cwd());
  const docs = await syncDocs({
    projectDir,
    outDir: defaultDocsDirName
  });
  const skills = await syncBundledSkills({
    projectDir,
    skillsDirs: defaultProjectSkillsDirs
  });
  const agents = await syncAgentsGuidance({
    projectDir
  });
  const claude = await syncClaudeCodeMemory({
    projectDir
  });
  const gitExclude = await syncLocalGitExclude({
    projectDir
  });

  return {
    projectDir,
    actions: [
      {
        kind: "docs",
        label: "Synced bundled WebSpatial docs",
        outputDir: docs.outputDir,
        fileCount: docs.fileCount
      },
      {
        kind: "skills",
        label: "Synced project-local agent skills",
        outputDir: skills.skillsRootDir,
        outputDirs: skills.skillsRootDirs,
        fileCount: skills.fileCount,
        skillCount: skills.skillCount,
        syncedSkills: skills.syncedSkills
      },
      {
        kind: "agents",
        label: "Updated AGENTS.md with WebSpatial guidance",
        outputDir: projectDir,
        fileCount: agents.fileCount,
        agentsPath: agents.agentsPath,
        fileCreated: agents.fileCreated,
        fileUpdated: agents.fileUpdated
      },
      {
        kind: "claude",
        label: "Synced Claude Code project memory",
        outputDir: claude.memoryDir,
        fileCount: claude.fileCount,
        importedMemoryPath: claude.importedMemoryPath,
        rootMemoryPath: claude.rootMemoryPath,
        rootMemoryCreated: claude.rootMemoryCreated,
        rootMemoryUpdated: claude.rootMemoryUpdated
      },
      {
        kind: "git-exclude",
        label: "Updated local Git exclude for hidden WebSpatial resources",
        outputDir: projectDir,
        fileCount: gitExclude.fileCount,
        excludePath: gitExclude.excludePath,
        skipped: gitExclude.skipped,
        fileCreated: gitExclude.fileCreated ?? false,
        fileUpdated: gitExclude.fileUpdated ?? false
      }
    ]
  };
}
