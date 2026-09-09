---
"@webspatial/starter": patch
---

Replace the "local docs always win" rule in the generated agent guidance and the `webspatial-sdk-setup` skill with an explicit source-of-truth hierarchy: local docs define intended public API usage, the installed `@webspatial/*` package exports and typings define what a project can import, and documented runtime detection defines environment support. Adds version-mismatch handling, experimental and internal API rules, and a no-silent-upgrade rule.
