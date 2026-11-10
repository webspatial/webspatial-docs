---
sidebar_position: 1
description: '了解 WebSpatial 给 Web 带来的能力、SDK 的工作方式，以及如何把它接入 React 项目。'
---

# 快速开始 {#getting-started}

## 概述 {#overview}

WebSpatial 提供拟议中的 HTML/CSS/DOM API 扩展和开源 [React SDK](#webspatial-sdk)，用于空间化 HTML、3D 内容和空间交互。当前 SDK 结合 [WebSpatial Runtime](../concepts/webspatial-app.md#webspatial-runtime) 通过 hybrid 技术实现这些能力。[「2D 包含 3D」](#philosophy)模型把 CSS 布局与局部 3D 内容结合起来。可用能力取决于 SDK 版本、Runtime 版本和运行模式，详见[支持的平台](#supported-platforms)。网站也可以通过 URL 分发，但空间能力需要受支持的 Runtime。

## 功能特性 {#features}

### WebSpatial API {#webspatial-api}

以下能力的 Runtime 要求各不相同。使用前请检查[版本化支持表](#supported-platforms)及对应 API 文档。

1. **空间场景**：在受支持的 Runtime 中，Web App（PWA）的[起始网页](../concepts/spatial-scenes.md#start-scene)和每个[在新窗口打开的自身网页](../concepts/spatial-scenes.md#new-scenes)，都成为了跟空间环境结合的[空间场景容器](../concepts/spatial-scenes.md)，可以对这些容器的空间属性做不同的[初始化设置](../concepts/spatial-scenes.md#scene-initialization)。
2. **材质化背板**：[平面窗口类型](../concepts/spatial-scenes.md#scene-type)的网页，可以把[背景面板](../api/react-sdk/css-api/background-material.md)设置为原生质感的半透明材质，随视角和环境实时动态渲染，也可以把背景面板设置为完全透明、边框不可见，让网页中各个元素看上去分散漂浮在空间中。
3. **体积窗口**：可以把网页窗口[在空间中的行为方式](../concepts/spatial-computing.md)，从优先服务于 2D GUI 需求，改成[模拟真实世界中的物体，让窗口像「盒子」一样](../concepts/spatial-scenes.md#scene-type)有真实体积和[深度](../api/react-sdk/dom-api/innerDepth.md)。
4. **空间化 HTML 元素**：受支持的 HTML 元素可以被「抬升」到网页平面前方的 3D 空间中，同时继续参与 CSS 布局系统。这些[被空间化](../concepts/spatialized-html-elements.md)的 HTML 元素，一方面[在 X 轴和 Y 轴上的原有状态和 API](../concepts/spatialized-html-elements.md) 都保持不变，另一方面能作为悬浮在空间场景中的 2D 面片，可以有[材质化背板](../api/react-sdk/css-api/background-material.md)，能通过 CSS 在 Z 轴上[布局和定位](../api/react-sdk/css-api/back.md)、在 3D 空间中做旋转等[变形转换](../api/react-sdk/css-api/transform.md)，可以通过 DOM API 获取[相关状态](../concepts/spatialized-html-elements.md)。
5. **材质化背景**：HTML 元素的背景可以设置为[实时渲染的半透明材质](../api/react-sdk/css-api/background-material.md)，而不仅限于固定颜色。
6. **3D 容器元素**：提供两种 WebSpatial SDK React 组件，作为有真实体积的 3D 内容的容器。这些 3D 容器元素仍然[作为 2D 面片](../concepts/spatialized-html-elements.md)参与 CSS 布局系统，支持 Z 轴[布局](../api/react-sdk/css-api/back.md)和[变形](../api/react-sdk/css-api/transform.md)，但除此之外还能在 2D 面片前方建立一个基于 [3D 开发范式](../concepts/3d-content-containers.md)的局部空间，在其中渲染有真实体积的 3D 内容，让它们能融入 2D 布局系统和 [2D GUI 框架的渲染机制](https://react.dev/learn/thinking-in-react)，实现[「2D 包含 3D」的开发范式](#philosophy)。
7. **静态 3D 容器元素**：支持用[预制好的 3D 模型资产文件](../api/react-sdk/react-components/Model.md)来渲染容器中的 3D 内容，这种 3D 容器元素的 API [遵循拟议 model-element API 的一个子集](../api/react-sdk/react-components/Model.md)。
8. **动态 3D 容器元素**：支持用[可灵活编程的 HTML 风格 3D 引擎 API](../concepts/3d-content-containers.md#3d-engine-api) 来动态渲染容器中的 3D 内容。
9. **HTML 风格的 3D 引擎 API**：这些 API 包括 [3D 资产声明](../concepts/3d-content-containers.md#3d-engine-api)（模型、材质等），以及内置能力模块、开箱即用的 [3D 实体](../api/react-sdk/react-components/Reality.md)（比如预制的几何形状）。可以通过树状结构和 [Transform 属性](../api/react-sdk/react-components/Reality.md)在 [3D 坐标系](../concepts/3d-content-containers.md#2d-containing-3d)中自由组合这些实体，实现任意 3D 场景和动画效果。
10. **2D 附着实体**：可以[把 2D HTML 内容附着在面片形状的 3D 实体上](../api/react-sdk/react-components/Reality.md)，让 3D 内容中也可以嵌入全功能的 2D 内容。
11. **空间交互**：在空间化 2D HTML 元素对应的 2D 面片上，在 3D 容器元素中的 3D 内容上（3D 网格的表面或包围盒），都可以触发[新的空间交互事件](../concepts/natural-interactions.md#spatial-interactions)（比如点击、拖拽、旋转等），获得 3D 坐标系位置等 3D 空间中的交互信息。
12. **2D + 3D 混合内容**：基于 CSS 布局系统的 2D 内容，和基于 3D 引擎的动态 3D 容器内容，可以通过[坐标系转换、单位转换](../concepts/3d-content-containers.md#2d-containing-3d)等 API 实现彼此之间的对齐、联动等结合。

### WebSpatial SDK {#webspatial-sdk}

1. **React 中的拟议 API**：结合[原生 Runtime 实现](../concepts/webspatial-app.md#webspatial-runtime)，SDK 通过 React JSX、Ref 和 CSS 实现空间 API。这些 SDK API 不代表浏览器已原生支持。
2. **版本要求**：实验性 API 可能变化。升级前请检查所需的 SDK 和 Runtime 版本、[发布说明](https://github.com/webspatial/webspatial-sdk/releases)及 API 限制。
3. **平台相关行为**：可用功能和行为取决于平台、Runtime 版本和运行模式。没有受支持的 Runtime 时，`<SpatialBoot>` 会渲染应用而不加载空间实现。请在目标普通浏览器中测试布局、交互、回退内容和性能。
4. **特性检测**：使用能力检测和 [Runtime 检测](../api/react-sdk/dom-api/userAgent.md)保护空间 API 调用，并为不可用的能力提供替代方案。
5. **应用打包**：PWA 可以打包为[自带 WebSpatial Runtime 的原生应用安装包](../concepts/webspatial-app.md#packaged-webspatial-app)，例如 visionOS 应用。安装包仍依赖平台系统框架和 Web Runtime，可以在受支持的模拟器或设备上[预览调试](#preview)，并[提交到 visionOS App Store](#distribution)。

## 设计理念 {#philosophy}

1. 采用「[2D 包含 3D](../concepts/3d-content-containers.md#2d-containing-3d)」的全新开发范式——以 2D Web 生态和 HTML/CSS API 为基础，延续开发者熟悉的 2D 思维方式和开发方式；只增加[面向 2D 元素的 Z 轴 API](../concepts/spatialized-html-elements.md)，以及能[把 3D 局部空间作为 2D 元素使用的 API](../concepts/3d-content-containers.md)；把 [3D 开发范式](../concepts/3d-content-containers.md#3d-engine-api)限制在 3D 局部空间内部，把这些局部的 3D 渲染融入到整体的 2D 渲染机制中；让开发者按需使用 3D 能力，不必把整个应用都用 3D 方式来开发、与主流 2D 生态割裂。
2. 只在 HTML/CSS/DOM API 里做最小化的扩展，在 [X/Y 轴相关的功能](../concepts/spatialized-html-elements.md)上沿用现有的 Web 标准 API，且能跟新扩展出的 [Z 轴相关 API](../api/react-sdk/css-api/back.md) 组合使用。
3. 在 3D 局部空间中，避免像 WebXR 那样用底层 3D 图形 API 做[独立渲染](https://tpac2025.webspatial.dev/#webxr-not-enough)，而是通过[结合 ECS 和 HTML 的声明式 3D 引擎 API](../concepts/3d-content-containers.md#3d-engine-api)，让空间计算平台能理解这些 3D 内容，能把它们跟其他应用的内容一起在同一个空间做[统一渲染](../concepts/spatial-computing.md#unified-rendering)。
4. 避免像 [WebXR session](https://developer.picoxr.com/document/web/introduce-webxr-standards/) 那样在单一网页的代码里实现一个[空间应用](../concepts/spatial-computing.md#spatial-app)的所有内容，而是保持多页网站、网页链接、PWA 等标准 Web 开发方式，通过 [Web App Manifest](../concepts/webspatial-app.md#web-app) 和[「在新窗口打开链接」](../concepts/spatial-scenes.md#new-scenes)来提供空间应用整体和[空间容器](../concepts/spatial-scenes.md)的能力。
5. [SDK](#webspatial-sdk) 对拟议标准中 HTML/CSS/DOM API 的[模拟预实现](https://www.w3.org/2001/tag/doc/polyfills/)要适度，不能过于复杂和不可控，因此只在遵循 [Rules of React](https://react.dev/reference/rules) 的声明式代码中支持修改[空间化样式/状态](../concepts/spatialized-html-elements.md)和[监听空间事件](../concepts/natural-interactions.md#spatial-interactions)，只在通过 [Hook API](https://react.dev/reference/react/hooks) 获取的对象（比如 [Ref](https://react.dev/learn/referencing-values-with-refs)）上支持[读取空间化样式/状态（只读）](../concepts/spatialized-html-elements.md)，不支持[直接选择 DOM 对象](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector)、用命令式代码做这些操作。
6. [SDK](#webspatial-sdk) 通过 [JSX 配置和初始化](#set-up-your-project)在 React 项目中接入空间 API。具体要求因构建工具和框架而异。请在项目中验证构建、调试流程、普通 2D 行为和性能。
7. WebSpatial 应用仍可以作为网站通过 [URL 分发](#distribution)。普通网站访问与空间能力支持是两回事：每个目标环境都需要经过测试的 2D 体验，空间增强则需要受支持的 Runtime。

## 支持的 Web 项目 {#supported-web-projects}

开源 [WebSpatial SDK](#webspatial-sdk) 提供 [React SDK](../api/react-sdk/)。以下配置已有使用实践；其他 React 框架、插件和依赖组合需要验证。集成 SDK 不代表每个 Runtime 都支持所有 API。

React SDK 需要被集成到 [JSX Runtime](https://www.typescriptlang.org/docs/handbook/jsx.html) 里，在用 TypeScript 的 React 项目中需要[配置 `jsxImportSource`](#set-up-your-project)（少数 web build tool 需要做[额外配置](../how-to/rspack.md)）。用 JavaScript 的项目[只能在 web build tool 里配置 JSX Runtime](../how-to/non-ts.md)。
目前测试和实践较多的 web build tool 有：

- Vite
- Next.js、Remix ([支持 SSR](../how-to/ssr.md))
- Rspack / Rsbuild / Webpack

:::caution[当前限制]
WebSpatial SDK 最新版本暂时有 bug，导致暂时不支持 styled-components。
:::

## 支持的平台 {#supported-platforms}

以下支持范围以 [SDK 2.0.0 能力矩阵](https://github.com/webspatial/webspatial-sdk/blob/%40webspatial/react-sdk%402.0.0/packages/core/src/runtime/capability-data.ts)中记录的 Runtime 版本为准，不涵盖所有设备或 OS 版本。Runtime 标识与 OS 版本、npm 包版本相互独立。使用功能前，请检查[发布说明](https://github.com/webspatial/webspatial-sdk/releases)及实际 Runtime 提供的能力。

| 平台 | SDK 参考版本 / Runtime 版本 | 运行模式 | 已知限制 |
| --- | --- | --- | --- |
| [visionOS](https://developer.apple.com/visionos/) | SDK 2.0.0；`WSAppShell/1.5.0`、`1.6.0`、`1.7.0`、`1.8.0` | 通过 Builder 和 `@webspatial/platform-visionos` 生成的[打包 hybrid app](../concepts/webspatial-app.md#packaged-webspatial-app) | 仅使用 Safari 不会启用 WebSpatial。Model 能力因 Shell 版本而异；文档所述实现中的 WKWebView 不支持 WebXR。 |
| [PICO OS 6](https://developer.picoxr.com/document/discover/pico-os-6-overview/) | SDK 2.0.0；`PicoWebApp/0.1.1`、`0.1.2`、`0.2.2`、`0.3.1`、`0.4.90` | 在浏览器之外独立运行的 [Web App Runtime](https://developer.picoxr.com/document/web/web-app/)；无需 Builder 打包 | 所列 Runtime 不提供 `xrInnerDepth` 和 `xrOuterDepth`。Model 能力因 Runtime 版本而异。 |
| 没有 WebSpatial Runtime 的普通浏览器 | 取决于浏览器；无空间 Runtime | 网站或 PWA | 仅提供 2D 体验，需要测试回退行为。`<Model>` 需要浏览器原生支持 model element 或单独引入 polyfill。 |

### 能力状态 {#capability-status}

下表概括同一版本化矩阵。**支持**表示这些版本的 Runtime 声明了该能力；**有限支持**表示仅提供部分能力。即使 Runtime 已支持，实验性 API 仍可能变化。这些状态不代表所有框架和浏览器组合都已通过验证。

| 能力 | 上述 visionOS Runtime | 上述 PICO Runtime |
| --- | --- | --- |
| Window 和 volume 场景 | 支持；场景选项取决于 Runtime | 支持；场景选项取决于 Runtime |
| 空间化 HTML、Z 轴布局、变形、材质背板 | 支持，受 [SDK 限制](../concepts/spatialized-html-elements.md)约束 | 支持，受 [SDK 限制](../concepts/spatialized-html-elements.md)约束 |
| 静态 3D（`Model`） | 有限支持：`1.5.0` 提供基础加载和变形 API；`1.6.0` 扩展播放能力；`1.7.0` 增加 `poster`、`loading`、`currentTime` | 有限支持：`0.1.1` 提供基础 API；`0.1.2` 增加播放、`poster`、`currentTime`；`0.3.1` 增加 `loading` |
| 动态 3D、实体和附着实体 | 支持；这些版本不支持附着实体 placement 扩展 | 支持；附着实体 placement 扩展需要 `0.4.90` |
| 单击、拖拽、旋转、缩放 | 支持；输入映射[因平台而异](../concepts/natural-interactions.md) | 支持；输入映射[因平台而异](../concepts/natural-interactions.md) |
| 单位和坐标转换 | 支持 | 支持 |
| 场景深度（`xrInnerDepth`、`xrOuterDepth`） | 支持 | 所列版本不可用 |
| 无边界 `stage` 场景 | 文档所述 SDK 不支持 | 文档所述 SDK 不支持 |

其他要求和限制请参阅对应 API 文档。未列出的 Runtime 或平台需要单独核实，不代表交付承诺。

## 安装 {#installation}

### 步骤 1：Runtime SDK {#step-1-runtime-sdk}

要在一个 React 项目里启用 [WebSpatial API](#webspatial-api)，需要安装 [WebSpatial SDK](#webspatial-sdk) 项目提供的 React SDK 和底层的 Core SDK：

```bash npm2yarn
npm install @webspatial/react-sdk @webspatial/core-sdk
```

### 步骤 2（可选）：Builder {#step-2-optional-builder}

对于没有内置 [WebSpatial Runtime](../concepts/webspatial-app.md#webspatial-runtime) 的空间计算平台，需要把网站打包成[自带 WebSpatial Runtime 的原生应用](../concepts/webspatial-app.md#packaged-webspatial-app)，因此还需要以下安装步骤：

:::tip[PICO OS 6 不需要打包]
[PICO OS 6](https://developer.picoxr.com/document/discover/pico-os-6-overview/) 的 [Web App Runtime](https://developer.picoxr.com/document/web/web-app/) 里内置了 WebSpatial Runtime，可以直接让网站中的 WebSpatial API 生效，因此不需要打包，也不需要做下面这些额外的安装操作。
:::

1. 需要在 React 项目里额外安装 WebSpatial SDK 项目提供的打包工具（[WebSpatial Builder](../concepts/webspatial-app.md#webspatial-builder)）：

```bash npm2yarn
npm install -D @webspatial/builder
```

2. 对应平台上的 WebSpatial Runtime 实现在独立的 npm 包里，需要单独安装。因此如果要支持 visionOS，需要安装这个包：

```bash npm2yarn
npm install -D @webspatial/platform-visionos
```

3. 为了打包生成原生应用，WebSpatial Builder 需要调用对应平台的原生开发工具，因此如果要支持 visionOS，需要[安装 Xcode 和 visionOS 相关组件](../how-to/xcode.md)。

## 配置项目 {#set-up-your-project}

### 步骤 1：JSX Runtime {#step-1-jsx-runtime}

在使用 WebSpatial API 之前，需要把 React SDK 集成到当前 React 项目的 [JSX Runtime](https://www.typescriptlang.org/docs/handbook/jsx.html) 里。

对于用 TypeScript 的 React 项目，只需要配置 tsconfig 的 [`jsxImportSource`](https://www.typescriptlang.org/tsconfig/jsxImportSource.html) 字段：

```json title="tsconfig.json" {4}
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@webspatial/react-sdk",
// ...
```

:::tip[相关配置指南]
- 对于基于 Rspack 的 TS 项目，还需要[配置 `swc-loader`](../how-to/rspack.md)。
- 用 JavaScript 的 React 项目，需要[在 Web Build Tool 里配置 JSX Runtime](../how-to/non-ts.md)。
:::

### 步骤 2：Spatial Boot {#step-2-spatial-boot}

接下来，用 React SDK 提供的 [`<SpatialBoot>` 组件](../api/react-sdk/react-components/SpatialBoot.md)包裹应用：

```jsx title="main.jsx" {2,5-7}
import { createRoot } from "react-dom/client";
import { SpatialBoot } from "@webspatial/react-sdk";

createRoot(document.getElementById("root")).render(
  <SpatialBoot>
    <App />
  </SpatialBoot>,
);
```

`<SpatialBoot>` 会检测 Runtime 是否可用。在受支持的 [WebSpatial Runtime](../concepts/webspatial-app.md#webspatial-runtime) 中，它会在渲染应用前加载空间实现；在普通浏览器中，则不加载该实现而直接渲染应用。这不保证行为完全一致或零开销：请单独测试 2D 布局、输入、回退内容和性能。

:::tip[SSR 项目]
对于开启 SSR 的项目，`<SpatialBoot>` 必须放在客户端渲染的代码里。参见[如何在启用 SSR 的项目中启用 WebSpatial](../how-to/ssr.md)。
:::

### 步骤 3：满足 PWA 的最低要求 {#step-3-minimal-pwa}

为了提供空间应用需要的应用信息和[起始窗口的设置](../concepts/spatial-scenes.md#start-scene)，需要在当前网站中[按照 PWA 标准提供 Web App Manifest](../how-to/minimal-pwa.md)。

:::tip[示例文件]
[webspatial-icon-examples.zip](https://webspatial.dev/assets/guide/webspatial-icon-examples.zip) 包含已经满足 PWA 要求的图标文件和 manifest 文件。
只需要把它解压到网站中可以通过 URL 公开访问的目录里，然后在 HTML 中用 `<link rel="manifest" href="/app.webmanifest" />` 嵌入 manifest 文件的 URL。
:::

:::tip[已经是 PWA？]
如果当前网站原本就是一个 PWA，可以作为 PWA 在 Chrome 里安装，就可以跳过这一步。
:::

## 起始模板 {#boilerplate}

如果想快速开始，建议直接使用 [`@webspatial/starter`](https://www.npmjs.com/package/@webspatial/starter) CLI。

创建一个新的 WebSpatial 项目：

```bash title="创建新的 WebSpatial 项目"
npx @webspatial/starter create my-webspatial-app
```

在已有 Web 项目中一键添加 WebSpatial AI 资源：

```bash title="为现有项目添加 WebSpatial AI 资源"
npx @webspatial/starter ai
```

`ai` 命令会为当前 Web 项目生成一套项目本地的 WebSpatial AI 资源，其中包括全套文档、项目指引和 agent skills。这些资源是专门为嵌入开发者自己的 Web 项目而设计的，让 agent 可以基于它们理解推荐的 WebSpatial 工作流，并协助完成初始化、接入以及后续开发等任务。

## 预览 {#preview}

要预览和调试 [WebSpatial 效果](#webspatial-api)，首先只需要像普通网站开发一样，把当前 Web 项目作为一个网站运行起来，获得可访问的 URL。比如用 Vite 的 [Dev Server](https://vite.dev/guide/#command-line-interface)：

```bash title="启动本地开发服务器" {1}
vite dev
# result:
# -> Local: http://localhost:5173/
```

### 网站模式 {#website-mode}

对于[内置 WebSpatial Runtime](https://developer.picoxr.com/document/web/web-platform/) 的空间计算平台（比如 [PICO OS 6](https://developer.picoxr.com/document/discover/pico-os-6-overview/)）：

只需要在[官方模拟器](https://developer.picoxr.com/document/spatial-toolkit/learn-about-pico-emulator/)或真机 PICO OS 6 设备上的 PICO 浏览器里访问当前网站的网址，然后点击地址栏里的「作为独立应用运行」按钮，这个网站就会作为[启用了 WebSpatial 的 Web App](https://developer.picoxr.com/document/web/install-free/) 独立运行，从而能看到 WebSpatial 生效后的空间化 UI 效果和有体积的 3D 内容。

:::tip[PICO OS 6 模拟器网络访问]
在 PICO OS 6 的模拟器里把本地 URL 作为 Web App 预览时，[不要求网址采用 HTTPS 协议](https://developer.picoxr.com/document/web/manifest/)，同时需要使用默认 IP 地址 `10.0.2.2`。例如：`http://10.0.2.2:5173/`。

如果要通过 `10.0.2.2` 访问 Vite 的 dev server，需要在 Vite 中[设置 `server: { host: true }`](https://vitejs.dev/config/server-options)，让它允许来自 `localhost` 或 `127.0.0.1` 之外的 IP 访问。
:::

### 打包应用模式 {#packaged-app-mode}

对于没有内置 [WebSpatial Runtime](../concepts/webspatial-app.md#webspatial-runtime) 的空间计算平台（比如 visionOS）：

无法直接使用网站网址来预览调试，需要借助 [WebSpatial Builder](../concepts/webspatial-app.md#webspatial-builder)：

执行 Builder 的 [`run` 命令](../api/builder/run.md)有「一键预览」的效果：会自动把当前网站打包成[自带 WebSpatial Runtime 的原生应用安装包](../concepts/webspatial-app.md#packaged-webspatial-app)、调起官方模拟器（比如 [visionOS 模拟器](../how-to/xcode.md)）、把安装包传到模拟器里、安装、启动这个应用。

```bash title="在模拟器里预览应用" {1}
webspatial-builder run --base="http://localhost:5173/"
```

:::info[`run` 可以使用临时 manifest]
`run` 命令允许这个 Web 项目在初期的开发调试阶段不用提供 Web App Manifest。在这种情况下，Builder 会提供默认的临时[应用信息](../how-to/minimal-pwa.md)（`start_url` 为 `''`）。
:::

:::caution[离线打包会拖慢迭代]
如果 [`start_url` 不完整、缺少域名](../api/builder/run.md#--manifest)，又不[用 `--base` 为 `start_url` 补全 base 部分](../api/builder/run.md#--base)，Builder 会自动把网站产物打包进原生应用安装包里，运行过程中从应用包的本地文件中离线获取网站文件。

在开发调试阶段，这种模式会导致每次有代码修改都需要重新运行 Builder，等待打包和安装完成，效率较低，建议始终提供 `--base` 参数。
:::

要在个人真机测试设备上预览效果，需要执行 Builder 的 [`build` 命令](../api/builder/build.md)生成应用安装包，对于 visionOS 设备，需要[从 App Store Connect 获取额外参数、用 Xcode 注册测试设备和安装应用](../how-to/app-store-connect.md)。

## 调试 {#debug}

无论是在模拟器还是在测试设备上运行，无论是直接运行网站的网址，还是用 WebSpatial Builder 把网站打包安装后作为独立应用运行，都可以用本地电脑上浏览器的 Dev Tools 远程连接到空间计算环境里的 Web Runtime 上做调试。

visionOS 里的 WebSpatial 应用是基于 WebView 实现的，可以用 Mac 上 Safari 的 Web Inspector 功能，远程调试每个 WebView 实例里的状态和 web 代码，跟调试 iOS 设备里的网页一样。
可参考 Apple 官方文档：[Inspecting iOS and iPadOS](https://developer.apple.com/documentation/safari-developer-tools/inspecting-ios)

对像 PICO OS 6 这样基于 Android 的空间计算平台，可以用电脑上 Chrome 的 Dev Tools 对启用了 WebSpatial 的 Web App 做 remote debugging。
可参考 Google 的官方文档：[Remote debug Android devices](https://developer.chrome.com/docs/devtools/remote-debugging)

## 分发 {#distribution}

包含 WebSpatial 的 Web App 有两类分发方式：

第一种是通过 URL 分发网站。URL 让网站可访问，但不保证空间能力可用。在 PICO OS 6 上，空间功能需要独立运行的 Web App Runtime 及兼容版本；普通浏览器访问使用应用经过测试的 2D 体验。运行模式和限制详见[支持的平台](#supported-platforms)。

:::tip[PICO OS 6 上的 Web App]
在 [PICO OS 6](https://developer.picoxr.com/document/discover/pico-os-6-overview/) 设备上，Web App 即使不安装，也可以在浏览器之外[独立运行](https://developer.picoxr.com/document/web/install-free/)，并自动启用 WebSpatial 效果。
:::

第二类分发方式是上架应用商店，用户通过应用商店发现这个应用，先安装再使用。

上架 visionOS App Store 需要用 [WebSpatial Builder](../concepts/webspatial-app.md#webspatial-builder) 的 [`publish` 命令](../api/builder/publish.md)生成应用安装包和自动上传到 App Store Connect，需要一些[额外参数和注册步骤](../how-to/app-store-connect.md)。

[PICO 应用商店](https://developer.picoxr.com/document/distribute/)支持直接用提交 URL 的方式上架 Web App，不需要用 WebSpatial Builder 预先打包和上传。不过现阶段 PICO 开发者平台暂时没开放 Web App 的自助提交，需要通过 PICO 的商务合作渠道在 PICO 应用商店上架 Web App。
