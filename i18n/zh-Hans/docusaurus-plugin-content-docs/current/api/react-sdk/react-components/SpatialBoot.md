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
- 在普通浏览器中，它会完全跳过加载，在首次渲染之后立即展示你的内容——访问者不会下载任何多余的空间代码，网站保持原来的速度和行为。

换句话说，你不需要自己写任何平台判断逻辑。加一次 `<SpatialBoot>`，同一份代码就能在所有平台上正常工作。

它*不会*做的事：告诉你某个具体的 WebSpatial 功能是否可用。"就绪"和"功能支持"是两个不同的问题——参见[就绪与功能支持](#readiness-vs-feature-support)。

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
- `onReady`：启动完成时调用——在空间计算平台上，是在空间能力加载完成之后；在普通浏览器中，则是在挂载之后立即调用，因为没有任何东西需要加载。它不会告诉你当前处于哪个平台，也不会告诉你哪些功能可用。在开发环境下它可能被调用不止一次（例如在 React `StrictMode` 下），所以回调要保持幂等。
- `onError`：加载失败时调用，参数是一个描述失败原因的 `WebSpatialBootError`——它是普通的 `Error`，原始错误保存在 `cause` 里。普通浏览器永远不会触发它。

## 行为 {#behavior}

使用前有两点值得了解：

1. **`<SpatialBoot>` 内部的内容要等启动完成后才会出现。** 空间能力加载期间——包括在服务端渲染的输出中——它不展示任何内容。在普通浏览器中没有任何东西需要加载，所以内容会在首次渲染之后立即挂载。如果加载失败，内容会保持隐藏，并调用 `onError`。
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

在普通浏览器中，`onReady` 会在挂载之后立即触发，所以 `<LoadingShell />` 在那里最多只会一闪而过。

:::tip[项目用了 SSR？]
在启用 SSR 的项目中，请把 `<SpatialBoot>` 放在客户端渲染的代码里，并把必须出现在服务端渲染 HTML 中的内容放在它外部。参见[如何在启用 SSR 的项目中启用 WebSpatial](../../../how-to/ssr.md)。
:::

## 就绪与功能支持 {#readiness-vs-feature-support}

`<SpatialBoot>` 只回答一个问题：*SDK 是否已经可以使用？* 另外两个问题很容易和它混淆，而且各自有不同的答案：

| 问题 | 如何判断 | 说明 |
| --- | --- | --- |
| **运行时**：当前页面是否运行在 WebSpatial Runtime 中？ | 通过 `navigator.userAgent` 做[运行时检测](../dom-api/userAgent.md) | 在 React 代码中很少需要。`<SpatialBoot>` 和 `WebSpatialRuntime.supports()` 已经把运行时考虑在内。 |
| **就绪**：SDK 是否已经加载完空间能力？ | 把组件渲染为 `<SpatialBoot>` 的子节点，或使用 `onReady` | 在普通浏览器中同样为真，因为那里没有任何东西需要加载。 |
| **功能支持**：当前运行时是否支持我即将使用的功能？ | `WebSpatialRuntime.supports("<feature>")` | 不同版本的 WebSpatial Runtime 支持的功能不同。启动成功并不意味着功能受支持。 |

启动成功并不能证明所有功能都可用：空间能力是作为一个整体加载的，但底层的 [WebSpatial Runtime](../../../concepts/webspatial-app.md#webspatial-runtime) 能做什么，取决于平台及其版本。大多数 WebSpatial API 在不受支持时会自行降级——空间 CSS 会被忽略，[`<Model>`](./Model.md) 会回退到标准的 `<model>` 元素，等等——对于这些 API，你直接写代码即可。少数 JS API 无法静默降级：[`useMetrics`](../js-api/useMetrics.md) 返回的转换函数和 [`convertCoordinate`](../js-api/convertCoordinate.md) 在功能不可用时会抛出 `WebSpatialRuntimeError`。对于这些 API，以及任何你希望在功能缺失时展示*不同* UI 的场景，请先检查功能支持。

`WebSpatialRuntime.supports(name)` 是一个同步检查，可以在任何地方安全调用：启动之前、普通浏览器中，以及 SSR 期间（此时返回 `false`）。对于它不认识的名字，它也会返回 `false`。这些名字就是文档中使用的 API 名称——例如 `"Model"`、`"Reality"`、`"useMetrics"`、`"convertCoordinate"`、`"WindowScene"`，或者 `"-xr-back"` 这样的 CSS 属性。部分名字还接受第二个参数用于更细粒度的检查，例如 `WebSpatialRuntime.supports("Model", ["autoplay"])`。

综合起来，推荐的结构是：

```text
runtime / environment      (handled for you by <SpatialBoot> and supports())
        |
        v
    <SpatialBoot>          (spatial components render as its children)
        |
        v
feature support check      (WebSpatialRuntime.supports("<feature>"))
        |
        v
spatial experience  OR  fallback UI
```

例如，在运行时能够渲染 3D 产品场景的地方展示 3D 场景，在其他所有地方展示一张普通图片：

```jsx
import { Reality, SpatialBoot, WebSpatialRuntime } from "@webspatial/react-sdk";

function AppRoot() {
  return (
    <SpatialBoot>
      <App />
    </SpatialBoot>
  );
}

// Rendered somewhere inside <App />, so it mounts only after boot completes.
function ProductPreview({ product }) {
  if (!WebSpatialRuntime.supports("Reality")) {
    // Ordinary browsers, and WebSpatial Runtimes without dynamic 3D containers.
    return <img src={product.previewImage} alt={product.name} />;
  }

  return (
    <Reality style={{ width: "500px", height: "500px", "--xr-depth": 100 }}>
      <ProductScene product={product} />
    </Reality>
  );
}
```

请像上面这样，把功能支持检查放在 `<SpatialBoot>` 子树内部。这样检查只会在启动完成之后运行，而且——由于 `<SpatialBoot>` 在 SSR 期间不渲染任何内容——服务端和客户端永远不会对该渲染哪个分支产生分歧。
