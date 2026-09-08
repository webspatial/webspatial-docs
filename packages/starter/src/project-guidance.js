export const webspatialProjectGuidance = `
## WebSpatial

### Agent Resources

- If this repository contains project-local WebSpatial agent resources, prefer them before inventing a workflow from scratch.
- Treat \`.codex/skills/\`, \`.claude/\`, and imported project instruction files as task-routing aids that complement \`.webspatial/docs/\`, not as replacements for the docs.
- Choose the local resource whose scope best matches the task, then verify concrete API and configuration details against \`.webspatial/docs/\` and the installed packages as described below.

### Documentation Priority

1. The \`.webspatial/docs/\` directory in this repository contains the complete WebSpatial documentation, and there is no need to consult online sources.
2. Start with \`.webspatial/docs/introduction/getting-started.md\` and \`.webspatial/docs/concepts/*\`.
   - Use them to understand the WebSpatial model, features, philosophy, platform constraints, setup flow, development workflow, and concepts.
3. Use \`.webspatial/docs/api/\` as the primary API reference.
   - This is the main source for APIs of WebSpatial SDK.
   - Look up APIs by their exact category and name.
   - Note that some APIs have been folded into certain docs as second-level headings.
4. The docs define intended usage: recommended public APIs, supported usage patterns, examples, configuration, migration guidance, and compatibility guidance.
   - They describe the WebSpatial release they were written for. They do not prove that an API exists in the SDK version this project has installed.
   - Compatibility guidance lives in \`.webspatial/docs/introduction/runtime-compatibility.md\`: the recommended \`@webspatial/*\` version set, the \`WebSpatialRuntime.supports()\` feature-detection API, how visionOS and PICO OS 6 runtimes differ, and what happens when SDK and runtime versions do not match. Read it before choosing package versions or relying on a runtime-dependent feature.

### Source Of Truth Hierarchy

Docs define intended usage. Installed package exports define project-level availability. Runtime detection defines environment-level support. Keep these three questions separate:

\`\`\`text
.webspatial/docs/                 -> What should developers use?
Installed @webspatial/* packages  -> What can this project import right now?
Runtime detection                 -> What will work in the active environment?
\`\`\`

- For API usage and semantics, in priority order:
  1. local \`.webspatial/docs/\`
  2. public typings and exports of the installed package version
  3. SDK source, only to clarify behavior when the first two are insufficient, never to introduce undocumented or internal APIs
- For API availability in this project, in priority order:
  1. the installed package's public exports and \`.d.ts\` typings
  2. the installed package version (\`package.json\`, the lockfile, and \`node_modules/@webspatial/<pkg>/package.json\`)
  3. compatibility and version guidance in local docs
  - An API that is documented but absent from the installed package is unavailable to this project.
- For runtime feature availability, use the documented runtime detection, each for its own question:
  - Does the active runtime support a specific feature? \`WebSpatialRuntime.supports(name, tokens?)\` from \`@webspatial/react-sdk\`, per \`.webspatial/docs/introduction/runtime-compatibility.md\`. It returns \`false\` in plain browsers, during SSR, for unknown keys, and for capabilities the detected runtime lacks.
  - Which runtime is the page running in? \`navigator.userAgent\` per \`.webspatial/docs/api/react-sdk/dom-api/userAgent.md\`.
  - Has the spatial implementation finished loading? \`<SpatialBoot>\` readiness (\`onReady\` / \`onError\`) per \`.webspatial/docs/api/react-sdk/react-components/SpatialBoot.md\`. A \`true\` result from \`supports()\` does not mean the spatial implementation is loaded yet.
  - "The API exists in the installed SDK" does not mean "the active runtime supports it". Code that typechecks is not evidence that it works at runtime, and a documented API is not guaranteed to be supported by every WebSpatial Runtime.

### Sources To Avoid

- Do not rely on the documentation and test cases in the \`https://github.com/webspatial/webspatial-sdk\` repository or other older remote WebSpatial documentation.
  - For intended usage and semantics, local \`.webspatial/docs/\` takes precedence over those sources.
  - Those sources do not prove availability either. Only the installed package's public exports and typings show what this project can import.
- Do not treat an implementation that exists in SDK source (for example under \`packages/react/src/...\` in the SDK repository, or \`node_modules/@webspatial/*/src/\` and \`dist/\` internals) as a public API. Verify the documented entrypoint and the package's public export path before importing anything.

### Working Rules For WebSpatial Tasks

- Before changing WebSpatial code, inspect the project: installed \`@webspatial/react-sdk\` and \`@webspatial/core-sdk\` versions, the package manager and lockfile, and existing WebSpatial configuration.
- Confirm each WebSpatial API you plan to use in two places: local docs for intended usage, and the installed package's public exports and typings for availability.
- Prefer exact API names and signatures from local docs over memory or guesswork. Do not invent APIs.
- Import only from documented entrypoints that appear in the installed package's public exports and typings. Do not deep-import internal files, helpers, or implementation-only types.
- Experimental entrypoints (for example a subpath such as \`@webspatial/react-sdk/experimental\`) are not stable SDK API. Use them only when the user explicitly wants the experimental feature, or the task requires it and the local docs identify its status. Keep the experimental label in generated code and explanations.
- Direct use of APIs from \`@webspatial/core-sdk\` is prohibited. Installing it as a dependency when the local docs require it is allowed, but its APIs and source code should otherwise be used solely as reference material for understanding the functionality of the WebSpatial SDK and resolving complex issues.
- If local docs are incomplete, inspect the installed package typings first, then source from:
  - \`@webspatial/react-sdk\`
  - \`@webspatial/builder\`
  - \`@webspatial/platform-visionos\`
  - \`@webspatial/core-sdk\`
  - \`https://github.com/webspatial/webspatial-sdk\`
  - Use these to clarify behavior. Do not let them override documented usage, and do not use them to surface internal APIs.
- If documentation is ambiguous, say so explicitly in the final summary and note which fallback source was used.

### Version Mismatch Behavior

- Docs describe an API the installed SDK does not expose:
  1. Identify the installed SDK version.
  2. Confirm the API is absent from the installed package's public typings and exports.
  3. Do not write code that uses it, and do not substitute an internal, deep-imported, or invented API.
  4. Tell the user there is a version mismatch between the local docs and the installed SDK.
  5. Either use the documented API that the installed version supports, or recommend an SDK upgrade when the task requires the newer API. Do not upgrade automatically unless the task clearly requires or permits it.
  - Example report: "The local WebSpatial docs describe \`SomeNewApi\`, but this project uses an SDK version that does not expose it. I am keeping the current version and using the compatible API / flagging that an SDK upgrade is required."
- Installed package exposes something the local docs do not describe:
  - Do not treat it as a recommended public API by default. Determine whether it is public but undocumented, experimental, deprecated, internal, or newly added.
  - Prefer documented APIs. If using it is necessary, state that the local docs are incomplete for it instead of treating package source as canonical.
- Installed SDK exposes an API the active runtime may not support:
  - Gate the feature with \`WebSpatialRuntime.supports()\` and \`<SpatialBoot>\` readiness instead of assuming support, and render or do something sensible when \`supports()\` returns \`false\`. Do not conclude that an API works because TypeScript accepts it.
  - Mention the runtime dependency in the final summary when it affects the user's target platforms.

### Dependency Changes

- Do not change WebSpatial SDK versions just because the local docs describe a newer API.
- Before changing any \`@webspatial/*\` dependency: inspect the currently installed version, confirm the user's task actually requires the upgrade, check \`.webspatial/docs/introduction/runtime-compatibility.md\`, and otherwise preserve the project's existing version.
- When \`@webspatial/*\` packages are installed or upgraded, keep \`@webspatial/react-sdk\`, \`@webspatial/core-sdk\`, and any \`@webspatial/builder\` and \`@webspatial/platform-visionos\` at the same version, as the compatibility guidance recommends.
- Do not use \`"latest"\` as a generic fix for compatibility problems. When an upgrade is warranted, pin an explicit version and tell the user what changed and why.
`;
