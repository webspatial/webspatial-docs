# `@webspatial/starter`

`@webspatial/starter` is a CLI utilities for adding local AI resources for WebSpatial to existing web projects or scaffolding new WebSpatial projects.

The package currently supports two high-level workflows:

- prepare AI resources inside an existing project
- scaffold a new WebSpatial web project

Today the AI-resource flow syncs bundled WebSpatial docs, agent resources, and project guidance into the project, and the default scaffold is a React + TypeScript + Vite + WebSpatial template.

## Monorepo Development

Inside this repository, `@webspatial/starter` is managed as a `pnpm` workspace package under `packages/starter/`.

Install dependencies from the repository root:

```bash
pnpm install
```

Run the starter test suite from the repository root:

```bash
pnpm starter:test
```

## Usage

Use `npx @webspatial/starter ...` by default. If you install the package ahead of time, the CLI command name is `webspatial-starter`.

### `create`

Create a new project:

```bash
npx @webspatial/starter create my-webspatial-app

# If you are already inside an empty target directory, you can omit the directory name:
npx @webspatial/starter create
```

If the package is already installed:

```bash
webspatial-starter create my-webspatial-app

# If you are already inside an empty target directory, you can omit the directory name:
webspatial-starter create
```

This scaffolds the default bundled template into `./my-webspatial-app` and then automatically runs the equivalent of the `ai` command inside that new project.

Then install dependencies inside the generated project:

```bash
cd my-webspatial-app
pnpm install
```

### `ai`

Run inside an existing target web project:

```bash
npx @webspatial/starter ai
```

If the package is already installed:

```bash
webspatial-starter ai
```

Or target another project directory:

```bash
npx @webspatial/starter ai --project-dir ../my-web-app
```

If the package is already installed:

```bash
webspatial-starter ai --project-dir ../my-web-app
```

By default, the command prepares AI resources in the current project and currently does the following:

- sync the bundled docs into `./.webspatial/docs`
- sync bundled project-local skills into `./.agents/skills` and `./.claude/skills`
- add or update `./AGENTS.md` with managed WebSpatial project guidance
- prepare `./CLAUDE.md` with matching WebSpatial project guidance
- when Git is present, add `/.webspatial/` to `.git/info/exclude`

## Command Reference

### `create`

Scaffolds a new WebSpatial web project and automatically prepares its local AI resources.

Usage:

```bash
npx @webspatial/starter create [project-dir]
```

If the package is already installed:

```bash
webspatial-starter create [project-dir]
```

Options:

- `--template <name>`: Scaffold template to use. Defaults to `vite`.
- `-h`, `--help`: Show help for the command.

Current behavior:

- Creates a new project directory from a bundled scaffold template, or scaffolds into the current working directory when no directory argument is provided.
- Personalizes the generated project name in the template's `package.json`, manifest, and HTML title.
- Runs the same AI-resource preparation flow as `ai` inside the new project.
- Refuses to write into a non-empty target directory.
- Refuses paths that would overlap the package's bundled scaffold source.

### `ai`

Prepares WebSpatial AI resources for a target project directory.

Options:

- `--project-dir <path>`: Project root that should receive the generated WebSpatial AI resources. Defaults to the current working directory.
- `--cwd <path>`: Alias of `--project-dir`.
- `-h`, `--help`: Show help for the command.

Current effects:

- Sync the packaged Markdown docs into `.webspatial/docs`.
- Sync the packaged skills into `.agents/skills` and `.claude/skills`.
- Add or update a managed WebSpatial guidance block in `AGENTS.md`.
- Prepare matching WebSpatial project guidance in `CLAUDE.md`.
- Add a managed `/.webspatial/` rule to `.git/info/exclude` when the project is inside a Git repository.

Behavior:

- The managed docs directory is hidden under `.webspatial/`, so it stays out of the way and does not appear in default `rg` searches.
- The managed docs directory is replaced on every run so stale files do not remain.
- Bundled skills are synced into `.agents/skills` and `.claude/skills` without clearing unrelated user skills.
- Existing `AGENTS.md` content is preserved. The command only inserts or updates its own managed WebSpatial section.
- `CLAUDE.md` is prepared automatically so Claude Code receives the same project guidance as other agents.
- Existing `CLAUDE.md` content is preserved.
- When `.git/` exists, the command updates `.git/info/exclude` instead of editing the tracked `.gitignore`, so `.webspatial/` stays out of Git by default without creating a noisy repo diff.
- The managed output paths must stay inside the chosen project directory.
- The command refuses paths that would overwrite the package's bundled source docs.
- The command refuses paths that would overwrite the package's bundled source skills.
- The command refuses paths that would overwrite the package's bundled Claude resources.

## Release Process

This package is published from the workspace root with Changesets and GitHub Actions.

For release-worthy changes:

1. Run `pnpm changeset` from the repository root.
2. Select `@webspatial/starter`.
3. Commit the generated changeset file with the code change.

After that changeset reaches `main`, the repository workflow `.github/workflows/release-starter.yml` opens or updates the starter release PR. Merging that release PR publishes the new version to npm when `NPM_TOKEN` is configured in GitHub Actions secrets.
