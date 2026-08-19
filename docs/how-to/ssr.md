---
sidebar_position: 4
description: 'Use WebSpatial in SSR projects: mount SpatialBoot on the client and keep server-rendered content outside it.'
---

# How to enable WebSpatial in SSR-enabled projects

Good news: WebSpatial SDK supports SSR out of the box. [Integrating it](../introduction/getting-started.md#set-up-your-project) works the same way as in any other React project — no extra provider and no special configuration.

There is just one thing to keep in mind about *where* to put [`<SpatialBoot>`](../api/react-sdk/react-components/SpatialBoot.md): mount it in client-rendered code, and keep content that must appear in server-rendered HTML — for example, content search engines should see — outside it.

:::info[Why this works]
During server rendering and in ordinary browsers, WebSpatial components render as normal HTML elements, so nothing breaks. `<SpatialBoot>` loads the spatial capabilities only on the client, in a [WebSpatial Runtime](../concepts/webspatial-app.md#webspatial-runtime), and shows nothing until loading finishes — which is why anything placed inside it is not part of the server-rendered HTML.
:::

## Next.js

Put `<SpatialBoot>` inside a [client component](https://nextjs.org/docs/app/getting-started/server-and-client-components):

```jsx title="spatial-product-view.jsx" {1,8,12}
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

The rule is the same for other SSR frameworks such as Remix or Hydrogen: wrap the spatial part of the UI with `<SpatialBoot>` inside a normal component. That content appears on the client after hydration, once the spatial capabilities are ready.

:::tip[Need different HTML per platform?]
The SDK does not detect spatial platforms on the server. If your server must return different markup for spatial devices, check the incoming request yourself — for example, via the [User-Agent](../api/react-sdk/dom-api/userAgent.md).
:::

:::note[Upgrading from SSRProvider]
If your project still wraps the app with `SSRProvider` from an earlier SDK version, remove it — it no longer exists. Wrap the spatial content with `<SpatialBoot>` instead.
:::
