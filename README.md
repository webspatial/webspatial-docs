# WebSpatial Docs Website

This repository contains the source for the [WebSpatial](https://webspatial.dev) website and documentation site at [webspatial.dev/docs](https://webspatial.dev/docs). It is a Docusaurus 3 project with English and Simplified Chinese docs, a published legacy `1.0.x` docs version, custom theme components, generated AI-facing docs outputs, and the `@webspatial/starter` CLI package for adding local AI resources for WebSpatial to existing web projects or scaffolding new WebSpatial projects.

Before changing docs structure, routing, localized content layout, homepage theme behavior, or legacy version behavior, read [DOCS_MAINTENANCE_GUIDE.md](./DOCS_MAINTENANCE_GUIDE.md). That file is the maintainer source of truth.

## Requirements

- Node.js `>=20.0`
- `pnpm` `9.x`

## Monorepo

This repository is a `pnpm` workspace with two main projects:

- the root Docusaurus website project
- [`packages/starter`](./packages/starter/), the publishable `@webspatial/starter` CLI package

Install dependencies from the repository root:

```bash
pnpm install
```

## Quick Start

Start the default English dev server from the workspace root:

```bash
pnpm install
pnpm start
```

Open <http://localhost:3000>.

Important local-dev behavior:

- `pnpm start` serves only the default `en` locale.
- Use `pnpm start:zh` to test the Simplified Chinese site locally.
- Production builds include both locales.

## Common Commands

| Command | Purpose |
| --- | --- |
| `pnpm start` | Start the default English dev server |
| `pnpm start:zh` | Start the Simplified Chinese dev server |
| `pnpm start:test` | Start the site under `/webspatial-docs/` for subpath testing |
| `pnpm start:test:zh` | Start the Chinese site under `/webspatial-docs/` |
| `pnpm build` | Build the production site for root-path deployment |
| `pnpm build:test` | Build the site for subpath testing |
| `pnpm serve` | Serve the built output locally |
| `pnpm typecheck` | Run TypeScript checks |
| `pnpm clear` | Clear Docusaurus caches and generated artifacts |
| `pnpm generate:llms` | Regenerate `llms.txt` and `llms-full.txt` outputs |
| `pnpm starter:test` | Run the `@webspatial/starter` test suite from the workspace root |
| `pnpm changeset` | Create a release changeset for `@webspatial/starter` |
| `pnpm fix-md-all` | Run Markdown image/link normalization helpers on `docs/` |
| `pnpm check-assets` | Run the asset checker helper |

## Starter CLI

This repo also contains [`@webspatial/starter`](./packages/starter/), a CLI package for scaffolding WebSpatial web projects and preparing local WebSpatial AI resources.

Use `npx @webspatial/starter ...` by default. If you install the package ahead of time, the CLI command name is `webspatial-starter`.

Current commands:

### `create`

```bash
npx @webspatial/starter create my-webspatial-app
# or if you are already inside an empty target directory:
npx @webspatial/starter create
```

If the package is already installed:

```bash
webspatial-starter create my-webspatial-app
# or if you are already inside an empty target directory:
webspatial-starter create
```

This scaffolds the default React + TypeScript + Vite + WebSpatial project template and automatically prepares its local AI resources.

Then install dependencies inside the generated project:

```bash
cd my-webspatial-app
pnpm install
```

### `ai`

```bash
npx @webspatial/starter ai
```

If the package is already installed:

```bash
webspatial-starter ai
```

Current effects:

- sync a hidden local docs mirror into `./.webspatial/docs`
- sync project-local skills into `./.agents/skills` and `./.claude/skills`
- add or update managed WebSpatial guidance in `./AGENTS.md`
- prepare matching WebSpatial guidance in `./CLAUDE.md`
- add `/.webspatial/` to `.git/info/exclude` when the target project is inside a Git repository

Package-local validation:

```bash
pnpm starter:test
```

## Release Flow

The website and the starter package are released through different systems:

- The website is expected to deploy from `main` through the repository's Cloudflare Pages GitHub integration, using the root project and `pnpm build` to produce `build/`.
- `@webspatial/starter` is versioned and published with Changesets and GitHub Actions.

For release-worthy starter changes:

1. Run `pnpm changeset` from the repository root.
2. Select `@webspatial/starter`.
3. Commit the generated changeset file with the code change.

After that changeset reaches `main`, [`.github/workflows/release-starter.yml`](./.github/workflows/release-starter.yml) will open or update the starter release PR. Merging that release PR publishes the new `@webspatial/starter` version to npm when `NPM_TOKEN` is configured in GitHub Actions secrets.

## Docs Topology

Published docs source of truth:

- Latest English docs: `docs/`
- Latest Simplified Chinese docs: `i18n/zh-Hans/docusaurus-plugin-content-docs/current/`
- Legacy English docs: `versioned_docs/version-1.0.x/`
- Legacy Simplified Chinese docs: `i18n/zh-Hans/docusaurus-plugin-content-docs/version-1.0.x/`

Current latest top-level sections:

1. `introduction/`
2. `concepts/`
3. `how-to/`
4. `api/`

Supporting config and routing files:

- Latest sidebar: `sidebars.ts`
- Legacy sidebar: `versioned_sidebars/version-1.0.x-sidebars.json`
- Version config and locale config: `docusaurus.config.ts`
- Host-level redirects: `static/_redirects`
- Docs-root and fallback redirects: `src/pages/docs.tsx`, `src/pages/docs/introduction.tsx`, `src/pages/docs/introduction/**/index.tsx`, `src/theme/NotFound/Content/index.tsx`

Generated output such as `.docusaurus/` and `build/` is useful for debugging, but it is not source of truth and should not be edited by hand.

## Maintenance Rules

Use the full guide for details. The short version:

- Edit the published docs trees directly. Do not create duplicate unpublished docs source trees.
- Treat English latest docs in `docs/` as the structural reference.
- Keep `packages/starter/docs/` aligned with `docs/`. It is an AI-facing mirror, not a separate docs source.
- Keep the Simplified Chinese latest docs structurally aligned with English:
  - same relative paths
  - same category layout
  - same sidebar ordering
  - same `sidebar_position` values
- When updating latest English docs, check whether the same change also requires updates in:
  - `packages/starter/src/project-guidance.js`
  - `packages/starter/skills/**`
- Keep legacy docs under `1.0.x`. Latest owns naked `/docs/...` URLs.
- `Getting Started` must remain a normal child page under `Introduction`.
- Prefer relative links or canonical no-trailing-slash internal URLs.
- When changing slugs, paths, or redirect ownership, update both redirect layers:
  - `static/_redirects`
  - client-side fallback redirect code
- Do not treat local dev-server locale behavior as production routing truth.
- If you touch homepage theme behavior, read the guide first. The homepage dark-mode behavior is intentional and route-specific.

## Repository Layout

- `docs/` - latest English docs
- `i18n/zh-Hans/` - localized docs content and translations
- `versioned_docs/` - published legacy docs sources
- `versioned_sidebars/` - legacy sidebar config
- `packages/starter/` - `@webspatial/starter` workspace package, mirrored docs, templates, AI guidance, and skills
- `src/` - pages, theme overrides, components, styles, and routing logic
- `static/` - static assets, headers, redirects, and generated AI-facing docs files
- `scripts/` - Markdown maintenance helpers
- `plugins/llms/` - LLMS output generation plugin
- `helper/` - auxiliary maintenance scripts

## Validation

After docs, routing, redirect, or localized-structure changes, run at minimum:

```bash
pnpm build
pnpm build:test
```

If artifacts look stale or corrupted:

```bash
pnpm clear
pnpm build
pnpm build:test
```

Recommended behavior checks after docs-IA or routing changes:

- `/docs` and `/zh-Hans/docs` redirect to localized `Getting Started`
- latest docs resolve at naked docs URLs
- legacy docs resolve only under `1.0.x`
- old legacy-only naked routes redirect to matching `1.0.x` URLs
- generated-index cards show intentional summaries instead of placeholder text
- `packages/starter/docs/` still matches the changed latest English docs in path and meaning
- any affected files in `packages/starter/src/project-guidance.js` and `packages/starter/skills/**` still point at the correct mirrored docs paths and headings

If you changed `packages/starter/`, also run:

```bash
pnpm starter:test
```

## Deployment Notes

- For normal Cloudflare Pages root deployment, use `pnpm build` and publish the `build/` directory.
- Cloudflare Pages deployment is expected to be triggered by the repository's GitHub integration on `main`, not by the starter release workflow.
- This repository does not use GitHub Pages deployment.
- Starter publishing is handled separately by [`.github/workflows/release-starter.yml`](./.github/workflows/release-starter.yml).
- `pnpm build:test` is only for subpath testing and should not be used for the normal root deployment.
