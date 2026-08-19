---
sidebar_position: 4
description: '加载 SDK 的空间化实现，并在就绪后渲染空间内容。'
---

# `<SpatialBoot>`

## 概述 {#summary}

`<SpatialBoot>` 用于在运行时启用 [WebSpatial API](../../../introduction/getting-started.md#webspatial-api)。用它包裹应用中使用 WebSpatial 的部分——通常是应用根节点，作为 [SDK 基础配置](../../../introduction/getting-started.md#step-2-spatial-boot)的一部分：

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

- 在 [WebSpatial Runtime](../../../concepts/webspatial-app.md#webspatial-runtime) 中，它会按需加载 SDK 的空间化实现，并在加载成功后渲染 `children`。
- 在普通浏览器中，它会在挂载后直接渲染 `children`，并且完全不会请求空间化实现，因此网站原有的行为和性能不受影响。

:::note[从旧版 SDK 升级]
请始终从包的根入口 `@webspatial/react-sdk` 导入 WebSpatial API。旧版的深层导入路径（如 `@webspatial/react-sdk/web` 和 `@webspatial/react-sdk/default`）已被移除，旧版的 `SSRProvider` 组件也已被 `<SpatialBoot>` 取代。
:::

## 属性 {#props}

```ts
type SpatialBootProps = {
  children: React.ReactNode;
  onReady?: () => void;
  onError?: (error: WebSpatialBootError) => void;
};
```

- `children`：在空间化实现就绪后要渲染的内容。
- `onReady`：加载成功后调用一次。
- `onError`：加载失败时调用，参数是 [`WebSpatialBootError`](../js-api/bootSpatial.md#webspatialbooterror)。

## 行为 {#behavior}

- `<SpatialBoot>` 在挂载后开始加载，加载完成前渲染 `null`——包括在服务端渲染的输出中。
- 如果加载失败，它会调用 `onError`，并保持 `children` 不被挂载。
- 它没有 `fallback` 属性。加载中或出错时的 UI 应放在 `<SpatialBoot>` 外部：

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

:::tip[SSR 项目]
在启用 SSR 的项目中，应把 `<SpatialBoot>` 挂载在客户端渲染的代码里，并把必须由服务端渲染的内容放在它外部。参见[如何在启用 SSR 的项目中启用 WebSpatial](../../../how-to/ssr.md)。
:::

:::tip[手动控制]
如果想不通过包装组件来加载空间化实现，或者想在 JS 代码中观察空间化就绪状态，可以使用 [`bootSpatial` 及相关 JS API](../js-api/bootSpatial.md)。
:::
