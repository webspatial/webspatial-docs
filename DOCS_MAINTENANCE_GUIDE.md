# Docs Maintenance Guide

## Purpose

Use this guide when maintaining:

- latest docs
- localized latest docs
- legacy `1.0.x` docs
- the AI-facing starter docs mirror in `packages/starter/docs/`
- the AI-facing starter guidance and skills in `packages/starter/`
- redirects between latest and legacy docs
- doc links, slugs, and category metadata

Do not reintroduce duplicate unpublished docs source trees. The published source directories in this repository are the only docs source of truth.

## Current Docs Topology

Latest docs:

- English: `docs/`
- Simplified Chinese: `i18n/zh-Hans/docusaurus-plugin-content-docs/current/`

Legacy docs:

- English: `versioned_docs/version-1.0.x/`
- Simplified Chinese: `i18n/zh-Hans/docusaurus-plugin-content-docs/version-1.0.x/`

Starter AI-facing mirror and guidance:

- English docs mirror for local agent use: `packages/starter/docs/`
- scaffolding templates: `packages/starter/scaffolding/**`
- project guidance source: `packages/starter/src/project-guidance.js`
- Agent skills: `packages/starter/skills/**`

Docs structure and routing config:

- top-level docs navigation: `sidebars.ts`
- latest category metadata: `docs/**/_category_.json`
- localized latest category metadata: `i18n/zh-Hans/docusaurus-plugin-content-docs/current/**/_category_.json`
- legacy version config: `docusaurus.config.ts`, `versions.json`, `versioned_sidebars/version-1.0.x-sidebars.json`
- legacy doc metadata override: `src/theme/DocItem/Metadata/index.tsx`
- docs root redirects: `src/pages/docs.tsx`, `src/pages/docs/introduction.tsx`
- legacy introduction fallback redirects: `src/pages/docs/introduction/**/index.tsx`
- legacy non-introduction fallback redirects: `src/theme/NotFound/Content/index.tsx`
- host-level redirects: `static/_redirects`

Generated files such as `.docusaurus/**` are useful for debugging but are not source of truth. Do not edit them by hand.

## Canonical Structure

The canonical latest docs structure is the current English published tree in `docs/`.

`packages/starter/docs/` is a required AI-facing mirror of the latest English docs tree. It is not an independent authoring source.

Current top-level latest sections:

1. `introduction/`
2. `concepts/`
3. `how-to/`
4. `api/`

Rules:

- Keep the latest Chinese docs structurally aligned with English unless there is an explicit product decision to diverge.
- Keep matching file paths between `docs/` and `i18n/zh-Hans/.../current/`.
- Keep matching file paths between `docs/` and `packages/starter/docs/`.
- Keep matching `sidebar_position` values between locales.
- Keep matching `_category_.json` structural fields between locales.
- Only localize visible strings such as `label` and `description`. Do not casually change slugs or directory names.
- Keep the Chinese locale key, localized docs directory, and `localeConfigs['zh-Hans'].path` aligned on `zh-Hans`.
- Keep `localeConfigs['zh-Hans'].htmlLang` explicit. Do not rely on `htmlLang` to infer the i18n directory path.
- Keep `packages/starter/docs/` semantically equivalent to `docs/`. The only allowed differences are the Markdown-format adaptations needed for GitHub rendering and path/link fixes required by that mirror format.

## Sidebar And Docs Card Icon Rules

Sidebar category icons and generated-index card icons are a shared system.

Current implementation:

- shared icon source of truth: `src/theme/_components/docsCategoryIcons.tsx`
- desktop docs sidebar category rendering: `src/theme/DocSidebarItem/Category/index.tsx`
- generated-index cards: `src/theme/DocCard/index.tsx`
- generated-index link-card summary source: `item.description ?? doc?.description` from `src/theme/DocCard/index.tsx`

Rules:

