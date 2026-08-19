<!--
sidebar_position: 4
description: 'Load the spatial implementation of the SDK and render spatial content once it is ready.'
-->

# `<SpatialBoot>`

## Summary

`<SpatialBoot>` activates the [WebSpatial API](../../../introduction/getting-started.md#webspatial-api) at runtime. Wrap it around the part of the app that uses WebSpatial — usually the app root, as part of the [basic SDK setup](../../../introduction/getting-started.md#step-2-spatial-boot):

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

- In a [WebSpatial Runtime](../../../concepts/webspatial-app.md#webspatial-runtime), it loads the spatial implementation of the SDK on demand, then renders `children` once loading succeeds.
- In ordinary browsers, it renders `children` right after mount and never requests the spatial implementation, so the website's original behavior and performance are unaffected.

> [!NOTE]
> **Upgrading from earlier SDK versions**
>
> Always import WebSpatial APIs from the package root `@webspatial/react-sdk`. Earlier deep import paths such as `@webspatial/react-sdk/web` and `@webspatial/react-sdk/default` have been removed, and the previous `SSRProvider` component has been replaced by `<SpatialBoot>`.

## Props

```ts
type SpatialBootProps = {
  children: React.ReactNode;
  onReady?: () => void;
  onError?: (error: WebSpatialBootError) => void;
};
```

- `children`: the content to render after the spatial implementation is ready.
- `onReady`: called once loading succeeds.
- `onError`: called with a [`WebSpatialBootError`](../js-api/bootSpatial.md#webspatialbooterror) if loading fails.

## Behavior

- `<SpatialBoot>` starts loading after it mounts, and renders `null` while loading is pending — including in server-side rendering output.
- If loading fails, it calls `onError` and keeps `children` unmounted.
- There is no `fallback` prop. Render loading or error UI outside `<SpatialBoot>`:

```jsx
import { useState } from "react";
import { SpatialBoot } from "@webspatial/react-sdk";

function SpatialPanel() {
  const [error, setError] = useState(null);

  if (error) return <FallbackPanel />;

  return (
    <>
      <LoadingShell />
      <SpatialBoot onError={setError}>
        <SpatialExperience />
      </SpatialBoot>
    </>
  );
}
```

> [!TIP]
> **SSR projects**
>
> In SSR-enabled projects, mount `<SpatialBoot>` in client-rendered code and keep content that must be server-rendered outside it. See [How to enable WebSpatial in SSR-enabled projects](../../../how-to/ssr.md).

> [!TIP]
> **Manual control**
>
> To load the spatial implementation without a wrapper component, or to observe spatial readiness from JS code, use [`bootSpatial` and its related JS APIs](../js-api/bootSpatial.md).
