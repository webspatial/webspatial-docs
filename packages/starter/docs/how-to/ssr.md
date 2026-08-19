<!--
sidebar_position: 4
description: 'Enable WebSpatial in SSR projects by mounting SpatialBoot in client-rendered code.'
-->

# How to enable WebSpatial in SSR-enabled projects

In a React project with SSR enabled, [integrating WebSpatial SDK](../introduction/getting-started.md#set-up-your-project) works the same way as in other React projects. There is only one placement rule for [`<SpatialBoot>`](../api/react-sdk/react-components/SpatialBoot.md): mount it in client-rendered code, and keep content that must appear in server-rendered HTML outside it.

> [!IMPORTANT]
> **Why this works**
>
> WebSpatial components render safe fallbacks during server rendering and in ordinary browsers. `<SpatialBoot>` loads the spatial implementation only on the client in a [WebSpatial Runtime](../concepts/webspatial-app.md#webspatial-runtime), and renders nothing while loading is pending, so anything inside it is not part of the server-rendered HTML.

## Next.js

Use `<SpatialBoot>` inside a [client component](https://nextjs.org/docs/app/getting-started/server-and-client-components):

**spatial-product-view.jsx**

```jsx
"use client";

import { SpatialBoot, Model } from "@webspatial/react-sdk";

export function SpatialProductView() {
  return (
    <SpatialBoot>
      <Model enable-xr style={{ height: "200px" }}>
        <source src="/models/product.glb" type="model/gltf-binary" />
      </Model>
    </SpatialBoot>
  );
}
```

## Other SSR frameworks

For other SSR frameworks such as Remix or Hydrogen, apply the same rule: wrap the WebSpatial part of the UI with `<SpatialBoot>` inside a normal component. The wrapped content renders on the client after hydration, once the spatial implementation is ready.

> [!TIP]
> **Server-side branching**
>
> The SDK does not provide request-time detection on the server. If the server must return different markup for spatial platforms, branch on request information such as the [User-Agent](../api/react-sdk/dom-api/userAgent.md).

> [!NOTE]
> **Upgrading from SSRProvider**
>
> Earlier SDK versions required wrapping the app with `SSRProvider` in SSR projects. `SSRProvider` has been removed — delete that wrapper and use `<SpatialBoot>` around the spatial content instead.