- Keep icon mapping path-based, not label-based.
- Do not key icon logic off localized labels such as `Introduction` vs `简介`.
- When adding or renaming docs sections, update icon mapping using canonical docs path segments such as `introduction`, `concepts`, `how-to`, `api`, `react-sdk`, and `css-api`.
- Keep English and Chinese `_category_.json` slugs structurally aligned so the shared icon mapping continues to work in both locales.
- Do not reintroduce emoji-driven card icons or title hacks as the primary icon system.
- Do not rely on Docusaurus default doc-card emoji fallback for docs index cards.
- Generated-index category cards should render the category's own shared icon.
- Generated-index link cards that point to docs pages should inherit the parent category icon, not a generic document icon.
- Every latest doc that appears as a generated-index link card must have an explicit one-sentence `description` in frontmatter.
- Keep those per-doc `description` values localized and aligned between `docs/` and `i18n/zh-Hans/.../current/`.
- Do not rely on Docusaurus excerpt extraction for card summaries. In this repo it can degrade to placeholder text such as `Summary`, `概述`, or malformed slug fragments.
- When adding a new doc under a category that has a generated-index page, treat writing its card summary as part of the required doc authoring work, not as optional polish.

Hydration caveat:

- Some sidebar categories do not have an explicit `href`, such as `Introduction`.
- For those categories, icon selection must use the sidebar item's stable fallback link from `getCategoryIconHref()` instead of relying on the client-hydrated rendered `href`.
- If you use the rendered `href` directly, the icon can appear during SSR and disappear after hydration.

If icons regress, debug in this order:

1. Confirm the canonical docs path segments did not change.
2. Confirm `src/theme/_components/docsCategoryIcons.tsx` still maps those path segments.
3. Confirm sidebar categories still call `getCategoryIconHref()` when choosing icons.
4. Confirm `src/theme/DocCard/index.tsx` still uses shared icons for both category cards and doc-link cards.
5. Only after that, inspect spacing or visual styles in `src/theme/DocSidebarItem/Category/styles.module.css` and `src/theme/DocCard/styles.module.scss`.

## Current URL Model

Latest docs:

- English base: `/docs`
- Chinese base: `/zh-Hans/docs`

Legacy docs:

- English base: `/docs/1.0.x`
- Chinese base: `/zh-Hans/docs/1.0.x`

Current routing intent:

- latest owns naked docs URLs
- legacy is only under `1.0.x`
- if a route exists in both latest and legacy, latest wins
- if a naked route exists only in legacy, it redirects to the matching legacy `1.0.x` URL

This split must remain stable unless the whole docs versioning strategy is intentionally redesigned.

## Local Development and Locale Testing

Do not use local dev-server behavior as evidence that production routing is broken.

Current behavior:

- `pnpm start` serves only the default locale `en`
- visiting `/zh-Hans/...` on that English dev server returns the SPA shell and then client-side `Page Not Found`
- test Chinese locally with `pnpm start:zh` or `pnpm docusaurus start --locale zh-Hans`
- production `pnpm build` includes both locales in one static output

Cloudflare Pages note:

- for root-path deployment, use `pnpm build` with output directory `build`
- `pnpm build:test` is for subpath testing and should not be used for the normal root deployment

## Homepage Theme Rules

The homepage is a special case and must not be maintained like normal docs pages.

Current intent:

- the homepage must always render in dark mode, including navbar, logo, search button, Algolia modal, modal footer, and search results
- this dark rendering must not overwrite the site's persisted user theme choice
- all non-homepage pages must continue following the persisted site theme
- the homepage navbar must hide the color mode toggle
- other pages must keep the color mode toggle and continue updating the persisted theme normally

Current implementation:

- the homepage temporarily forces Docusaurus's effective color mode to `dark` from inside the `Layout` subtree in `src/pages/index.tsx`
- this is done with `setColorMode('dark', {persist: false})` on mount and restoring the previous `colorModeChoice` on unmount
- this approach is intentional because it makes the whole Docusaurus/Algolia stack use the normal dark-mode code paths instead of homepage-only CSS patches
- the homepage navbar still has route-aware dark treatment in `src/theme/Navbar/Layout/index.tsx` and `src/theme/Navbar/Logo/index.tsx` to keep first paint and logo behavior aligned with the dark homepage design
- the homepage color mode toggle is hidden in `src/theme/Navbar/Content/index.tsx`

Do not:

- reintroduce homepage-specific Algolia `DocSearch` dark-mode patches as the primary solution
- force homepage search button, modal, footer, or result text colors one selector at a time when the real problem is that the homepage is not using dark effective theme
- call `setColorMode('dark')` without disabling persistence; that would overwrite the user's actual site preference
- show the color mode toggle on the homepage unless the homepage theme model is intentionally redesigned

