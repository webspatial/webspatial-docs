---
sidebar_position: 4
description: '在启用 SSR 的 React 项目中，把 SpatialBoot 挂载在客户端渲染的代码里以启用 WebSpatial。'
---

# 如何在启用 SSR 的项目中启用 WebSpatial {#how-to-enable-webspatial-in-ssr-enabled-projects}

开启了 SSR 的 React 项目，[集成 WebSpatial SDK](../introduction/getting-started.md#set-up-your-project) 的方式和其他 React 项目相同。唯一需要注意的是 [`<SpatialBoot>`](../api/react-sdk/react-components/SpatialBoot.md) 的挂载位置：把它挂载在客户端渲染的代码里，并把必须出现在服务端渲染 HTML 中的内容放在它外部。

:::info[为什么可以这样工作]
WebSpatial 组件在服务端渲染和普通浏览器中都会渲染安全的回退内容。`<SpatialBoot>` 只会在客户端的 [WebSpatial Runtime](../concepts/webspatial-app.md#webspatial-runtime) 中加载空间化实现，并且在加载完成前不渲染任何内容，因此它内部的内容不会出现在服务端渲染的 HTML 中。
:::

## Next.js

在[客户端组件](https://nextjs.org/docs/app/getting-started/server-and-client-components)中使用 `<SpatialBoot>`：

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

## 其他 SSR 框架 {#other-ssr-frameworks}

对于 Remix、Hydrogen 等其他 SSR 框架，规则相同：在普通组件里用 `<SpatialBoot>` 包裹 UI 中使用 WebSpatial 的部分。被包裹的内容会在客户端完成 hydration 且空间化实现就绪后渲染。

:::tip[服务端分支逻辑]
SDK 不提供服务端的请求级检测。如果服务端需要针对空间计算平台返回不同的内容，请基于请求信息（例如 [User-Agent](../api/react-sdk/dom-api/userAgent.md)）自行分支。
:::

:::note[从 SSRProvider 升级]
旧版 SDK 要求在 SSR 项目中用 `SSRProvider` 包裹应用。`SSRProvider` 已被移除——删除该包装层，改为用 `<SpatialBoot>` 包裹空间化内容。
:::
