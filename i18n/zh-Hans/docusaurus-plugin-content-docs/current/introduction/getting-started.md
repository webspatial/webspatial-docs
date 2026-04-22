---
sidebar_position: 1
description: '了解 WebSpatial 给 Web 带来的能力、SDK 的工作方式，以及如何把它接入 React 项目。'
---

# 快速开始 {#getting-started}

## 概述 {#overview}

WebSpatial 是一套[对 HTML/CSS/DOM API 的最小化扩展](https://tpac2025.webspatial.dev/)，以及 [Polyfill](https://www.w3.org/2001/tag/doc/polyfills/) 风格的开源 [SDK](#webspatial-sdk)，致力于在 Web 标准和现有主流 Web 框架中引入跟[原生空间应用](../concepts/spatial-computing.md#spatial-app)等价的[空间化 UI 能力](#features)和[「2D 包含 3D」范式](#philosophy)的开发者体验，让 HTML 内容在[空间计算](../concepts/spatial-computing.md)平台上能摆脱屏幕的限制、进入现实空间、获得真实体积、支持空间中的自然交互和灵活的 3D 编程，同时不影响 Web 原有的[跨平台能力](#philosophy)、思维方式和[开发方式](#preview)，让主流 Web 生态和 Web 开发者能无缝进入[空间计算和多模态 AI 的时代](https://tpac2025.webspatial.dev/)。

## 功能特性 {#features}

### WebSpatial API {#webspatial-api}

1. **空间场景**：Web App（PWA）的[起始网页](../concepts/spatial-scenes.md#start-scene)和每个[在新窗口打开的自身网页](../concepts/spatial-scenes.md#new-scenes)，都成为了跟空间环境结合的[空间场景容器](../concepts/spatial-scenes.md)，可以对这些容器的空间属性做不同的[初始化设置](../concepts/spatial-scenes.md#scene-initialization)。
2. **材质化背板**：[平面窗口类型](../concepts/spatial-scenes.md#scene-type)的网页，可以把[背景面板](../api/react-sdk/css-api/background-material.md)设置为原生质感的半透明材质，随视角和环境实时动态渲染，也可以把背景面板设置为完全透明、边框不可见，让网页中各个元素看上去分散漂浮在空间中。
3. **体积窗口**：可以把网页窗口[在空间中的行为方式](../concepts/spatial-computing.md)，从优先服务于 2D GUI 需求，改成[模拟真实世界中的物体，让窗口像「盒子」一样](../concepts/spatial-scenes.md#scene-type)有真实体积和[深度](../api/react-sdk/dom-api/innerDepth.md)。
4. **空间化 HTML 元素**：HTML 元素可以被「抬升」到网页平面前方的 3D 空间中，同时继续参与 CSS 布局系统。这些[被空间化](../concepts/spatialized-html-elements.md)的 HTML 元素，一方面[在 X 轴和 Y 轴上的原有状态和 API](../concepts/spatialized-html-elements.md) 都保持不变，另一方面能作为悬浮在空间场景中的 2D 面片，可以有[材质化背板](../api/react-sdk/css-api/background-material.md)，能通过 CSS 在 Z 轴上[布局和定位](../api/react-sdk/css-api/back.md)、在 3D 空间中做旋转等[变形转换](../api/react-sdk/css-api/transform.md)，可以通过 DOM API 获取[相关状态](../concepts/spatialized-html-elements.md)。
5. **材质化背景**：HTML 元素的背景可以设置为[实时渲染的半透明材质](../api/react-sdk/css-api/background-material.md)，而不仅限于固定颜色。
6. **3D 容器元素**：新增两种 3D HTML 元素，作为有真实体积的 3D 内容的容器。这些 3D 容器元素仍然[作为 2D 面片](../concepts/spatialized-html-elements.md)参与 CSS 布局系统，支持 Z 轴[布局](../api/react-sdk/css-api/back.md)和[变形](../api/react-sdk/css-api/transform.md)，但除此之外还能在 2D 面片前方建立一个基于 [3D 开发范式](../concepts/3d-content-containers.md)的局部空间，在其中渲染有真实体积的 3D 内容，让它们能融入 2D 布局系统和 [2D GUI 框架的渲染机制](https://react.dev/learn/thinking-in-react)，实现[「2D 包含 3D」的开发范式](#philosophy)。
7. **静态 3D 容器元素**：支持用[预制好的 3D 模型资产文件](../api/react-sdk/react-components/Model.md)来渲染容器中的 3D 内容，这种 3D 容器元素的 API [完全基于 Web 标准中的 model element](../api/react-sdk/react-components/Model.md)。
8. **动态 3D 容器元素**：支持用[可灵活编程的 HTML 风格 3D 引擎 API](../concepts/3d-content-containers.md#3d-engine-api) 来动态渲染容器中的 3D 内容。
9. **HTML 风格的 3D 引擎 API**：这些 API 包括 [3D 资产声明](../concepts/3d-content-containers.md#3d-engine-api)（模型、材质等），以及内置能力模块、开箱即用的 [3D 实体](../api/react-sdk/react-components/Reality.md)（比如预制的几何形状）。可以通过树状结构和 [Transform 属性](../api/react-sdk/react-components/Reality.md)在 [3D 坐标系](../concepts/3d-content-containers.md#2d-containing-3d)中自由组合这些实体，实现任意 3D 场景和动画效果。
10. **2D 附着实体**：可以[把 2D HTML 内容附着在面片形状的 3D 实体上](../api/react-sdk/react-components/Reality.md)，让 3D 内容中也可以嵌入全功能的 2D 内容。
11. **空间交互**：在空间化 2D HTML 元素对应的 2D 面片上，在 3D 容器元素中的 3D 内容上（3D 网格的表面或包围盒），都可以触发[新的空间交互事件](../concepts/natural-interactions.md#spatial-interactions)（比如点击、拖拽、旋转等），获得 3D 坐标系位置等 3D 空间中的交互信息。
12. **2D + 3D 混合内容**：基于 CSS 布局系统的 2D 内容，和基于 3D 引擎的动态 3D 容器内容，可以通过[坐标系转换、单位转换](../concepts/3d-content-containers.md#2d-containing-3d)等 API 实现彼此之间的对齐、联动等结合。

### WebSpatial SDK {#webspatial-sdk}

1. **前瞻性预实现**：结合[原生 Runtime 实现](../concepts/webspatial-app.md#webspatial-runtime)，在 React 项目的 JSX、Ref、CSS 里[提前模拟实现拟议标准](https://www.w3.org/2001/tag/doc/polyfills/)中的 HTML/DOM/CSS API，让 [WebSpatial API](#webspatial-api) 现在就立即可用 ，不用等待各个平台上的浏览器引擎正式支持这些 API。
2. **跨版本兼容**：屏蔽了 WebSpatial API 进入 Web 标准（HTML/CSS/DOM）过程中的不稳定、变动和平台差异，SDK 提供的 API 始终保持向后兼容，让旧代码一直可运行
3. **跨平台兼容**：在支持[空间计算和统一渲染](../concepts/spatial-computing.md)的平台上，会尽量屏蔽差异，提供跨平台统一的空间应用概念和空间化 UI 特性。在不支持空间计算和统一渲染的平台上，会自动忽略 WebSpatial API、不加载完整的 SDK 实现，不影响网页在桌面电脑、手机等屏幕设备和普通浏览器里的效果和性能。
4. **自定义跨平台逻辑**：提供特性检测和 [Runtime 检测](../api/react-sdk/dom-api/userAgent.md)方法，可以对少数无法自动忽略的 JS API / DOM API 调用做自定义的跨平台处理，也可以在空间计算平台上启用自定义的增强效果和专属功能。
5. **应用打包**：支持把 PWA 打包成[自带 WebSpatial Runtime、无外部依赖](../concepts/webspatial-app.md#packaged-webspatial-app)的原生应用安装包（比如 visionOS 应用），跟原生应用一样能在模拟器或真机设备上安装和[运行调试](#preview)，能[上架到 visionOS App Store 这样的应用商店](#distribution)。

## 设计理念 {#philosophy}

1. 采用「[2D 包含 3D](../concepts/3d-content-containers.md#2d-containing-3d)」的全新开发范式——以 2D Web 生态和 HTML/CSS API 为基础，延续开发者熟悉的 2D 思维方式和开发方式；只增加[面向 2D 元素的 Z 轴 API](../concepts/spatialized-html-elements.md)，以及能[把 3D 局部空间作为 2D 元素使用的 API](../concepts/3d-content-containers.md)；把 [3D 开发范式](../concepts/3d-content-containers.md#3d-engine-api)限制在 3D 局部空间内部，把这些局部的 3D 渲染融入到整体的 2D 渲染机制中；让开发者按需使用 3D 能力，不必把整个应用都用 3D 方式来开发、与主流 2D 生态割裂。
2. 只在 HTML/CSS/DOM API 里做最小化的扩展，在 [X/Y 轴相关的功能](../concepts/spatialized-html-elements.md)上沿用现有的 Web 标准 API，且能跟新扩展出的 [Z 轴相关 API](../api/react-sdk/css-api/back.md) 组合使用。
3. 在 3D 局部空间中，避免像 WebXR 那样用底层 3D 图形 API 做[独立渲染](https://tpac2025.webspatial.dev/#webxr-not-enough)，而是通过[结合 ECS 和 HTML 的声明式 3D 引擎 API](../concepts/3d-content-containers.md#3d-engine-api)，让空间计算平台能理解这些 3D 内容，能把它们跟其他应用的内容一起在同一个空间做[统一渲染](../concepts/spatial-computing.md#unified-rendering)。
4. 避免像 [WebXR session](https://developer.picoxr.com/document/web/introduce-webxr-standards/) 那样在单一网页的代码里实现一个[空间应用](../concepts/spatial-computing.md#spatial-app)的所有内容，而是保持多页网站、网页链接、PWA 等标准 Web 开发方式，通过 [Web App Manifest](../concepts/webspatial-app.md#web-app) 和[「在新窗口打开链接」](../concepts/spatial-scenes.md#new-scenes)来提供空间应用整体和[空间容器](../concepts/spatial-scenes.md)的能力。
5. [SDK](#webspatial-sdk) 对拟议标准中 HTML/CSS/DOM API 的[模拟预实现](https://www.w3.org/2001/tag/doc/polyfills/)要适度，不能过于复杂和不可控，因此只在遵循 [Rules of React](https://react.dev/reference/rules) 的声明式代码中支持修改[空间化样式/状态](../concepts/spatialized-html-elements.md)和[监听空间事件](../concepts/natural-interactions.md#spatial-interactions)，只在通过 [Hook API](https://react.dev/reference/react/hooks) 获取的对象（比如 [Ref](https://react.dev/learn/referencing-values-with-refs)）上支持[读取空间化样式/状态（只读）](../concepts/spatialized-html-elements.md)，不支持[直接选择 DOM 对象](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector)、用命令式代码做这些操作。
6. 让 [SDK](#webspatial-sdk) 能尽可能低成本、以[接近「一键安装」的方式](#installation)整合到现有的标准 Web 项目中，不改变项目[原有的开发流程、构建方式和部署方式](#preview)，确保这个网站在桌面/移动平台和普通浏览器里原有的效果、性能、调试都不受影响。
7. 在 WebSpatial API 和 SDK 的支持下，Web 开发者做一个全新[空间应用](../concepts/spatial-computing.md#spatial-app)的方式应该跟开发普通网站一样。只要开发者愿意，这个应用仍然能作为一个标准网站来分发，保持 Web 原有的跨平台能力和[基于网址的用法](https://tpac2025.webspatial.dev/#instant-apps)。

## 支持的 Web 项目 {#supported-web-projects}

目前 [WebSpatial SDK](#webspatial-sdk) 开源项目提供了 [React SDK](../api/react-sdk/)，只要是用 React 开发的标准网站项目，应该都能通过集成这个 SDK 来启用 [WebSpatial API](#webspatial-api)。

React SDK 需要被集成到 [JSX Runtime](https://www.typescriptlang.org/docs/handbook/jsx.html) 里，在用 TypeScript 的 React 项目中只需要[一行配置](#set-up-your-project)就可以完成（少数 web build tool 需要做[额外配置](../how-to/rspack.md)）。用 JavaScript 的项目[只能在 web build tool 里配置 JSX Runtime](../how-to/non-ts.md)。
目前测试和实践较多的 web build tool 有：

- Vite
- Next.js、Remix ([支持 SSR](../how-to/ssr.md))
- Rspack / Rsbuild / Webpack

:::caution[当前限制]
WebSpatial SDK 最新版本暂时有 bug，导致暂时不支持 styled-components。
:::

## 支持的平台 {#supported-platforms}

目前支持的[空间计算](../concepts/spatial-computing.md)平台有：

- ✅ [visionOS](https://developer.apple.com/visionos/)（比如 Vision Pro 设备）：可以用 WebSpatial SDK 把网站打包成包含完整 [WebSpatial Runtime](../concepts/webspatial-app.md#webspatial-runtime) 的 [hybrid app](../concepts/webspatial-app.md#packaged-webspatial-app) 上架 App Store，具备原生的空间化效果
- ✅ [PICO OS 6](https://developer.picoxr.com/document/discover/pico-os-6-overview/) (比如 [Project Swan](https://developer.picoxr.com/blog/pico-developer-special-event-2026/) 设备)：在操作系统里的 [Web App Runtime](https://developer.picoxr.com/zh/document/web/web-app/) 里内置了 [WebSpatial Runtime](../concepts/webspatial-app.md#webspatial-runtime)，可直接让网站中的 WebSpatial API 生效

正在推进 WebSpatial Runtime 实现的空间计算平台有：

- ⏳ [JSAR Runtime](https://jsar-project.github.io/runtime/)（比如 Rokid 眼镜设备）
- ⏳ [IRIS OS](https://www.irisview.cn/)

计划优先支持、但暂时需等待原生 API 稳定的空间计算平台有：

- ⏳ [Android XR](https://www.android.com/xr/)（比如 XREAL 眼镜设备）
- ⏳ [Meta Horizon OS](https://developers.meta.com/horizon/) （比如 Meta Quest 设备）

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
- 对于开启 SSR 的项目，需要[添加 SDK 需要的 Context](../how-to/ssr.md)。
:::

### 步骤 2：满足 PWA 的最低要求 {#step-2-minimal-pwa}

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

第一类分发方式是作为跨平台网站，通过 URL 传播和获取流量，在内置 WebSpatial Runtime 的空间计算平台上[通过 URL 按需访问](https://tpac2025.webspatial.dev/#instant-apps)，可以用完即抛，也可以[作为 PWA 安装到设备上](https://developer.picoxr.com/document/web/installable/)。

:::tip[PICO OS 6 上的 Web App]
在 [PICO OS 6](https://developer.picoxr.com/document/discover/pico-os-6-overview/) 设备上，Web App 即使不安装，也可以在浏览器之外[独立运行](https://developer.picoxr.com/document/web/install-free/)，并自动启用 WebSpatial 效果。
:::

第二类分发方式是上架应用商店，用户通过应用商店发现这个应用，先安装再使用。

上架 visionOS App Store 需要用 [WebSpatial Builder](../concepts/webspatial-app.md#webspatial-builder) 的 [`publish` 命令](../api/builder/publish.md)生成应用安装包和自动上传到 App Store Connect，需要一些[额外参数和注册步骤](../how-to/app-store-connect.md)。

[PICO 应用商店](https://developer.picoxr.com/document/distribute/)支持直接用提交 URL 的方式上架 Web App，不需要用 WebSpatial Builder 预先打包和上传。不过现阶段 PICO 开发者平台暂时没开放 Web App 的自助提交，需要通过 PICO 的商务合作渠道在 PICO 应用商店上架 Web App。