If this area regresses, debug in this order:

1. Confirm the homepage still mounts the temporary non-persisted dark effective mode inside `Layout`.
2. Confirm leaving the homepage restores the previous `colorModeChoice`.
3. Confirm the homepage toggle is hidden and other pages still persist user theme changes.
4. Only after that, inspect component-level CSS overrides.

## Latest Entry Rules

`Getting Started` must remain a normal child page inside `Introduction`.

Current behavior:

- latest entry doc: `docs/introduction/getting-started.md`
- localized latest entry doc: `i18n/zh-Hans/docusaurus-plugin-content-docs/current/introduction/getting-started.md`
- `/docs` redirects to `/docs/introduction/getting-started`
- `/docs/introduction` redirects to `/docs/introduction/getting-started`
- `/zh-Hans/docs` redirects to `/zh-Hans/docs/introduction/getting-started`
- `/zh-Hans/docs/introduction` redirects to `/zh-Hans/docs/introduction/getting-started`

Do not:

- turn `Getting Started` into the category index
- consume `/docs` directly with the page slug
- remove the redirect entry model without updating both redirect layers

## Legacy Rules

Legacy docs are the published `1.0.x` version, not a separate docs tree.

Rules:

- maintain legacy English in `versioned_docs/version-1.0.x/`
- maintain legacy Chinese in `i18n/zh-Hans/docusaurus-plugin-content-docs/version-1.0.x/`
- keep legacy Chinese content body aligned with the English legacy source unless there is an explicit decision to translate old docs
- keep legacy reachable only under `/docs/1.0.x/...` and `/zh-Hans/docs/1.0.x/...`
- keep `banner: 'unmaintained'`
- do not set `noIndex` for legacy docs
- keep legacy internal links relative whenever possible so they stay inside `1.0.x`
- do not add absolute `/docs/...` links inside legacy doc bodies unless the intent is to jump to latest
- keep the warning admonition at the top of every legacy page:
  - English legacy links to `/docs/`
  - Chinese legacy also authors the link as `/docs/` so Docusaurus can localize it correctly
- keep the centralized legacy metadata notice in `src/theme/DocItem/Metadata/index.tsx` so search engines and AI-oriented crawlers can see that the page is outdated and should defer to the latest docs
- if you add or resync legacy files, reapply that admonition after the frontmatter

## Redirect Architecture

There are two redirect layers.

### 1. Host-level redirects

Defined in `static/_redirects`.

Current behavior:

- docs roots redirect to latest `Getting Started`
- legacy-only naked routes redirect to matching `1.0.x` URLs
- both slash and no-slash forms are covered for the explicit rules that exist

### 2. Client-side fallback redirects

Current behavior:

- `src/pages/docs.tsx` and `src/pages/docs/introduction.tsx` handle docs-root entry redirects
- `src/pages/docs/introduction/**/index.tsx` handles legacy introduction naked URLs that would otherwise collide with latest introduction routes
- `src/theme/NotFound/Content/index.tsx` catches legacy non-introduction naked URLs under:
  - `/docs/core-concepts`
  - `/docs/development-guide`
  - `/docs/quick-example`
  - and their `/zh-Hans/docs/...` equivalents

These two layers must stay aligned.

If you change legacy route coverage, update both:

- `static/_redirects`
- the fallback redirect implementation in `src/pages/docs/**` and/or `src/theme/NotFound/Content/index.tsx`

## Avoiding Latest vs Legacy URL Conflicts

This is one of the highest-risk maintenance areas.

Current situation:

- latest top-level sections are `introduction`, `concepts`, `how-to`, `api`
- old naked legacy namespaces are `core-concepts`, `development-guide`, `quick-example`, plus old `introduction/*` pages

Rules:

- do not add a new latest section or page tree under `/docs/core-concepts`, `/docs/development-guide`, or `/docs/quick-example` unless you intentionally redesign the legacy redirect strategy
- do not add latest pages under old naked introduction legacy paths without checking:
  - `static/_redirects`
  - `src/pages/docs/introduction/**/index.tsx`
- when changing legacy slugs, audit every matching redirect entry
- when changing latest slugs, audit whether any old naked legacy route now collides or stops colliding

