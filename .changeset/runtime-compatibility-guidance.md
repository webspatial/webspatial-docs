---
"@webspatial/starter": patch
---

Bundle the new Runtime Compatibility doc and point the generated agent guidance and the `webspatial-sdk-setup` skill at it: keep `@webspatial/*` packages at the same version, and use `WebSpatialRuntime.supports()` for runtime feature checks instead of assuming every documented API is supported by every WebSpatial Runtime.
