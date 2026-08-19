---
sidebar_position: 4
description: 'Manually load the spatial implementation and observe spatial readiness from JS code.'
---

# `bootSpatial`

## Summary

Loads the spatial implementation of the SDK — the same work the [`<SpatialBoot>` component](../react-components/SpatialBoot.md) does automatically.

Most apps should use `<SpatialBoot>`. Use the JS APIs on this page only when you need full manual control, for example awaiting the load before the first render in a client-rendered app.

## Signature

```ts
function bootSpatial(): Promise<void>
```

Behavior:

- In ordinary browsers and during server-side rendering, it resolves immediately and does not request the spatial implementation.
- In a [WebSpatial Runtime](../../../concepts/webspatial-app.md#webspatial-runtime), it dynamically loads the spatial implementation.
- Concurrent calls share the same in-flight load attempt, and a successful load is cached for the page lifetime.
- A failed load rejects with [`WebSpatialBootError`](#webspatialbooterror). Calling `bootSpatial()` again after a failure starts a new load attempt.

Example — manual boot before the first render in a client-rendered app:

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

:::caution[Not an SSR recipe]
Do not use manual boot as the default pattern in SSR-enabled projects. Mount [`<SpatialBoot>`](../react-components/SpatialBoot.md) in client-rendered code instead. See [How to enable WebSpatial in SSR-enabled projects](../../../how-to/ssr.md).
:::

## Related APIs

### `isSpatialReady`

```ts
function isSpatialReady(): boolean
```

Returns `true` only after the spatial implementation has loaded successfully in the current page.

### `useSpatialReady`

```ts
function useSpatialReady(): boolean
```

React Hook that re-renders the component when spatial readiness changes. It returns `false` during server-side rendering and in ordinary browsers.

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

Registers a listener for spatial implementation load failures. The returned function unsubscribes the listener.

```js
import { onSpatialLoadError } from "@webspatial/react-sdk";

const unsubscribe = onSpatialLoadError((error) => {
  reportError(error);
});

unsubscribe();
```

### `WebSpatialBootError`

The error type used when loading fails.

| Field | Description |
| --- | --- |
| `name` | Always `'WebSpatialBootError'` |
| `cause` | The original loading error |
| `attempt` | The 1-based load attempt number |
