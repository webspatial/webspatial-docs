---
sidebar_position: 4
description: 'Control the loading of the spatial capabilities yourself, from plain JavaScript.'
---

# `bootSpatial`

## Summary

Everything the [`<SpatialBoot>` component](../react-components/SpatialBoot.md) does automatically is also available as plain JavaScript functions.

Most apps never need them — wrapping the app with `<SpatialBoot>` is enough. The APIs on this page are for the few cases where you want to control the loading yourself, for example finishing it *before* the very first render of a client-rendered app.

## Signature

```ts
function bootSpatial(): Promise<void>
```

What to expect when you call it:

- In ordinary browsers and during server-side rendering, it resolves immediately — nothing is downloaded and nothing changes.
- On spatial computing platforms (in a [WebSpatial Runtime](../../../concepts/webspatial-app.md#webspatial-runtime)), it downloads and initializes the spatial capabilities of the SDK.
- Calling it multiple times is safe: concurrent calls share one loading attempt, and once loading succeeds, the result is reused for the rest of the page's lifetime.
- If loading fails, the promise rejects with a [`WebSpatialBootError`](#webspatialbooterror). Calling `bootSpatial()` again simply retries.

Example — finish loading before the first render of a client-rendered app:

```jsx title="main.jsx"
import ReactDOM from "react-dom/client";
import { bootSpatial } from "@webspatial/react-sdk";

const root = ReactDOM.createRoot(document.getElementById("root"));

try {
  await bootSpatial();
  root.render(<App />);
} catch (error) {
  root.render(<FallbackApp error={error} />);
}
```

:::caution[Not for SSR projects]
In SSR-enabled projects, don't make this manual pattern your default. Mount [`<SpatialBoot>`](../react-components/SpatialBoot.md) in client-rendered code instead. See [How to enable WebSpatial in SSR-enabled projects](../../../how-to/ssr.md).
:::

## Related APIs

### `isSpatialReady`

```ts
function isSpatialReady(): boolean
```

Tells you whether the spatial capabilities have finished loading on the current page.

### `useSpatialReady`

```ts
function useSpatialReady(): boolean
```

The React Hook version of `isSpatialReady`: the component re-renders automatically when the answer changes. It always returns `false` during server-side rendering and in ordinary browsers, so you can also use it to show certain content only on spatial platforms:

```jsx
import { Model, useSpatialReady } from "@webspatial/react-sdk";

function ReadyGatedModel() {
  const ready = useSpatialReady();
  if (!ready) return null;
  return (
    <Model enable-xr style={{ height: "200px" }}>
      <source src="/models/drone.glb" type="model/gltf-binary" />
    </Model>
  );
}
```

### `onSpatialLoadError`

```ts
function onSpatialLoadError(
  callback: (error: WebSpatialBootError) => void,
): () => void
```

Lets you get notified whenever loading fails — useful for error reporting. Call the returned function to stop listening.

```js
import { onSpatialLoadError } from "@webspatial/react-sdk";

const unsubscribe = onSpatialLoadError((error) => {
  reportError(error);
});

unsubscribe();
```

### `WebSpatialBootError`

The error you receive when loading fails:

| Field | Description |
| --- | --- |
| `name` | Always `'WebSpatialBootError'` |
| `cause` | The original error that caused the failure |
| `attempt` | Which loading attempt failed, counting from 1 |
