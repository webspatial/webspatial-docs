<!--
sidebar_position: 2
description: 'Pick a matching SDK and runtime version set, and detect at runtime which WebSpatial features the current platform actually supports.'
-->

# Runtime Compatibility

## Summary

A WebSpatial app is made of two moving parts that are versioned separately:

- the [WebSpatial SDK](./getting-started.md#webspatial-sdk) npm packages installed in your web project
- the [WebSpatial Runtime](../concepts/webspatial-app.md#webspatial-runtime) that executes the page on the spatial computing platform

Having an API in the installed SDK does not mean the runtime that is currently running your page implements it. The SDK is deliberately forward-looking: it can ship an API before every runtime supports it, and a runtime can be older or newer than the SDK your page was built with.

This page explains which versions to use together today, how to check feature support at runtime with `WebSpatialRuntime.supports()`, how visionOS and PICO OS differ, and what to do when versions do not match.

> [!NOTE]
> **Scope**
>
> This page describes the current SDK 2.x runtime detection and capability model. It does not describe future runtime architectures.

## Recommended Setup

Install the `latest` npm tag of every WebSpatial package you use, and keep them at the same version. All packages in the WebSpatial SDK repository are released together with one version number, and `@webspatial/react-sdk` declares `@webspatial/core-sdk` as a peer dependency in the same major range.

| Component | Recommended today | Notes |
| --------- | ----------------- | ----- |
| `@webspatial/react-sdk` | `latest` (2.x) | Required. Public entry for all WebSpatial APIs in React projects. |
| `@webspatial/core-sdk` | Same version as `@webspatial/react-sdk` | Required peer dependency. Do not import from it directly. |
| `@webspatial/builder` | Same version as the SDK | Only for [packaged apps](../concepts/webspatial-app.md#packaged-webspatial-app), for example visionOS. |
| `@webspatial/platform-visionos` | Same version as the SDK | Only for visionOS. This package is the visionOS WebSpatial Runtime that Builder bundles into your app. |
| visionOS runtime | Whatever `@webspatial/platform-visionos` version you package with | The runtime ships inside your app bundle, so it is always the version you installed. Xcode and simulator requirements are in [Install Xcode](../how-to/xcode.md). |
| PICO OS 6 runtime | The WebSpatial Runtime built into the [PICO OS 6 emulator](https://developer.picoxr.com/document/spatial-toolkit/learn-about-pico-emulator/) or device | The runtime ships with the OS and is updated by PICO, not by your npm packages. |

At the time of writing, `latest` resolves to `2.0.0` for all four npm packages. Check the version you actually installed with:

```bash title="Check installed WebSpatial packages"
npm ls @webspatial/react-sdk @webspatial/core-sdk @webspatial/builder @webspatial/platform-visionos
```

> [!CAUTION]
> **PICO OS 6 runtime version needs owner confirmation**
>
> The SDK identifies the PICO runtime by the `PicoWebApp/<version>` token in the User Agent, and the version table built into `@webspatial/core-sdk` 2.0.0 covers `PicoWebApp` runtime versions from `0.1.1` up to `0.4.90`. Which PICO OS 6 emulator or device build ships which `PicoWebApp` version is not published by the SDK project, so this page does not recommend a specific PICO OS 6 build. Until the WebSpatial and PICO teams publish that mapping, use the newest available PICO OS 6 emulator or device firmware and verify feature support at runtime as described below.

## Feature Support

SDK availability does not automatically mean runtime support. When the runtime does not support a feature, the SDK does not crash the page. Instead it follows a documented fallback for that feature, which is usually "render the non-spatial version" or "do nothing".

To find out whether the runtime that is currently running your page supports a feature, use the public detection API exported by the React SDK:

```ts title="Check a feature before using it"
import { WebSpatialRuntime } from "@webspatial/react-sdk";

if (WebSpatialRuntime.supports("useAnimation")) {
  // The current runtime supports useAnimation.
}
```

Some capabilities have sub-capabilities. Pass them as a second argument. The result is `true` only when the capability and every listed sub-capability are supported:

```ts title="Check a sub-capability"
import { WebSpatialRuntime } from "@webspatial/react-sdk";

if (WebSpatialRuntime.supports("VolumeScene", ["worldScaling"])) {
  // The runtime supports volume scenes and the worldScaling scene option.
}
```

### Behavior

`WebSpatialRuntime.supports(name, tokens?)` is synchronous, safe to call during server-side rendering, and stable for the lifetime of the page.

It returns `false` when:

- the page is not running in a [WebSpatial Runtime](../concepts/webspatial-app.md#webspatial-runtime), including ordinary desktop and mobile browsers and server-side rendering
- the runtime is detected but does not support the capability
- `name` is not a known capability key
- any entry in `tokens` is not a known sub-capability of `name`

Passing an empty `tokens` array behaves the same as omitting it.

### Capability keys

Capability keys use the same names as the corresponding WebSpatial API. The component aliases used in these docs are accepted too, for example `Box` for `BoxEntity` and `World` for `SceneGraph`. The keys below are the ones defined by `@webspatial/core-sdk` 2.0.0. Newer SDK versions may add keys; a key that your installed SDK does not define always returns `false`.

| Family | Keys | Sub-capabilities |
| ------ | ---- | ---------------- |
| [React components](../api/react-sdk/react-components) | `Model`, `Reality`, `Entity`, `BoxEntity`, `SphereEntity`, `ConeEntity`, `CylinderEntity`, `PlaneEntity`, `SceneGraph`, `ModelAsset`, `ModelEntity`, `Material`, `UnlitMaterial`, `AttachmentAsset`, `AttachmentEntity` | `Model`: `autoplay`, `loop`, `stagemode`, `poster`, `loading`, `source`, `ready`, `currentSrc`, `entityTransform`, `paused`, `duration`, `playbackRate`, `play`, `pause`, `currentTime`<br />`Material`: `unlit`<br />`AttachmentEntity`: `placement` |
| [CSS API](../api/react-sdk/css-api) | `-xr-background-material`, `-xr-back`, `-xr-depth`, `-xr-transform` | |
| [Event API](../api/react-sdk/event-api) | `SpatialTapEvent`, `SpatialDragStartEvent`, `SpatialDragEvent`, `SpatialDragEndEvent`, `SpatialRotateEvent`, `SpatialRotateEndEvent`, `SpatialMagnifyEvent`, `SpatialMagnifyEndEvent` | `SpatialRotateEvent`: `constrainedToAxis` |
| [JS API](../api/react-sdk/js-api) and [scene options](../api/react-sdk/scene-options) | `useMetrics`, `convertCoordinate`, `initScene`, `WindowScene`, `VolumeScene` | `WindowScene`: `defaultSize`, `resizability`<br />`VolumeScene`: `defaultSize`, `resizability`, `worldScaling`, `worldAlignment`, `baseplateVisibility` |
| [DOM API](../api/react-sdk/dom-api) | `xrClientDepth`, `xrOffsetBack`, `xrInnerDepth`, `xrOuterDepth` | |
| Animation | `useAnimation` | |

> [!CAUTION]
> **Experimental keys**
>
> `useAnimation` corresponds to an API that is only exported from the opt-in `@webspatial/react-sdk/experimental` entry. Its name and parameters may still change, and these docs do not cover it yet. A `true` result for this key means the runtime supports the feature, not that the API is stable.

> [!TIP]
> **See the live result for your runtime**
>
> The WebSpatial SDK test server has a [Runtime capabilities](https://webspatial-sdk-test-server.vercel.app/#/runtime-capabilities) page. Open it inside the runtime you are targeting, for example the PICO OS 6 emulator, to see the detected runtime, which capability source was used, and the live `supports()` result for every key and sub-capability. It is the fastest way to answer "does this emulator support X" without writing code. The page runs the SDK build deployed with the test server, which can be newer than the SDK installed in your project, so its key list may include keys your version does not define.

## Compatibility Model

`WebSpatialRuntime.supports()` is the only public entry point, but it helps to know where its answer comes from:

1. **SDK.** Your page runs the SDK version installed in your project. The SDK defines the set of capability keys it knows about.
2. **Runtime detection.** The SDK reads the [User Agent](../api/react-sdk/dom-api/userAgent.md) to decide which runtime is executing the page. `WSAppShell/<version>` on a Mac-class User Agent means the visionOS runtime bundled into a packaged app. `PicoWebApp/<version>` means the Web App Runtime of PICO OS 6. Anything else is treated as a non-WebSpatial browser and every capability is `false`.
3. **Runtime capability manifest, when available.** The SDK is designed so that a runtime can declare the complete list of capabilities it supports directly to the page. When such a manifest is present and matches the detected runtime, it is the authoritative answer, and any key missing from it is `false`. No released runtime provides a manifest yet: `@webspatial/core-sdk` 2.0.0 does not read one, and `@webspatial/platform-visionos` 2.0.0 does not emit one. This step is being developed in the WebSpatial SDK repository and is expected to reach visionOS first.
4. **Version-table fallback, where needed.** Without a manifest, the SDK looks up the detected runtime version in a version table shipped inside the SDK. In 2.0.0 this is how every runtime is resolved, on visionOS and PICO OS 6 alike. The table picks the newest entry that is not newer than the detected runtime version, so a runtime newer than the newest entry is treated as that newest entry. A runtime older than the oldest entry resolves every capability to `false`.
5. **`WebSpatialRuntime.supports()`** returns the result of that lookup.

Independently of capability detection, [`<SpatialBoot>`](../api/react-sdk/react-components/SpatialBoot.md) only loads the spatial implementation of the SDK when a WebSpatial Runtime is detected. In ordinary browsers the spatial code is never downloaded.

### visionOS vs PICO OS 6

| | visionOS | PICO OS 6 |
| --- | -------- | --------- |
| Where the runtime comes from | Bundled into your app by [WebSpatial Builder](../concepts/webspatial-app.md#webspatial-builder) from `@webspatial/platform-visionos` | Built into the OS. Updated by PICO system updates. |
| Runtime version token | `WSAppShell/<version>`, where `<version>` is the `@webspatial/platform-visionos` version you packaged with | `PicoWebApp/<version>`, assigned by PICO |
| Capability source in 2.0.0 | Version table in the SDK, keyed by `WSAppShell` version | Version table in the SDK, keyed by `PicoWebApp` version |
| Can SDK and runtime versions drift? | Only if you upgrade npm packages unevenly, because you ship both together | Yes, routinely. The user's OS decides the runtime version. |
| How to get a newer runtime | Upgrade `@webspatial/platform-visionos` and repackage | Update the emulator or device firmware |

Because of these differences, PICO OS 6 is where runtime feature detection matters most. The same website can be opened by devices running different PICO OS builds, so always gate features that are not universally supported with `WebSpatialRuntime.supports()` instead of assuming the newest runtime.

Actual capability differences between the two platforms change with every runtime release, so they are not listed here. Use `WebSpatialRuntime.supports()` or the [Runtime capabilities test page](https://webspatial-sdk-test-server.vercel.app/#/runtime-capabilities) to check a specific key on a specific runtime.

## Version Mismatch Guidance

### The SDK is newer than the runtime

This is the normal case on PICO OS 6 and the case for a visionOS app that upgrades `@webspatial/react-sdk` without repackaging.

- Everything the runtime does support keeps working.
- Capabilities the runtime lacks resolve to `false` and the SDK applies the documented fallback: [`<Model>`](../api/react-sdk/react-components/Model.md) renders the standard `<model>` element, [`<Reality>`](../api/react-sdk/react-components/Reality.md) renders a hidden placeholder that keeps its layout box, and other unsupported 3D components render nothing.
- Runtime-only functions do not silently return wrong values. The conversion functions from [`useMetrics`](../api/react-sdk/js-api/useMetrics.md) and [`convertCoordinate`](../api/react-sdk/js-api/convertCoordinate.md) throw a `WebSpatialRuntimeError` when their capability is unsupported. Gate those calls with `WebSpatialRuntime.supports("useMetrics")` or `WebSpatialRuntime.supports("convertCoordinate")`.
- For anything that is not universally supported, render an alternative when `supports()` returns `false` instead of relying on the fallback.

### The runtime is newer than the SDK

- The SDK can only report capabilities it knows about. A feature added to a runtime after your SDK version was released is not detectable until you upgrade the SDK.
- A runtime version newer than the newest entry in the SDK's version table resolves to that newest entry, so newer runtime features are reported as unsupported until the SDK is updated. In 2.0.0 this applies to both platforms.
- Upgrade `@webspatial/react-sdk` and `@webspatial/core-sdk` together to pick up new keys and new runtime support.

### The runtime supports only part of the SDK API surface

This is expected and is exactly what `supports()` is for. Treat every capability that is not part of the basic [spatialized HTML element](../concepts/spatialized-html-elements.md) and [spatial scene](../concepts/spatial-scenes.md) feature set as optional, and check it before use. Prefer checking the most specific thing you need, for example `supports("Model", ["autoplay"])` rather than only `supports("Model")`.

### The installed package version differs from the docs

These docs describe the latest 2.x SDK. If `npm ls @webspatial/react-sdk` reports a 1.x version, use the [1.0.x docs](/docs/1.0.x) or upgrade. If it reports a 2.x version that is older than `latest`, the docs may mention APIs or capability keys that your version does not export yet. Upgrade all WebSpatial packages together, then repackage visionOS apps so the bundled runtime matches the SDK.

## Known Limitations

The following are not reflected by `WebSpatialRuntime.supports()` and need to be handled separately:

- **Support is not readiness.** `supports()` reports what the runtime can do, not whether the spatial implementation of the SDK has finished loading. Runtime-only APIs must still be used inside [`<SpatialBoot>`](../api/react-sdk/react-components/SpatialBoot.md), or after `bootSpatial()` resolves.
- **Server-side rendering.** `supports()` returns `false` on the server and may return `true` on the client. Rendering different markup based on its result during initial render can cause hydration mismatches. Call it inside `<SpatialBoot>` children, in effects, or in event handlers.
- **Detection is version-table based in 2.0.0.** The SDK cannot see per-build differences that are not encoded in its table. If a feature behaves differently between two runtime builds that report the same `WSAppShell` or `PicoWebApp` version, `supports()` cannot tell them apart. This matters most on PICO OS 6, where the runtime is updated independently of your npm packages.
- **Non-spatial platforms.** JSAR Runtime, IRIS OS, Android XR, and Meta Horizon OS are not detected as WebSpatial runtimes yet, so every capability is `false` there, as listed under [Supported Platforms](./getting-started.md#supported-platforms).
