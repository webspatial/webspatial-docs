# WebSpatial SDK Setup

Use the local docs under `../.webspatial/docs/` as the source of truth for intended WebSpatial usage: package names, config keys, manifest fields, and recommended APIs. Use the installed `@webspatial/*` packages as the source of truth for what this project can actually import. Do not restate the docs from memory when they already cover the answer. Inspect the project first, then read only the matching docs and sections.

## Read This First

- Main onboarding flow: [../.webspatial/docs/introduction/getting-started.md](../.webspatial/docs/introduction/getting-started.md)
- Runtime packages: [Installation -> Step 1: Runtime SDK](../.webspatial/docs/introduction/getting-started.md#step-1-runtime-sdk)
- Optional packaged-app tooling: [Installation -> Step 2 (Optional): Builder](../.webspatial/docs/introduction/getting-started.md#step-2-optional-builder)
- JSX runtime integration: [Set Up Your Project -> Step 1: JSX Runtime](../.webspatial/docs/introduction/getting-started.md#step-1-jsx-runtime)
- Spatial boot integration: [Set Up Your Project -> Step 2: Spatial Boot](../.webspatial/docs/introduction/getting-started.md#step-2-spatial-boot)
- Minimum PWA requirements: [Set Up Your Project -> Step 3: Minimal PWA](../.webspatial/docs/introduction/getting-started.md#step-3-minimal-pwa) and [../.webspatial/docs/how-to/minimal-pwa.md](../.webspatial/docs/how-to/minimal-pwa.md)
- Runtime detection: [../.webspatial/docs/api/react-sdk/dom-api/userAgent.md](../.webspatial/docs/api/react-sdk/dom-api/userAgent.md)

## Variant Docs

Read these only when the project shape requires them:

- JavaScript React without TypeScript: [../.webspatial/docs/how-to/non-ts.md](../.webspatial/docs/how-to/non-ts.md)
- Rspack or Rsbuild: [../.webspatial/docs/how-to/rspack.md](../.webspatial/docs/how-to/rspack.md)
- SSR-enabled React projects: [../.webspatial/docs/how-to/ssr.md](../.webspatial/docs/how-to/ssr.md)
- visionOS simulator or packaged-app workflow: [../.webspatial/docs/how-to/xcode.md](../.webspatial/docs/how-to/xcode.md), [../.webspatial/docs/api/builder/run.md](../.webspatial/docs/api/builder/run.md), [../.webspatial/docs/api/builder/build.md](../.webspatial/docs/api/builder/build.md), [../.webspatial/docs/api/builder/publish.md](../.webspatial/docs/api/builder/publish.md)
- visionOS device testing or App Store submission: [../.webspatial/docs/how-to/app-store-connect.md](../.webspatial/docs/how-to/app-store-connect.md)

## Source Of Truth

Three separate questions, three separate sources:

- What should developers use? The local docs: recommended public APIs, usage patterns, configuration, migration, and compatibility guidance.
- What can this project import? The installed package version and its public exports and `.d.ts` typings. An API that is documented but absent from the installed package is unavailable to this project.
- What will work in the active environment? Documented runtime detection (`navigator.userAgent`) and `<SpatialBoot>` readiness. An API that exists in the installed SDK is not proof that the runtime supports it.

Precedence for usage and semantics: local docs, then the installed package's public typings and exports, then SDK source only to clarify behavior. Precedence for availability: installed exports and typings, then installed version, then the docs' compatibility guidance. Never use SDK source to introduce undocumented or internal APIs.

## Required Workflow

1. Inspect the project before editing:
   - package manager and lockfile
   - installed `@webspatial/react-sdk` version, if present: the range in `package.json`, the resolved version in the lockfile, and `node_modules/@webspatial/react-sdk/package.json`
   - installed `@webspatial/core-sdk` version, if present, in the same places
   - existing WebSpatial configuration: JSX runtime wiring, `<SpatialBoot>` mount, manifest
   - React entrypoints
   - TypeScript vs JavaScript
   - build tool
   - SSR vs client-only
   - whether a Web App Manifest already exists
2. Read the matching sections from the local docs.
3. Before writing WebSpatial code, verify that every API the docs suggest exists in the installed package's public exports and typings. If it does not, follow the version mismatch rule below instead of writing it.
4. Apply the integration with the smallest set of edits that makes the documented requirements true.
5. Validate the result with the project's existing checks when practical.

## Strict Rules

- Treat the local docs as canonical for package names, required config keys, required manifest fields, and recommended APIs.
- Treat the installed package's public exports and typings as canonical for what this project can import. Do not use APIs that the installed version does not export, even when the local docs describe them.
- Version mismatch: if the docs describe an API the installed SDK does not expose, do not write it, do not substitute an internal or deep-imported API, and do not upgrade silently. Report the mismatch and either use the documented API the installed version supports or recommend an explicit upgrade when the task requires the newer API.
- If the project already depends on `@webspatial/*` packages, keep the installed versions unless the task requires an upgrade. Do not use `latest` as a generic fix for compatibility problems.
- Always install both `@webspatial/react-sdk` and `@webspatial/core-sdk` when enabling the runtime SDK.
- Installing `@webspatial/core-sdk` as a dependency is allowed when the local docs require it, but do not import WebSpatial APIs from it directly unless the local docs explicitly tell you to.
- Import only from documented entrypoints that appear in the package's public exports. Do not deep-import internal source files or implementation-only types.
- Do not present experimental entrypoints (for example `@webspatial/react-sdk/experimental`) as stable API. Use them only when the user explicitly asks for the experimental feature, and keep the experimental label in code and explanations.
- Do not add Builder packages or platform runtime packages unless the user explicitly needs packaged-app workflows or a platform without a built-in WebSpatial Runtime.
- Do not invent alternate WebSpatial package names, JSX runtime settings, or manifest keys.
- Do not add demo UI, example scenes, or WebSpatial feature code unless the user asks for an example.
- If the project already has a manifest, patch the missing requirements instead of replacing existing branding, icons, or app metadata.

## Adaptation Guidance

- Preserve the project's existing framework and config style. Keep the documented semantics, but adapt them to the actual file names and config format already in use.
- If the project is TypeScript and not on Rspack/Rsbuild, start from the `jsxImportSource` setup in Getting Started.
- If the project is JavaScript-only, use the non-TypeScript guide. If that guide does not cover the active build tool, infer the equivalent JSX runtime hook from the tool's existing JSX transform configuration.
- If the project uses Rspack or Rsbuild, follow the Rspack guide instead of forcing a `tsconfig`-only solution.
- Mount `<SpatialBoot>` around the app root or the spatial part of the UI, following the Getting Started setup and the SSR guide when the project uses SSR.
- If the project uses SSR, mount `<SpatialBoot>` in client-rendered code at the client boundary shown by the local framework, not necessarily the exact file names from the docs. `SSRProvider` no longer exists; remove it if found.
- If the installed SDK predates `<SpatialBoot>` and does not export it, do not fake the export. Report the mismatch and let the user decide between upgrading and keeping the version-appropriate setup.
- If there are multiple possible config files, edit the one the current scripts and imports actually use.
- If a safe equivalent integration point does not exist, stop and report the exact blocker instead of fabricating an unsupported configuration.

## Validation

- Confirm the dependency declarations are present.
- Confirm every WebSpatial API used by the edits is exported by the installed package's public typings and entrypoints, not only described in the docs.
- Confirm the JSX runtime wiring is present in the active config path.
- Confirm `<SpatialBoot>` is mounted in client-rendered code around the app or the spatial UI.
- Confirm the manifest link exists and the manifest has the minimum required fields.
- Run the project's smallest relevant verification command when available, preferably typecheck or build. A passing typecheck confirms availability in the installed SDK, not support in every runtime.
- In the final summary, cite the local doc files you followed, state the installed `@webspatial/react-sdk` version you verified against, and call out any mismatch between the docs and the installed SDK so the user can audit the changes quickly.
