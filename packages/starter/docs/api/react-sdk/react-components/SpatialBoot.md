<!--
sidebar_position: 4
description: 'Turn on WebSpatial in the app: load the spatial capabilities of the SDK and show spatial content once ready.'
-->

# `<SpatialBoot>`

## Summary

Before an app can use any WebSpatial feature, the SDK needs to load its spatial capabilities — the part of the SDK that actually makes windows, elements, and 3D content spatial. `<SpatialBoot>` takes care of this automatically: wrap it once around the part of the app that uses WebSpatial — usually the app root, as shown in [Getting Started](../../../introduction/getting-started.md#step-2-spatial-boot) — and you are done.

```jsx
import { SpatialBoot } from "@webspatial/react-sdk";

function AppRoot() {
  return (
    <SpatialBoot>
      <App />
    </SpatialBoot>
  );
}
```

What it does for you:

- On spatial computing platforms (in a [WebSpatial Runtime](../../../concepts/webspatial-app.md#webspatial-runtime)), it loads the spatial capabilities in the background, then shows your content once everything is ready.
- In ordinary browsers, it skips the loading entirely and shows your content right after the first render — visitors never download the extra spatial code, and the website stays exactly as fast as before.

In other words, you don't need to write any platform detection yourself. Add `<SpatialBoot>` once, and the same code works everywhere.

What it does *not* do: tell you whether a specific WebSpatial feature is available. Readiness and feature support are two different questions — see [Readiness vs. feature support](#readiness-vs-feature-support).

> [!NOTE]
> **Upgrading from an earlier SDK version?**
>
> Everything is now imported from one place: `@webspatial/react-sdk`. If your code still uses the old deep import paths (`@webspatial/react-sdk/web`, `@webspatial/react-sdk/default`) or the old `SSRProvider` component, update it — those no longer exist, and `<SpatialBoot>` replaces `SSRProvider`.

## Props

```ts
type SpatialBootProps = {
  children: React.ReactNode;
  onReady?: () => void;
  onError?: (error: WebSpatialBootError) => void;
};
```

- `children`: the content to show once the spatial capabilities are ready.
- `onReady`: called once boot completes — on spatial computing platforms, after the spatial capabilities have loaded; in ordinary browsers, right after mount, because there is nothing to load. It does not tell you which platform you are on or which features are available. During development it can fire more than once (for example under React `StrictMode`), so keep the callback idempotent.
- `onError`: called if loading fails, with a `WebSpatialBootError` describing what went wrong — a regular `Error` whose `cause` holds the original failure. Ordinary browsers never trigger it.

## Behavior

Two things are worth knowing before you use it:

1. **Content inside `<SpatialBoot>` appears only after boot completes.** While the spatial capabilities are loading — and in server-side rendering output — it shows nothing. In ordinary browsers there is nothing to load, so the content mounts right after the first render. If loading fails, the content stays hidden and `onError` is called.
2. **It has no `fallback` prop, on purpose.** Anything that should always be visible, such as a loading indicator or an error message, belongs *outside* `<SpatialBoot>`:

```jsx
import { useState } from "react";
import { SpatialBoot } from "@webspatial/react-sdk";

function SpatialPanel() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  if (error) return <FallbackPanel />;

  return (
    <>
      {!ready && <LoadingShell />}
      <SpatialBoot onReady={() => setReady(true)} onError={setError}>
        <SpatialExperience />
      </SpatialBoot>
    </>
  );
}
```

In ordinary browsers `onReady` fires right after mount, so `<LoadingShell />` is at most a brief flash there.

> [!TIP]
> **Using SSR?**
>
> In SSR-enabled projects, put `<SpatialBoot>` in client-rendered code, and keep content that must appear in server-rendered HTML outside it. See [How to enable WebSpatial in SSR-enabled projects](../../../how-to/ssr.md).

## Readiness vs. feature support

`<SpatialBoot>` answers one question: *is the SDK ready to use?* Two other questions are easy to confuse with it, and each has its own answer:

| Question | How to answer it | Notes |
| --- | --- | --- |
| **Runtime**: is this page running in a WebSpatial Runtime? | [Runtime detection](../dom-api/userAgent.md) via `navigator.userAgent` | Rarely needed in React code. `<SpatialBoot>` and `WebSpatialRuntime.supports()` already take the runtime into account. |
| **Readiness**: has the SDK finished loading its spatial capabilities? | Render the component as a child of `<SpatialBoot>`, or use `onReady` | Also true in ordinary browsers, where there is nothing to load. |
| **Feature support**: does this runtime support the feature I am about to use? | `WebSpatialRuntime.supports("<feature>")` | Different WebSpatial Runtime versions support different features. Boot success does not imply support. |

Boot success is not proof that every feature works: the spatial capabilities load as one unit, but what the [WebSpatial Runtime](../../../concepts/webspatial-app.md#webspatial-runtime) underneath can do depends on the platform and its version. Most WebSpatial APIs degrade on their own when unsupported — spatial CSS is ignored, [`<Model>`](./Model.md) falls back to the standard `<model>` element, and so on — so for those you can simply write the code. A few JS APIs cannot degrade silently: the conversion functions returned by [`useMetrics`](../js-api/useMetrics.md) and [`convertCoordinate`](../js-api/convertCoordinate.md) throw a `WebSpatialRuntimeError` when the feature is unavailable. For those, and whenever you want to show *different* UI where a feature is missing, check support first.

`WebSpatialRuntime.supports(name)` is a synchronous check that is safe to call anywhere: before boot, in ordinary browsers, and during SSR, where it returns `false`. It also returns `false` for names it does not recognize. The names are the API names used in these docs — for example `"Model"`, `"Reality"`, `"useMetrics"`, `"convertCoordinate"`, `"WindowScene"`, or a CSS property such as `"-xr-back"`. Some names accept a second argument for finer-grained checks, such as `WebSpatialRuntime.supports("Model", ["autoplay"])`.

Putting it together, the recommended structure is:

```text
runtime / environment      (handled for you by <SpatialBoot> and supports())
        |
        v
    <SpatialBoot>          (spatial components render as its children)
        |
        v
feature support check      (WebSpatialRuntime.supports("<feature>"))
        |
        v
spatial experience  OR  fallback UI
```

For example, to show a 3D product scene where the runtime can render it and a plain image everywhere else:

```jsx
import { Reality, SpatialBoot, WebSpatialRuntime } from "@webspatial/react-sdk";

function AppRoot() {
  return (
    <SpatialBoot>
      <App />
    </SpatialBoot>
  );
}

// Rendered somewhere inside <App />, so it mounts only after boot completes.
function ProductPreview({ product }) {
  if (!WebSpatialRuntime.supports("Reality")) {
    // Ordinary browsers, and WebSpatial Runtimes without dynamic 3D containers.
    return <img src={product.previewImage} alt={product.name} />;
  }

  return (
    <Reality style={{ width: "500px", height: "500px", "--xr-depth": 100 }}>
      <ProductScene product={product} />
    </Reality>
  );
}
```

Keep the support check inside the `<SpatialBoot>` subtree, as above. That way the check runs only after boot, and — because `<SpatialBoot>` renders nothing during SSR — the server and the client never disagree about which branch to render.
