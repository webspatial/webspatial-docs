---
sidebar_position: 4
description: '用纯 JavaScript 自行控制空间能力的加载过程。'
---

# `bootSpatial`

## 概述 {#summary}

[`<SpatialBoot>` 组件](../react-components/SpatialBoot.md)自动完成的所有工作，也都能通过纯 JavaScript 函数来完成。

大多数应用并不需要它们——用 `<SpatialBoot>` 包裹应用就足够了。本页的 API 只面向少数想自己控制加载过程的场景，比如在纯客户端渲染的应用里，在首次渲染*之前*就完成加载。

## 调用形式 {#signature}

```ts
function bootSpatial(): Promise<void>
```

调用它时会发生什么：

- 在普通浏览器和服务端渲染过程中，它会立即 resolve——不会下载任何东西，也不会改变任何行为。
- 在空间计算平台上（也就是在 [WebSpatial Runtime](../../../concepts/webspatial-app.md#webspatial-runtime) 中），它会下载并初始化 SDK 的空间能力。
- 多次调用是安全的：并发调用会共享同一次加载；加载成功后，结果会在页面的整个生命周期内复用。
- 如果加载失败，Promise 会以 [`WebSpatialBootError`](#webspatialbooterror) reject。再次调用 `bootSpatial()` 就是重试。

示例——在纯客户端渲染的应用中，在首次渲染前完成加载：

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

:::caution[不适用于 SSR 项目]
在启用 SSR 的项目中，不要把这种手动模式当作默认做法，而应在客户端渲染的代码里挂载 [`<SpatialBoot>`](../react-components/SpatialBoot.md)。参见[如何在启用 SSR 的项目中启用 WebSpatial](../../../how-to/ssr.md)。
:::

## 相关 API {#related-apis}

### `isSpatialReady`

```ts
function isSpatialReady(): boolean
```

告诉你当前页面的空间能力是否已经加载完成。

### `useSpatialReady`

```ts
function useSpatialReady(): boolean
```

`isSpatialReady` 的 React Hook 版本：当答案发生变化时，组件会自动重新渲染。它在服务端渲染和普通浏览器中始终返回 `false`，所以也可以用来只在空间平台上展示某些内容：

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

让你在加载失败时收到通知——适合用来做错误上报。调用返回的函数即可停止监听。

```js
import { onSpatialLoadError } from "@webspatial/react-sdk";

const unsubscribe = onSpatialLoadError((error) => {
  reportError(error);
});

unsubscribe();
```

### `WebSpatialBootError`

加载失败时你会收到的错误对象：

| 字段 | 说明 |
| --- | --- |
| `name` | 恒为 `'WebSpatialBootError'` |
| `cause` | 导致失败的原始错误 |
| `attempt` | 第几次加载失败，从 1 开始计数 |