In short: every docs IA change must be checked against legacy redirect ownership.

## Trailing Slash Rules

The site config uses `trailingSlash: false`.

Implications:

- canonical internal doc URLs should be treated as no-trailing-slash URLs
- do not rely on generic slash/no-slash compatibility for every page
- explicit redirects exist for some paths, but not for every possible docs URL variant

Authoring rules:

1. Prefer relative links between docs pages.
2. For absolute internal links, use canonical no-slash URLs such as:
   - `/docs/introduction/getting-started`
   - `/docs/api/react-sdk`
   - `/docs/1.0.x/core-concepts`
   - `/zh-Hans/docs/introduction/getting-started`
3. Do not hand-author internal absolute links with a trailing slash unless the redirect is explicitly intended and already covered.
4. Docs roots such as `/docs` and `/zh-Hans/docs` are special entry points; prefer the canonical target page in authored content instead of relying on those redirects.

Important note:

- Some generated category metadata may serialize URLs with a trailing slash for generated indexes.
- Do not treat those generated strings as authoring guidance.
- In docs content and redirect code, prefer the canonical no-slash form unless the implementation explicitly requires otherwise.

## Multilingual Maintenance Workflow

When updating latest docs:

1. Update English latest in `docs/`.
2. Mirror the same structure and metadata in Chinese latest under `i18n/zh-Hans/.../current/`.
3. Mirror the same doc changes in `packages/starter/docs/`.
4. Keep `packages/starter/docs/` equivalent to `docs/`:
   - same relative path
   - same doc set
   - same meaning and requirements
   - only GitHub-rendering adaptations are allowed
5. Localize visible content, titles, labels, and descriptions as needed.
6. Keep structural parity:
   - same relative path
   - same category layout
   - same sidebar ordering
   - same redirect expectations
7. Review whether the docs change also requires updates in AI-facing starter guidance:
   - `packages/starter/src/project-guidance.js`
   - `packages/starter/skills/**`
8. If any doc path, heading, heading id, command name, package name, or recommended workflow changed, update any affected links, references, or instructions in those starter guidance files.
9. If the changed docs affect how a Web project installs, initializes, or integrates WebSpatial SDK, update the starter scaffold and setup guidance in the same maintenance pass:
   - `packages/starter/scaffolding/**`
   - `packages/starter/skills/webspatial-sdk-setup/**`

When updating legacy docs:

1. Update English legacy in `versioned_docs/version-1.0.x/` if the change truly belongs to legacy.
2. Mirror the same file-level change in Chinese legacy under `i18n/zh-Hans/docusaurus-plugin-content-docs/version-1.0.x/`.
3. Keep the Chinese legacy body aligned with the English legacy body unless legacy translation is intentionally introduced later.
4. Preserve or reapply the Chinese warning admonition, but author its latest-docs link as `/docs/` so locale-prefixed builds remain valid.
5. Recheck legacy redirect coverage if any slug or page path changes.

Do not:

- maintain a second unpublished raw docs tree
- make Chinese latest structurally different from English by accident
- treat `packages/starter/docs/` as a separate docs source with its own content decisions
- localize slugs casually
- use one locale as a staging area that diverges from the published tree

## Localized Title Translation Rules

When translating latest Chinese docs, translate visible page titles and section headings into natural Chinese that matches the terminology already used in the localized body copy.

Rules:

- Translate visible titles by function, not by word-for-word literal mapping. Prefer the label that best explains what the section does in context.
- Keep page URLs, file paths, slugs, sidebar ids, heading ids, and code-facing names aligned with English.
- For translated headings, add an explicit English id such as `## 场景类型 {#scene-type}` so fragment links and generated TOC links stay stable.
- If the English source heading would produce a deduplicated id, preserve that deduplicated id in Chinese too. Example: keep `## 类型 {#type-1}` if the English source already uses `#type-1`.
- Do not translate English abbreviations, API naming, command names, option names, component names, property names, or other code identifiers.
- Do not translate English project or tool names such as `WebSpatial`, `WebSpatial Builder`, `Rspack`, and `visionOS`.
- Do not translate `Web App`, `Xxx Runtime`, `Hover Effect`, `App Store`, or the top-level section name `How-to`.
- If a heading mixes protected English terms with descriptive words, translate only the descriptive words. Example: `## 打包版 WebSpatial App {#packaged-webspatial-app}`.
- Prefer Chinese labels that describe function clearly. Examples:
  - `Summary` -> `概述`
  - `Availability` -> `适用范围与设置方式` when the section actually combines applicability, where to set it, and default behavior
  - `Signature` -> `调用形式`
  - `Type Signature` -> `类型定义` when the section shows a type declaration or union/object type shape, not a callable function signature
  - `Event Type Signature` -> `事件类型名称`
  - `Supported Web Projects` -> `支持的 Web 项目`
