---
sidebar_position: 4
description: 'Turn on WebSpatial in the app: load the spatial capabilities of the SDK and show spatial content once ready.'
---

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
- In ordinary browsers, it simply shows your content and skips the loading entirely — visitors never download the extra spatial code, and the website stays exactly as fast as before.

In other words, you don't need to write any platform detection yourself. Add `<SpatialBoot>` once, and the same code works everywhere.

:::note[Upgrading from an earlier SDK version?]
Everything is now imported from one place: `@webspatial/react-sdk`. If your code still uses the old deep import paths (`@webspatial/react-sdk/web`, `@webspatial/react-sdk/default`) or the old `SSRProvider` component, update it — those no longer exist, and `<SpatialBoot>` replaces `SSRProvider`.
:::

## Props

```ts
type SpatialBootProps = {
  children: React.ReactNode;
  onReady?: () => void;
  onError?: (error: WebSpatialBootError) => void;
};
```

- `children`: the content to show once the spatial capabilities are ready.
- `onReady`: called when loading succeeds. During development it can fire more than once (for example under React `StrictMode`), so keep the callback idempotent.
- `onError`: called if loading fails, with a `WebSpatialBootError` describing what went wrong — a regular `Error` whose `cause` holds the original failure.

## Behavior

Two things are worth knowing before you use it:

1. **Content inside `<SpatialBoot>` appears only after loading finishes.** While the spatial capabilities are loading — and in server-side rendering output — it shows nothing. If loading fails, the content stays hidden and `onError` is called.
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

:::tip[Using SSR?]
In SSR-enabled projects, put `<SpatialBoot>` in client-rendered code, and keep content that must appear in server-rendered HTML outside it. See [How to enable WebSpatial in SSR-enabled projects](../../../how-to/ssr.md).
:::
