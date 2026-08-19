---
sidebar_position: 4
description: '手动加载空间化实现，并在 JS 代码中观察空间化就绪状态。'
---

# `bootSpatial`

## 概述 {#summary}

加载 SDK 的空间化实现，与 [`<SpatialBoot>` 组件](../react-components/SpatialBoot.md)自动完成的工作相同。

大多数应用应该使用 `<SpatialBoot>`。只有在需要完全手动控制时才使用本页的 JS API，例如在纯客户端渲染的应用中，在首次渲染前等待加载完成。

## 调用形式 {#signature}

```ts
function bootSpatial(): Promise<void>
```

行为：

- 在普通浏览器和服务端渲染过程中，会立即 resolve，并且不会请求空间化实现。
- 在 [WebSpatial Runtime](../../../concepts/webspatial-app.md#webspatial-runtime) 中，会动态加载空间化实现。
- 并发调用会共享同一次进行中的加载，加载成功的结果会在页面生命周期内缓存。
- 加载失败时会以 [`WebSpatialBootError`](#webspatialbooterror) reject。失败后再次调用 `bootSpatial()` 会发起新的加载。

示例——在纯客户端渲染的应用中，在首次渲染前手动加载：

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

:::caution[不适用于 SSR]
不要把手动加载作为启用 SSR 的项目的默认模式。SSR 项目应在客户端渲染的代码中挂载 [`<SpatialBoot>`](../react-components/SpatialBoot.md)。参见[如何在启用 SSR 的项目中启用 WebSpatial](../../../how-to/ssr.md)。
:::

## 相关 API {#related-apis}

### `isSpatialReady`

```ts
function isSpatialReady(): boolean
```

仅当空间化实现已在当前页面加载成功时返回 `true`。

### `useSpatialReady`

```ts
function useSpatialReady(): boolean
```

React Hook，会在空间化就绪状态变化时触发组件重新渲染。在服务端渲染和普通浏览器中返回 `false`。

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

注册空间化实现加载失败的监听器。返回的函数用于取消监听。

```js
import { onSpatialLoadError } from "@webspatial/react-sdk";

const unsubscribe = onSpatialLoadError((error) => {
  reportError(error);
});

unsubscribe();
```

### `WebSpatialBootError`

加载失败时使用的错误类型。

| 字段 | 说明 |
| --- | --- |
| `name` | 恒为 `'WebSpatialBootError'` |
| `cause` | 原始的加载错误 |
| `attempt` | 从 1 开始计数的加载尝试次数 |
