---
sidebar_position: 4
description: '在 SSR 项目中使用 WebSpatial：把 SpatialBoot 放在客户端，把需要服务端渲染的内容放在它外部。'
---

# 如何在启用 SSR 的项目中启用 WebSpatial {#how-to-enable-webspatial-in-ssr-enabled-projects}

好消息：WebSpatial SDK 开箱即支持 SSR。[集成方式](../introduction/getting-started.md#set-up-your-project)和其他 React 项目完全一样——不需要额外的 Provider，也不需要任何特殊配置。

唯一需要留意的是 [`<SpatialBoot>`](../api/react-sdk/react-components/SpatialBoot.md) *放在哪里*：把它挂载在客户端渲染的代码里，并把必须出现在服务端渲染 HTML 中的内容——比如需要让搜索引擎看到的内容——放在它外部。

:::info[为什么可以这样工作]
在服务端渲染和普通浏览器中，WebSpatial 组件会渲染成普通的 HTML 元素，所以什么都不会坏。`<SpatialBoot>` 只会在客户端的 [WebSpatial Runtime](../concepts/webspatial-app.md#webspatial-runtime) 中加载空间能力，并且在加载完成前不展示任何内容——这也是为什么放在它内部的内容不会出现在服务端渲染的 HTML 里。
:::

## Next.js

把 `<SpatialBoot>` 放进一个[客户端组件](https://nextjs.org/docs/app/getting-started/server-and-client-components)：

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

对于 Remix、Hydrogen 等其他 SSR 框架，规则完全相同：在普通组件里用 `<SpatialBoot>` 包裹 UI 中的空间化部分。这部分内容会在客户端完成 hydration、且空间能力就绪后出现。

:::tip[需要针对不同平台返回不同 HTML？]
SDK 不会在服务端检测空间平台。如果你的服务端必须为空间设备返回不同的内容，请自己检查请求信息——比如通过 [User-Agent](../api/react-sdk/dom-api/userAgent.md)。
:::

:::note[从 SSRProvider 升级]
如果你的项目还在用旧版 SDK 的 `SSRProvider` 包裹应用，请把它删掉——它已经不存在了。改为用 `<SpatialBoot>` 包裹空间化内容即可。
:::
