import path from "node:path";
import {
  createProject,
  defaultScaffoldTemplate,
  prepareAiResources
} from "./index.js";

class CliError extends Error {
  constructor(message, exitCode = 1) {
    super(message);
    this.name = "CliError";
    this.exitCode = exitCode;
  }
}

function getGeneralHelp() {
  return [
    "webspatial-starter",
    "",
    "Usage:",
    "  webspatial-starter ai [--project-dir <path>]",
    "  webspatial-starter create [project-dir] [--template <name>]",
    "",
    "Commands:",
    "  ai            Prepare WebSpatial AI resources for a local project.",
    "  create        Scaffold a new WebSpatial web project and prepare its AI resources.",
    "",
    "Run `webspatial-starter <command> --help` for command-specific options."
  ].join("\n");
}

function getAiHelp() {
  return [
    "webspatial-starter ai",
    "",
    "Usage:",
    "  webspatial-starter ai [--project-dir <path>]",
    "",
    "Options:",
    "  --project-dir <path>  Target web project root. Defaults to the current working directory.",
    "  --cwd <path>          Alias of --project-dir.",
    "  -h, --help            Show this help message."
  ].join("\n");
}

function getCreateHelp() {
  return [
    "webspatial-starter create",
    "",
    "Usage:",
    "  webspatial-starter create [project-dir] [--template <name>]",
    "",
    "Options:",
    `  --template <name>     Scaffold template to use. Defaults to ${defaultScaffoldTemplate}.`,
    "  -h, --help            Show this help message."
  ].join("\n");
}

function parseCommandArgs(args, allowedKeys) {
  const options = {};
  const positionals = [];

  for (let index = 0; index < args.length; index += 1) {
    const current = args[index];

    if (current === "-h" || current === "--help") {
      options.help = true;
      continue;
    }

    if (!current.startsWith("--")) {
      positionals.push(current);
      continue;
    }

    if (!allowedKeys.has(current)) {
      throw new CliError(`Unknown option: ${current}`);
    }

    const next = args[index + 1];
    if (!next || next.startsWith("--")) {
      throw new CliError(`Missing value for ${current}`);
    }

    options[current] = next;
    index += 1;
  }

  return {
    options,
    positionals
  };
}

function formatActionLines(projectDir, actions) {
  const lines = [];

  for (const action of actions) {
    const relativeTarget = path.relative(projectDir, action.outputDir) || ".";

    if (action.kind === "template") {
      lines.push(
        `- ${action.label}: ${action.templateName} template, ${action.fileCount} file${action.fileCount === 1 ? "" : "s"} -> ${relativeTarget} (package name: ${action.packageName})`
      );
      continue;
    }

    if (action.kind === "skills") {
      const targets = action.outputDirs
        .map(outputDir => path.relative(projectDir, outputDir))
        .join(", ");
      lines.push(
        `- ${action.label}: ${action.skillCount} skill${action.skillCount === 1 ? "" : "s"}, ${action.fileCount} file${action.fileCount === 1 ? "" : "s"} -> ${targets}`
      );
      continue;
    }

    if (action.kind === "agents") {
      const summary = action.fileCreated
        ? "created AGENTS.md block"
        : action.fileUpdated
          ? "updated AGENTS.md block"
          : "reused existing AGENTS.md block";
      lines.push(
        `- ${action.label}: ${action.fileCount} file${action.fileCount === 1 ? "" : "s"} -> ${relativeTarget} (${summary})`
      );
      continue;
    }

    if (action.kind === "claude") {
      const summary = action.rootMemoryCreated
        ? "created CLAUDE.md"
        : action.rootMemoryUpdated
          ? "updated CLAUDE.md"
          : "reused existing CLAUDE.md";
      lines.push(
        `- ${action.label}: ${action.fileCount} file${action.fileCount === 1 ? "" : "s"} -> ${relativeTarget} (${summary})`
      );
      continue;
    }

    if (action.kind === "git-exclude") {
      if (action.skipped) {
        lines.push(`- ${action.label}: skipped (no Git repository detected)`);
        continue;
      }

      const summary = action.fileCreated
        ? "created local exclude block"
        : action.fileUpdated
          ? "updated local exclude block"
          : "reused existing local exclude block";
      lines.push(`- ${action.label}: ${action.fileCount} file -> .git/info/exclude (${summary})`);
      continue;
    }

    lines.push(`- ${action.label}: ${action.fileCount} file${action.fileCount === 1 ? "" : "s"} -> ${relativeTarget}`);
  }

  return lines;
}

function formatPrepareSuccess(result) {
  return [
    "Prepared WebSpatial AI resources.",
    `Project: ${result.projectDir}`,
    ...formatActionLines(result.projectDir, result.actions)
  ].join("\n");
}

function formatCreateSuccess(result) {
  return [
    "Created WebSpatial project.",
    `Project: ${result.projectDir}`,
    `Template: ${result.templateName}`,
    `Package name: ${result.packageName}`,
    ...formatActionLines(result.projectDir, result.actions),
    "",
    "Next: run `pnpm install` inside the project directory."
  ].join("\n");
}

async function runAiCommand(args, io) {
  const stdout = io.stdout ?? process.stdout;
  const cwd = io.cwd ?? process.cwd();

  if (args.length === 0) {
    const result = await prepareAiResources({ projectDir: cwd });
    stdout.write(`${formatPrepareSuccess(result)}\n`);
    return;
  }

  if (args[0] === "-h" || args[0] === "--help") {
    stdout.write(`${getAiHelp()}\n`);
    return;
  }

  const { options, positionals } = parseCommandArgs(args, new Set(["--project-dir", "--cwd"]));
  if (options.help) {
    stdout.write(`${getAiHelp()}\n`);
    return;
  }

  if (positionals.length > 0) {
    throw new CliError(`Unknown argument: ${positionals[0]}`);
  }

  const projectDir = path.resolve(cwd, options["--project-dir"] ?? options["--cwd"] ?? ".");
  const result = await prepareAiResources({ projectDir });
  stdout.write(`${formatPrepareSuccess(result)}\n`);
}

async function runCreateCommand(args, io) {
  const stdout = io.stdout ?? process.stdout;
  const cwd = io.cwd ?? process.cwd();

  if (args[0] === "-h" || args[0] === "--help") {
    stdout.write(`${getCreateHelp()}\n`);
    return;
  }

  const { options, positionals } = parseCommandArgs(args, new Set(["--template"]));
  if (options.help) {
    stdout.write(`${getCreateHelp()}\n`);
    return;
  }

  if (positionals.length > 1) {
    throw new CliError(`Unknown argument: ${positionals[1]}`);
  }

  const projectDir = path.resolve(cwd, positionals[0] ?? ".");
  const result = await createProject({
    projectDir,
    template: options["--template"] ?? defaultScaffoldTemplate
  });

  stdout.write(`${formatCreateSuccess(result)}\n`);
}

export async function runCli(argv, io = {}) {
  const stdout = io.stdout ?? process.stdout;

  if (argv.length === 0 || argv[0] === "-h" || argv[0] === "--help") {
    stdout.write(`${getGeneralHelp()}\n`);
    return;
  }

  if (argv[0] === "ai") {
    await runAiCommand(argv.slice(1), io);
    return;
  }

  if (argv[0] === "create") {
    await runCreateCommand(argv.slice(1), io);
    return;
  }

  throw new CliError(`Unknown command: ${argv[0]}`);
}