- After title translation changes, verify that the rendered Chinese TOC shows Chinese labels while the underlying fragment hrefs still use the English ids.

## Localized Markdown and MDX Rules

These are easy to break during translation or regeneration.

Rules:

- use MDX-safe self-closing HTML such as `<br />`; do not use bare `<br>`
- do not assume Docusaurus exposes doc-title anchors automatically
- avoid hand-authored links that append title-style fragments such as `#spatial-scenes` unless the target heading has an explicit matching id
- when in doubt, link to the doc page root instead of a fragile title-anchor fragment

## Markdown and Docusaurus Authoring Rules

When upgrading docs formatting, prefer Docusaurus-native patterns over plain Markdown when they make the page easier to scan or harder to misuse.

### Admonitions

Rules:

- Do not leave semantic guidance as plain Markdown blockquotes such as `> ...` in latest docs. Convert them to Docusaurus admonitions.
- Use `:::info` for background explanations, standards context, and "why this works" clarifications.
- Use `:::tip` for shortcuts, related APIs, optional workflow guidance, and convenience notes.
- Use `:::note` for neutral clarifications that are useful but not risky.
- Use `:::caution` for current limitations, temporary syntax requirements, naming rules that are easy to get wrong, and compatibility constraints.
- In API docs, any note that says a WebSpatial API currently needs a temporary prefix because standardization is incomplete must be wrapped in `:::caution`.
- In `scene-options` docs, Manifest key naming reminders must use `:::caution`, not `:::note`.
- Keep admonition intent aligned between English and Chinese when mirroring latest docs.

### Code Blocks

Rules:

- Prefer fenced code blocks with an accurate language tag such as `js`, `ts`, `json`, `json5`, `css`, `html`, or `bash`.
- Add `title="..."` when the filename or usage context helps the reader understand the snippet quickly.
- Avoid backticks inside code-block title strings. They can break MDX parsing in this repo.
- Use line highlighting such as `{4}` or `{5-8}` only to emphasize the lines the reader must actually notice.
- Recheck line highlights after every code edit so they still point at the intended lines.
- For side-by-side conceptual alternatives that touch different files or different configuration surfaces, prefer sequential headings such as `### Using \`initScene\`` and `### Using the Web App Manifest` instead of tabs.

### Package Manager Install Blocks

Rules:

