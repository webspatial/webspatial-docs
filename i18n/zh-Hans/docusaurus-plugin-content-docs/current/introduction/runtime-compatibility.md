---
sidebar_position: 2
description: '选择相互匹配的 SDK 与 Runtime 版本组合，并在运行时检测当前平台实际支持哪些 WebSpatial 功能。'
---

# Runtime 兼容性 {#runtime-compatibility}

## 概述 {#summary}

一个 WebSpatial 应用由两个独立发布版本的部分组成：

- 安装在 Web 项目里的 [WebSpatial SDK](./getting-started.md#webspatial-sdk) npm 包
- 在空间计算平台上实际运行网页的 [WebSpatial Runtime](../concepts/webspatial-app.md#webspatial-runtime)

已安装的 SDK 里有某个 API，并不代表当前正在运行网页的 Runtime 已经实现了它。SDK 有意保持前瞻性：它可以先于各平台 Runtime 提供某个 API，而 Runtime 也可能比构建网页时使用的 SDK 更旧或更新。

本页说明：目前应该搭配使用哪些版本、如何用 `WebSpatialRuntime.supports()` 在运行时检测功能支持情况、visionOS 与 PICO OS 的差异，以及版本不匹配时该怎么做。

:::note[适用范围]
本页描述的是当前 SDK 2.x 的运行时检测与能力模型，不涉及未来的 Runtime 架构。
:::

## 推荐配置 {#recommended-setup}

对所有用到的 WebSpatial 包都安装 npm 的 `latest` 标签，并保持版本一致。WebSpatial SDK 仓库中的所有包使用同一个版本号一起发布，并且 `@webspatial/react-sdk` 把 `@webspatial/core-sdk` 声明为同一主版本范围内的 peer dependency。

| 组件 | 当前推荐 | 说明 |
| ---- | -------- | ---- |
| `@webspatial/react-sdk` | `latest`（2.x） | 必需。React 项目中所有 WebSpatial API 的公开入口。 |
| `@webspatial/core-sdk` | 与 `@webspatial/react-sdk` 相同版本 | 必需的 peer dependency。不要直接从它导入 API。 |
| `@webspatial/builder` | 与 SDK 相同版本 | 仅[打包应用](../concepts/webspatial-app.md#packaged-webspatial-app)需要，比如 visionOS。 |
| `@webspatial/platform-visionos` | 与 SDK 相同版本 | 仅 visionOS 需要。这个包就是 Builder 打包进应用里的 visionOS WebSpatial Runtime。 |
| visionOS Runtime | 打包时使用的 `@webspatial/platform-visionos` 版本 | Runtime 随应用安装包一起分发，因此始终是你安装的那个版本。Xcode 和模拟器要求见[安装 Xcode](../how-to/xcode.md)。 |
| PICO OS 6 Runtime | [PICO OS 6 模拟器](https://developer.picoxr.com/document/spatial-toolkit/learn-about-pico-emulator/)或设备内置的 WebSpatial Runtime | Runtime 随操作系统分发，由 PICO 更新，跟你的 npm 包无关。 |

截至本文撰写时，这四个 npm 包的 `latest` 都解析为 `2.0.0`。可以用下面的命令检查实际安装的版本：

```bash title="检查已安装的 WebSpatial 包"
npm ls @webspatial/react-sdk @webspatial/core-sdk @webspatial/builder @webspatial/platform-visionos
```

:::caution[PICO OS 6 Runtime 版本需要维护者确认]
SDK 通过 User Agent 中的 `PicoWebApp/<version>` 标识识别 PICO Runtime，`@webspatial/core-sdk` 2.0.0 内置的版本表覆盖 `0.1.1` 到 `0.4.90` 的 `PicoWebApp` Runtime 版本。哪个 PICO OS 6 模拟器或设备固件对应哪个 `PicoWebApp` 版本，SDK 项目没有公开发布，因此本页不推荐具体的 PICO OS 6 固件版本。在 WebSpatial 与 PICO 团队公布这一对应关系之前，请使用最新的 PICO OS 6 模拟器或设备固件，并按下文所述在运行时检测功能支持情况。
:::

## 功能支持 {#feature-support}

SDK 里有某个 API，不代表 Runtime 一定支持它。当 Runtime 不支持某个功能时，SDK 不会让网页崩溃，而是按该功能约定的降级行为处理，通常是「渲染非空间化版本」或「什么都不做」。

要判断当前运行网页的 Runtime 是否支持某个功能，请使用 React SDK 导出的公开检测 API：

```ts title="使用功能前先检测"
import { WebSpatialRuntime } from "@webspatial/react-sdk";

if (WebSpatialRuntime.supports("useAnimation")) {
  // 当前 Runtime 支持 useAnimation。
}
```

部分能力还有子能力，可以作为第二个参数传入。只有当该能力以及列出的每一个子能力都被支持时，结果才是 `true`：

```ts title="检测子能力"
import { WebSpatialRuntime } from "@webspatial/react-sdk";

if (WebSpatialRuntime.supports("VolumeScene", ["worldScaling"])) {
  // Runtime 支持 volume 场景以及 worldScaling 场景选项。
}
```

### 行为 {#behavior}

`WebSpatialRuntime.supports(name, tokens?)` 是同步的，可以在服务端渲染时安全调用，并且在整个页面生命周期内结果稳定。

以下情况返回 `false`：

- 网页没有运行在 [WebSpatial Runtime](../concepts/webspatial-app.md#webspatial-runtime) 中，包括普通桌面和移动端浏览器，以及服务端渲染
- 检测到了 Runtime，但它不支持该能力
- `name` 不是已知的能力键
- `tokens` 中有任何一项不是 `name` 的已知子能力

传入空的 `tokens` 数组与省略该参数的行为相同。

### 能力键 {#capability-keys}

能力键与对应的 WebSpatial API 同名。文档中使用的组件别名同样可用，比如 `Box` 对应 `BoxEntity`，`World` 对应 `SceneGraph`。下表列出的是 `@webspatial/core-sdk` 2.0.0 定义的键。更新的 SDK 版本可能会增加键；已安装的 SDK 没有定义的键始终返回 `false`。

| 类别 | 键 | 子能力 |
| ---- | -- | ------ |
| [React 组件](../api/react-sdk/react-components) | `Model`、`Reality`、`Entity`、`BoxEntity`、`SphereEntity`、`ConeEntity`、`CylinderEntity`、`PlaneEntity`、`SceneGraph`、`ModelAsset`、`ModelEntity`、`Material`、`UnlitMaterial`、`AttachmentAsset`、`AttachmentEntity` | `Model`：`autoplay`、`loop`、`stagemode`、`poster`、`loading`、`source`、`ready`、`currentSrc`、`entityTransform`、`paused`、`duration`、`playbackRate`、`play`、`pause`、`currentTime`<br />`Material`：`unlit`<br />`AttachmentEntity`：`placement` |
| [CSS API](../api/react-sdk/css-api) | `-xr-background-material`、`-xr-back`、`-xr-depth`、`-xr-transform` | |
| [Event API](../api/react-sdk/event-api) | `SpatialTapEvent`、`SpatialDragStartEvent`、`SpatialDragEvent`、`SpatialDragEndEvent`、`SpatialRotateEvent`、`SpatialRotateEndEvent`、`SpatialMagnifyEvent`、`SpatialMagnifyEndEvent` | `SpatialRotateEvent`：`constrainedToAxis` |
| [JS API](../api/react-sdk/js-api) 与[场景选项](../api/react-sdk/scene-options) | `useMetrics`、`convertCoordinate`、`initScene`、`WindowScene`、`VolumeScene` | `WindowScene`：`defaultSize`、`resizability`<br />`VolumeScene`：`defaultSize`、`resizability`、`worldScaling`、`worldAlignment`、`baseplateVisibility` |
| [DOM API](../api/react-sdk/dom-api) | `xrClientDepth`、`xrOffsetBack`、`xrInnerDepth`、`xrOuterDepth` | |
| 动画 | `useAnimation` | |

:::caution[实验性的键]
`useAnimation` 对应的 API 只从需要主动选择的 `@webspatial/react-sdk/experimental` 入口导出。它的名称和参数仍可能变化，本文档暂未覆盖。这个键返回 `true` 只表示 Runtime 支持该功能，不代表 API 已经稳定。
:::

:::tip[查看你的 Runtime 的实时结果]
WebSpatial SDK 测试服务器提供了 [Runtime capabilities](https://webspatial-sdk-test-server.vercel.app/#/runtime-capabilities) 页面。在目标 Runtime（比如 PICO OS 6 模拟器）中打开它，就能看到检测到的 Runtime、使用的能力来源，以及每个键和子能力的实时 `supports()` 结果。这是不写代码就能回答「这个模拟器支持不支持 X」的最快方式。该页面运行的是随测试服务器部署的 SDK 构建，可能比你项目中安装的 SDK 更新，因此其键列表可能包含你的版本尚未定义的键。
:::

## 兼容性模型 {#compatibility-model}

`WebSpatialRuntime.supports()` 是唯一的公开入口，但了解它的结果从何而来会很有帮助：

1. **SDK。** 网页运行的是项目中安装的 SDK 版本。SDK 定义了它所知道的能力键集合。
2. **Runtime 检测。** SDK 读取 [User Agent](../api/react-sdk/dom-api/userAgent.md) 来判断是哪种 Runtime 在运行网页。Mac 类 User Agent 中的 `WSAppShell/<version>` 表示打包应用中内置的 visionOS Runtime；`PicoWebApp/<version>` 表示 PICO OS 6 的 Web App Runtime。其他情况一律视为非 WebSpatial 浏览器，所有能力都为 `false`。
3. **Runtime 能力清单（如果有）。** SDK 的设计允许 Runtime 直接向网页声明其完整的支持能力列表。当存在这样的清单且与检测到的 Runtime 匹配时，它就是权威答案，清单中缺失的键为 `false`。目前还没有已发布的 Runtime 提供这份清单：`@webspatial/core-sdk` 2.0.0 不会读取它，`@webspatial/platform-visionos` 2.0.0 也不会输出它。这一步正在 WebSpatial SDK 仓库中开发，预计会先在 visionOS 上落地。
4. **必要时回退到版本表。** 没有清单时，SDK 会在随 SDK 内置的版本表中查找检测到的 Runtime 版本。在 2.0.0 中，visionOS 和 PICO OS 6 上的所有 Runtime 都是这样解析的。版本表会选择不高于检测到的 Runtime 版本的最新条目，因此比最新条目更新的 Runtime 会被当作该最新条目处理；比最早条目还旧的 Runtime，所有能力都为 `false`。
5. **`WebSpatialRuntime.supports()`** 返回上述查找的结果。

与能力检测无关的另一点是：[`<SpatialBoot>`](../api/react-sdk/react-components/SpatialBoot.md) 只在检测到 WebSpatial Runtime 时才加载 SDK 的空间化实现。在普通浏览器中，空间化代码根本不会被下载。

### visionOS 与 PICO OS 6 的差异 {#visionos-vs-pico-os-6}

| | visionOS | PICO OS 6 |
| --- | -------- | --------- |
| Runtime 来源 | 由 [WebSpatial Builder](../concepts/webspatial-app.md#webspatial-builder) 从 `@webspatial/platform-visionos` 打包进你的应用 | 内置于操作系统，随 PICO 系统更新 |
| Runtime 版本标识 | `WSAppShell/<version>`，其中 `<version>` 是打包时使用的 `@webspatial/platform-visionos` 版本 | `PicoWebApp/<version>`，由 PICO 分配 |
| 2.0.0 中的能力来源 | SDK 内置的版本表，按 `WSAppShell` 版本查找 | SDK 内置的版本表，按 `PicoWebApp` 版本查找 |
| SDK 与 Runtime 版本会不会错开 | 只有在不同步升级 npm 包时才会，因为两者是一起发布的 | 会，而且很常见。Runtime 版本由用户的系统决定。 |
| 如何获得更新的 Runtime | 升级 `@webspatial/platform-visionos` 并重新打包 | 更新模拟器或设备固件 |

正因为这些差异，PICO OS 6 是运行时功能检测最重要的场景。同一个网站可能被运行不同 PICO OS 版本的设备打开，所以对于不是所有 Runtime 都支持的功能，请始终用 `WebSpatialRuntime.supports()` 做判断，而不要假设用户使用的是最新 Runtime。

两个平台之间的具体能力差异会随每次 Runtime 发布而变化，因此本页不逐项列出。请使用 `WebSpatialRuntime.supports()` 或 [Runtime capabilities 测试页](https://webspatial-sdk-test-server.vercel.app/#/runtime-capabilities) 来检查特定 Runtime 上的特定键。

## 版本不匹配时的处理 {#version-mismatch-guidance}

### SDK 比 Runtime 新 {#the-sdk-is-newer-than-the-runtime}

这是 PICO OS 6 上的常态，也是 visionOS 应用升级了 `@webspatial/react-sdk` 却没有重新打包时的情况。

- Runtime 支持的功能都会继续正常工作。
- Runtime 不支持的能力解析为 `false`，SDK 会应用约定的降级行为：[`<Model>`](../api/react-sdk/react-components/Model.md) 渲染标准的 `<model>` 元素，[`<Reality>`](../api/react-sdk/react-components/Reality.md) 渲染一个保留布局盒的隐藏占位元素，其他不支持的 3D 组件不渲染任何内容。
- 仅在 Runtime 中可用的函数不会悄悄返回错误的值。当对应能力不受支持时，[`useMetrics`](../api/react-sdk/js-api/useMetrics.md) 返回的换算函数和 [`convertCoordinate`](../api/react-sdk/js-api/convertCoordinate.md) 会抛出 `WebSpatialRuntimeError`。请用 `WebSpatialRuntime.supports("useMetrics")` 或 `WebSpatialRuntime.supports("convertCoordinate")` 先做判断。
- 对于不是所有 Runtime 都支持的功能，在 `supports()` 返回 `false` 时渲染替代内容，而不要依赖降级行为。

### Runtime 比 SDK 新 {#the-runtime-is-newer-than-the-sdk}

- SDK 只能报告它已知的能力。在你使用的 SDK 版本发布之后才加入 Runtime 的功能，在升级 SDK 之前无法被检测到。
- 比 SDK 版本表中最新条目更新的 Runtime 版本会解析为该最新条目，因此更新的 Runtime 功能会被报告为不支持，直到 SDK 更新为止。在 2.0.0 中，两个平台都是如此。
- 同时升级 `@webspatial/react-sdk` 和 `@webspatial/core-sdk`，以获得新的键和新的 Runtime 支持信息。

### Runtime 只支持 SDK API 的一部分 {#the-runtime-supports-only-part-of-the-sdk-api-surface}

这是预期之内的情况，也正是 `supports()` 的用途。把不属于基础[空间化 HTML 元素](../concepts/spatialized-html-elements.md)和[空间场景](../concepts/spatial-scenes.md)功能集的每一项能力都当作可选功能，使用前先检测。优先检测你真正需要的最具体的能力，比如用 `supports("Model", ["autoplay"])` 而不是只用 `supports("Model")`。

### 已安装的包版本与文档不一致 {#the-installed-package-version-differs-from-the-docs}

本文档描述的是最新的 2.x SDK。如果 `npm ls @webspatial/react-sdk` 显示的是 1.x 版本，请使用 [1.0.x 文档](/docs/1.0.x)或升级。如果显示的是比 `latest` 更旧的 2.x 版本，文档中提到的某些 API 或能力键可能在你的版本中尚未导出。请一起升级所有 WebSpatial 包，然后重新打包 visionOS 应用，使内置 Runtime 与 SDK 保持一致。

## 已知限制 {#known-limitations}

以下情况不会体现在 `WebSpatialRuntime.supports()` 的结果中，需要单独处理：

- **支持不等于就绪。** `supports()` 报告的是 Runtime 能做什么，而不是 SDK 的空间化实现是否已经加载完成。仅在 Runtime 中可用的 API 仍然必须在 [`<SpatialBoot>`](../api/react-sdk/react-components/SpatialBoot.md) 内部使用，或者在 `bootSpatial()` 完成之后使用。
- **服务端渲染。** `supports()` 在服务端返回 `false`，在客户端可能返回 `true`。在首次渲染时根据它的结果渲染不同的标记可能导致 hydration 不匹配。请在 `<SpatialBoot>` 的子组件、effect 或事件处理函数中调用它。
- **2.0.0 的检测基于版本表。** SDK 无法看到版本表中没有记录的、不同构建之间的差异。如果某个功能在两个报告相同 `WSAppShell` 或 `PicoWebApp` 版本的 Runtime 构建上表现不同，`supports()` 无法区分它们。这在 PICO OS 6 上最需要注意，因为那里的 Runtime 是独立于你的 npm 包更新的。
- **非空间化平台。** JSAR Runtime、IRIS OS、Android XR 和 Meta Horizon OS 目前还不会被识别为 WebSpatial Runtime，因此在这些平台上所有能力都为 `false`，详见[支持的平台](./getting-started.md#supported-platforms)。
