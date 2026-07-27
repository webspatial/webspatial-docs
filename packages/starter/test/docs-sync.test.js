import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { runCli } from "../src/cli.js";
import {
  bundledScaffoldingDir,
  bundledDocsDir,
  bundledSkillsDir,
  createProject,
  defaultScaffoldTemplate,
  defaultDocsOutputDir,
  prepareAiResources,
  syncAgentsGuidance,
  syncClaudeCodeMemory,
  syncLocalGitExclude,
  syncBundledSkills,
  syncDocs
} from "../src/index.js";

async function countFiles(dir) {
  let fileCount = 0;
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === ".DS_Store") {
      continue;
    }

    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      fileCount += await countFiles(entryPath);
    } else if (entry.isFile()) {
      fileCount += 1;
    }
  }

  return fileCount;
}

test("prepareAiResources syncs the bundled WebSpatial AI resources into the target project", async () => {
  const projectDir = await fs.mkdtemp(path.join(os.tmpdir(), "webspatial-starter-project-"));
  await fs.mkdir(path.join(projectDir, ".git", "info"), { recursive: true });
  const result = await prepareAiResources({ projectDir });
  const docsAction = result.actions.find(action => action.kind === "docs");
  const skillsAction = result.actions.find(action => action.kind === "skills");
  const agentsAction = result.actions.find(action => action.kind === "agents");
  const claudeAction = result.actions.find(action => action.kind === "claude");

  assert.ok(docsAction);
  assert.ok(skillsAction);
  assert.ok(agentsAction);
  assert.ok(claudeAction);
  const gitExcludeAction = result.actions.find(action => action.kind === "git-exclude");
  assert.ok(gitExcludeAction);
  assert.equal(docsAction.outputDir, path.join(projectDir, defaultDocsOutputDir));
  assert.equal(docsAction.fileCount, await countFiles(bundledDocsDir));
  assert.deepEqual(skillsAction.outputDirs, [
    path.join(projectDir, ".agents", "skills"),
    path.join(projectDir, ".claude", "skills")
  ]);
  assert.equal(skillsAction.fileCount, 3);
  assert.equal(agentsAction.fileCount, 1);
  assert.equal(claudeAction.fileCount, 1);

  const copiedDoc = await fs.readFile(
    path.join(docsAction.outputDir, "introduction", "getting-started.md"),
    "utf8"
  );

  assert.match(copiedDoc, /# Getting Started/);
  const copiedSkill = await fs.readFile(
    path.join(projectDir, ".agents", "skills", "webspatial-sdk-setup", "SKILL.md"),
    "utf8"
  );
  assert.match(copiedSkill, /Use the local docs under/);
  assert.match(copiedSkill, /do not import WebSpatial APIs from it directly/i);
  await fs.access(
    path.join(projectDir, ".claude", "skills", "webspatial-sdk-setup", "SKILL.md")
  );
  await fs.access(
    path.join(
      projectDir,
      ".agents",
      "skills",
      "webspatial-sdk-setup",
      "agents",
      "openai.yaml"
    )
  );
  await assert.rejects(
    fs.access(
      path.join(
        projectDir,
        ".claude",
        "skills",
        "webspatial-sdk-setup",
        "agents"
      )
    ),
    /ENOENT/
  );
  const agentsContent = await fs.readFile(path.join(projectDir, "AGENTS.md"), "utf8");
  assert.match(agentsContent, /Documentation Priority/);
  assert.match(agentsContent, /\.webspatial\/docs\/introduction\/getting-started\.md/);
  assert.match(agentsContent, /Installing it as a dependency when the local docs require it is allowed/);
  const rootClaudeMemory = await fs.readFile(path.join(projectDir, "CLAUDE.md"), "utf8");
  assert.equal(rootClaudeMemory, "@AGENTS.md\n");
  const excludeContent = await fs.readFile(path.join(projectDir, ".git", "info", "exclude"), "utf8");
  assert.match(excludeContent, /\/\.webspatial\//);
});

test("createProject scaffolds the default template and prepares AI resources", async () => {
  const parentDir = await fs.mkdtemp(path.join(os.tmpdir(), "webspatial-starter-create-"));
  const projectDir = path.join(parentDir, "spatial-lab");
  const result = await createProject({ projectDir });
  const templateAction = result.actions.find(action => action.kind === "template");
  const docsAction = result.actions.find(action => action.kind === "docs");

  assert.ok(templateAction);
  assert.ok(docsAction);
  assert.equal(result.templateName, defaultScaffoldTemplate);
  assert.equal(result.packageName, "spatial-lab");
  assert.equal(templateAction.fileCount, await countFiles(path.join(bundledScaffoldingDir, defaultScaffoldTemplate)));

  const generatedPackageJson = JSON.parse(await fs.readFile(path.join(projectDir, "package.json"), "utf8"));
  assert.equal(generatedPackageJson.name, "spatial-lab");

  const generatedManifest = JSON.parse(
    await fs.readFile(path.join(projectDir, "public", "manifest.webmanifest"), "utf8")
  );
  assert.equal(generatedManifest.name, "Spatial Lab");

  const indexHtml = await fs.readFile(path.join(projectDir, "index.html"), "utf8");
  assert.match(indexHtml, /<title>Spatial Lab<\/title>/);

  await fs.access(path.join(projectDir, "src", "App.tsx"));
  await fs.access(path.join(projectDir, ".webspatial", "docs", "introduction", "getting-started.md"));
  await assert.rejects(fs.access(path.join(projectDir, "public", ".DS_Store")), /ENOENT/);
});

test("createProject rejects a non-empty target directory", async () => {
  const projectDir = await fs.mkdtemp(path.join(os.tmpdir(), "webspatial-starter-create-collision-"));
  await fs.writeFile(path.join(projectDir, "keep.txt"), "keep\n", "utf8");

  await assert.rejects(
    createProject({ projectDir }),
    /must be empty or not exist/
  );
});

test("syncDocs removes stale files from a previous sync", async () => {
  const projectDir = await fs.mkdtemp(path.join(os.tmpdir(), "webspatial-starter-stale-"));
  const outputDir = path.join(projectDir, defaultDocsOutputDir);

  await syncDocs({ projectDir });
  await fs.writeFile(path.join(outputDir, "stale-file.md"), "stale\n", "utf8");

  await syncDocs({ projectDir });

  await assert.rejects(
    fs.access(path.join(outputDir, "stale-file.md")),
    /ENOENT/
  );
});

test("syncLocalGitExclude updates .git/info/exclude without touching .gitignore", async () => {
  const projectDir = await fs.mkdtemp(path.join(os.tmpdir(), "webspatial-starter-git-"));
  await fs.mkdir(path.join(projectDir, ".git", "info"), { recursive: true });
  const excludePath = path.join(projectDir, ".git", "info", "exclude");

  await fs.writeFile(excludePath, "# Existing local excludes\n", "utf8");

  await syncLocalGitExclude({ projectDir });
  const firstExclude = await fs.readFile(excludePath, "utf8");
  assert.match(firstExclude, /# Existing local excludes/);
  assert.match(firstExclude, /\/\.webspatial\//);

  await syncLocalGitExclude({ projectDir });
  const secondExclude = await fs.readFile(excludePath, "utf8");
  const markerMatches = secondExclude.match(/webspatial-starter:begin:local-exclude/g) ?? [];
  assert.equal(markerMatches.length, 1);

  await assert.rejects(
    fs.access(path.join(projectDir, ".gitignore")),
    /ENOENT/
  );
});

test("syncDocs rejects output paths outside the target project", async () => {
  const projectDir = await fs.mkdtemp(path.join(os.tmpdir(), "webspatial-starter-safe-"));

  await assert.rejects(
    syncDocs({
      projectDir,
      outDir: "../outside-project"
    }),
    /must stay inside the target project/
  );
});

test("syncBundledSkills targets shared and Claude skill directories", async () => {
  const projectDir = await fs.mkdtemp(path.join(os.tmpdir(), "webspatial-starter-skills-"));
  const customSkillDir = path.join(projectDir, ".agents", "skills", "custom-skill");

  await fs.mkdir(customSkillDir, { recursive: true });
  await fs.writeFile(path.join(customSkillDir, "SKILL.md"), "---\nname: custom\n---\n", "utf8");

  const result = await syncBundledSkills({ projectDir });

  assert.equal(result.skillCount, 1);
  await fs.access(path.join(customSkillDir, "SKILL.md"));
  await fs.access(
    path.join(projectDir, ".agents", "skills", "webspatial-sdk-setup", "SKILL.md")
  );
  await fs.access(
    path.join(projectDir, ".claude", "skills", "webspatial-sdk-setup", "SKILL.md")
  );
  await assert.rejects(
    fs.access(
      path.join(
        projectDir,
        ".claude",
        "skills",
        "webspatial-sdk-setup",
        "agents"
      )
    ),
    /ENOENT/
  );
});

test("syncAgentsGuidance preserves existing AGENTS.md content and updates only the managed block", async () => {
  const projectDir = await fs.mkdtemp(path.join(os.tmpdir(), "webspatial-starter-agents-"));
  const agentsPath = path.join(projectDir, "AGENTS.md");

  await fs.writeFile(agentsPath, "# Existing Agents Notes\n\n- Keep current workflows\n", "utf8");

  await syncAgentsGuidance({ projectDir });
  const firstAgents = await fs.readFile(agentsPath, "utf8");
  assert.match(firstAgents, /# Existing Agents Notes/);
  assert.match(firstAgents, /Documentation Priority/);

  await syncAgentsGuidance({ projectDir });
  const secondAgents = await fs.readFile(agentsPath, "utf8");
  const sectionMatches = secondAgents.match(/webspatial-starter:begin:webspatial-project-guidance/g) ?? [];
  assert.equal(sectionMatches.length, 1);
});

test("syncClaudeCodeMemory preserves existing content and adds the agents import once", async () => {
  const projectDir = await fs.mkdtemp(path.join(os.tmpdir(), "webspatial-starter-claude-"));
  const rootClaudeMemoryPath = path.join(projectDir, "CLAUDE.md");

  await fs.writeFile(
    rootClaudeMemoryPath,
    "# Existing Memory\n\n- Keep current workflows\n",
    "utf8"
  );

  const first = await syncClaudeCodeMemory({ projectDir });
  assert.equal(first.fileCount, 1);

  const firstRootMemory = await fs.readFile(rootClaudeMemoryPath, "utf8");
  assert.equal(
    firstRootMemory,
    "# Existing Memory\n\n- Keep current workflows\n\n@AGENTS.md\n"
  );

  await syncClaudeCodeMemory({ projectDir });
  const secondRootMemory = await fs.readFile(rootClaudeMemoryPath, "utf8");
  const agentsImportMatches = secondRootMemory.match(/@AGENTS\.md/g) ?? [];
  assert.equal(agentsImportMatches.length, 1);
});

test("runCli supports the high-level ai command", async () => {
  const projectDir = await fs.mkdtemp(path.join(os.tmpdir(), "webspatial-starter-cli-"));
  let stdout = "";

  await runCli(["ai", "--project-dir", projectDir], {
    cwd: process.cwd(),
    stdout: {
      write(chunk) {
        stdout += chunk;
      }
    }
  });

  assert.match(stdout, /Prepared WebSpatial AI resources/);
  assert.match(stdout, /\.webspatial\/docs/);
  assert.match(stdout, /\.agents\/skills/);
  assert.match(stdout, /\.claude\/skills/);
  assert.match(stdout, /AGENTS\.md/);
  assert.match(stdout, /CLAUDE\.md/);
  assert.match(stdout, /\.git\/info\/exclude|no Git repository detected/);
});

test("runCli supports the create command", async () => {
  const parentDir = await fs.mkdtemp(path.join(os.tmpdir(), "webspatial-starter-cli-create-"));
  const projectDir = path.join(parentDir, "new-world");
  let stdout = "";

  await runCli(["create", projectDir], {
    cwd: process.cwd(),
    stdout: {
      write(chunk) {
        stdout += chunk;
      }
    }
  });

  assert.match(stdout, /Created WebSpatial project/);
  assert.match(stdout, /Template: vite/);
  assert.match(stdout, /Package name: new-world/);
  assert.match(stdout, /\.webspatial\/docs/);
  assert.match(stdout, /pnpm install/);
});

test("runCli supports create in the current empty directory", async () => {
  const projectDir = await fs.mkdtemp(path.join(os.tmpdir(), "webspatial-starter-cli-create-cwd-"));
  let stdout = "";

  await runCli(["create"], {
    cwd: projectDir,
    stdout: {
      write(chunk) {
        stdout += chunk;
      }
    }
  });

  const generatedPackageJson = JSON.parse(await fs.readFile(path.join(projectDir, "package.json"), "utf8"));
  assert.equal(generatedPackageJson.name, path.basename(projectDir).toLowerCase());
  assert.match(stdout, /Created WebSpatial project/);
  assert.match(stdout, /\.webspatial\/docs/);
});
