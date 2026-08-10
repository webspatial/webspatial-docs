import fs from "node:fs/promises";
import path from "node:path";

export const defaultClaudeMemoryFile = "CLAUDE.md";

const agentsImport = "@AGENTS.md";

function isSubpath(candidate, base) {
  const relative = path.relative(base, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function assertSafeRootMemoryPath(projectDir, rootMemoryPath) {
  if (!isSubpath(rootMemoryPath, projectDir)) {
    throw new Error("The Claude Code memory file must stay inside the target project.");
  }
}

async function ensureAgentsImport(rootMemoryPath) {
  let content = "";
  let created = false;

  try {
    content = await fs.readFile(rootMemoryPath, "utf8");
  } catch (error) {
    if (!error || typeof error !== "object" || !("code" in error) || error.code !== "ENOENT") {
      throw error;
    }
    created = true;
  }

  const preservedLines = content
    .split("\n")
    .filter(line => line.trim() !== agentsImport)
    .join("\n")
    .trimEnd();
  const nextContent = preservedLines
    ? `${preservedLines}\n\n${agentsImport}\n`
    : `${agentsImport}\n`;
  const changed = nextContent !== content;

  if (changed) {
    await fs.writeFile(rootMemoryPath, nextContent, "utf8");
  }

  return {
    created,
    updated: changed && !created
  };
}

export async function syncClaudeCodeMemory(options = {}) {
  const projectDir = path.resolve(options.projectDir ?? process.cwd());
  const rootMemoryPath = path.resolve(
    projectDir,
    options.memoryFile ?? defaultClaudeMemoryFile
  );

  assertSafeRootMemoryPath(projectDir, rootMemoryPath);

  await fs.mkdir(projectDir, { recursive: true });
  const rootMemory = await ensureAgentsImport(rootMemoryPath);

  return {
    projectDir,
    memoryDir: projectDir,
    rootMemoryPath,
    fileCount: 1,
    rootMemoryCreated: rootMemory.created,
    rootMemoryUpdated: rootMemory.updated
  };
}