- For npm package installation examples, use the legacy-compatible Docusaurus package-manager switcher pattern: ```` ```bash npm2yarn ````.
- Write the source command in those blocks as `npm install ...` or `npm install -D ...`.
- In latest docs, do not use `<Tabs>` / `<TabItem>` to group multi-file examples or alternative configuration surfaces.
- If you ever need real `<Tabs>` / `<TabItem>` in this repo, explicitly import them from `@theme/Tabs` and `@theme/TabItem`. Do not assume they are globally available.

### Tables

Rules:

- Prefer Markdown tables for reference-style content such as availability, options, accepted values, checklists, and field-by-field comparisons.
- Use tables when readers need to scan multiple dimensions quickly.
- Do not force long prose into tables when a normal paragraph or list is clearer.

### Layout Conventions

Rules:

- Use Docusaurus formatting upgrades to reduce ambiguity, not to decorate the page.
- Keep repeated structures consistent across related pages, especially in API reference families.
- Mirror meaningful formatting upgrades across English latest and Chinese latest when both locales are maintained together.

## Metadata Rules

Per-page metadata:

- keep `sidebar_position` aligned between locales
- for latest docs that appear on generated-index pages, add an explicit `description` frontmatter string for the card summary
- keep those per-doc `description` strings concise, intentional, and localized between English and Chinese latest docs
- add `title` or `sidebar_label` only when needed by Docusaurus behavior or UX
- keep frontmatter minimal and intentional

Category metadata:

- copy structural fields from the English counterpart
- localize visible strings only
- keep `position`, `collapsed`, `link.type`, and slug strategy aligned

Legacy titles:

- legacy docs rely on explicit `title` frontmatter for stable sidebar labels
- do not remove those titles unless you verify the sidebar still renders correctly

## AI-Facing Content

Legacy docs must stay out of AI-facing outputs such as `static/llms.txt` and `static/llms-full.txt`.

Current design relies on the latest English docs tree in `docs/` as the source for both outputs. Preserve that behavior unless multilingual AI output is intentionally redesigned.

`packages/starter/` is also AI-facing and must stay aligned with the latest English docs:

- `packages/starter/docs/` must remain a GitHub-renderable mirror of `docs/`, not an independent source.
- When a latest English doc changes, update the mirrored file under `packages/starter/docs/` in the same maintenance pass.
- When a latest English doc changes meaning, requirements, package names, APIs, commands, headings, or anchor fragments, audit whether the AI-facing starter guidance also needs updates:
  - `packages/starter/src/project-guidance.js`
  - `packages/starter/skills/**`
- When the latest English docs change the installation, initialization, or integration workflow for WebSpatial SDK, update the starter scaffold and setup guidance in the same maintenance pass:
  - `packages/starter/scaffolding/**`
  - `packages/starter/skills/webspatial-sdk-setup/**`
- If those files reference a docs path or heading fragment, keep those references valid after the docs change.

`static/llms.txt` is the lightweight index file. It should list canonical latest-doc URLs and short descriptions, not inline full doc bodies.

`static/llms-full.txt` is the merged full-context file. It should inline the latest English doc bodies and link back to the canonical source page for each entry.

Legacy docs are still indexable by search engines. The machine-readable outdated notice for legacy pages is handled centrally in `src/theme/DocItem/Metadata/index.tsx`, not by per-file frontmatter duplication.

## Validation Checklist

After docs changes, validate the parts you touched.

Minimum checks:

1. `pnpm build`
2. `pnpm build:test`

If build artifacts look stale or corrupted, run:

```bash
pnpm clear
```

Then rebuild.

Behavior checks:

- `/docs` and `/zh-Hans/docs` redirect to localized `Getting Started`
- `Getting Started` remains a child page under `Introduction`
- `packages/starter/docs/` still matches the changed latest English docs in path and meaning
- generated-index doc cards show intentional summaries, not placeholder text such as `Summary`, `概述`, or slug fragments
- with the persisted site theme set to light, the homepage still renders in dark mode
- with the persisted site theme set to light, the homepage Algolia search button and modal still render in dark mode
- leaving the homepage restores the persisted theme on docs/blog pages
- latest docs resolve at naked docs URLs
- legacy docs resolve only under `1.0.x`
- old naked legacy-only URLs redirect to matching `1.0.x` URLs
- legacy pages show the unmaintained banner
- legacy pages are indexable and expose the outdated/latest-docs guidance in page metadata
- no new latest route conflicts with legacy redirect namespaces
- authored internal links do not rely on accidental trailing-slash behavior
- any affected files in `packages/starter/src/project-guidance.js` and `packages/starter/skills/**` still point at the correct mirrored docs paths and headings
- if SDK installation or initialization docs changed, the affected files in `packages/starter/scaffolding/**` and `packages/starter/skills/webspatial-sdk-setup/**` were updated in the same maintenance pass

If you changed `packages/starter/`, also run:

```bash
cd packages/starter
npm test
```

## Short Version

If you need the shortest reliable workflow:

1. Edit the published docs trees directly.
2. Keep English latest as the structural reference.
3. Keep Chinese latest structurally aligned with English latest.
4. Update `packages/starter/docs/` whenever `docs/` changes.
5. Check whether `packages/starter` guidance and skills also need updates.
6. Treat legacy as `versioned_docs/version-1.0.x/`, not as a separate docs tree.
7. Audit redirects whenever a path or slug changes.
8. Prefer relative links or canonical no-slash internal URLs.
9. Validate build, routing, and starter AI-facing outputs before finishing.
