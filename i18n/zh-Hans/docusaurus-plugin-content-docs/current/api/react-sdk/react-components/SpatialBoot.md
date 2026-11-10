---
sidebar_position: 4
description: '在应用中开启 WebSpatial：加载 SDK 的空间能力，就绪后展示空间内容。'
---

# `<SpatialBoot>`

## 概述 {#summary}

应用要使用任何 WebSpatial 功能之前，SDK 都需要先加载它的空间能力——也就是真正让窗口、HTML 元素和 3D 内容"空间化"的那部分代码。`<SpatialBoot>` 会自动帮你完成这件事：只需要用它包裹应用中使用 WebSpatial 的部分——通常就是应用根节点，如 [Getting Started](../../../introduction/getting-started.md#step-2-spatial-boot) 所示——就可以了。

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

它帮你做了什么：

- 在空间计算平台上（也就是在 [WebSpatial Runtime](../../../concepts/webspatial-app.md#webspatial-runtime) 中），它会在后台加载空间能力，一切就绪后再展示你的内容。
- 在普通浏览器中，它会渲染内容而不加载空间实现。请在支持的浏览器中测试 2D 布局、输入、回退内容和性能；跳过该实现不保证零开销或行为不变。

`<SpatialBoot>` 负责加载时的 Runtime 检测。各空间功能仍取决于 SDK 和 Runtime 版本，请使用能力检测并在需要时提供替代方案。详见[支持的平台](../../../introduction/getting-started.md#supported-platforms)。

:::note[从旧版 SDK 升级？]
现在所有 API 都从同一个入口导入：`@webspatial/react-sdk`。如果你的代码还在使用旧的深层导入路径（`@webspatial/react-sdk/web`、`@webspatial/react-sdk/default`）或旧的 `SSRProvider` 组件，请更新它们——这些都已不存在，`SSRProvider` 由 `<SpatialBoot>` 取代。
:::

## 属性 {#props}

```ts
type SpatialBootProps = {
  children: React.ReactNode;
  onReady?: () => void;
  onError?: (error: WebSpatialBootError) => void;
};
```

- `children`：空间能力就绪后要展示的内容。
- `onReady`：加载成功时调用。在开发环境下它可能被调用不止一次（例如在 React `StrictMode` 下），所以回调要保持幂等。
- `onError`：加载失败时调用，参数是一个描述失败原因的 `WebSpatialBootError`——它是普通的 `Error`，原始错误保存在 `cause` 里。

## 行为 {#behavior}

使用前有两点值得了解：

1. **`<SpatialBoot>` 内部的内容要等加载完成后才会出现。** 空间能力加载期间——包括在服务端渲染的输出中——它不展示任何内容。如果加载失败，内容会保持隐藏，并调用 `onError`。
2. **它故意不提供 `fallback` 属性。** 需要始终可见的内容，比如加载指示或错误提示，应该放在 `<SpatialBoot>` 的*外部*：

```jsx
import { useState } from "react";
import { SpatialBoot } from "@webspatial/react-sdk";

function SpatialPanel() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  if (error) return <FallbackPanel />;

  return (
    <>
      {!ready && <LoadingShell />}
      <SpatialBoot onReady={() => setReady(true)} onError={setError}>
        <SpatialExperience />
      </SpatialBoot>
    </>
  );
}
```

:::tip[项目用了 SSR？]
在启用 SSR 的项目中，请把 `<SpatialBoot>` 放在客户端渲染的代码里，并把必须出现在服务端渲染 HTML 中的内容放在它外部。参见[如何在启用 SSR 的项目中启用 WebSpatial](../../../how-to/ssr.md)。
:::
