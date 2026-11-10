---
sidebar_position: 2
description: '了解标准 Web App 如何在运行时和打包能力配合下变成 WebSpatial App。'
---

# WebSpatial App {#webspatial-app}

使用了 [WebSpatial API](../introduction/getting-started.md#webspatial-api) 的 [Web App](#web-app)，如果在[空间计算平台](./spatial-computing.md)中作为独立应用运行，在 [WebSpatial Runtime](#webspatial-runtime) 的支持下启用空间计算能力，就会成为空间应用，可以称作 WebSpatial App。

WebSpatial App 就是对标准 Web App 的增强，这种增强需要在合适的条件下激活。

没有受支持的 WebSpatial Runtime 时，Web App 会作为普通网页或 PWA 渲染，不提供空间效果。`<SpatialBoot>` 会跳过空间实现的加载。开发者需要提供并测试合适的 2D 内容和交互；回退不保证行为或性能保持不变。

这种 Web App 要作为 WebSpatial App 运行、启用空间计算能力，除了需要操作系统支持空间计算和统一渲染，还需要有包含 WebSpatial Runtime 的运行环境。
当前各种 Web 浏览器的 UI 都是针对屏幕设备和高效浏览多个 2D 网页而设计的，跟空间应用的 UI（比如透明背景，UI 元素浮起或凸起、分散在空间中）存在冲突，因此这些 Web 浏览器（比如 visionOS 上的 Safari、PICO OS 6 里的默认浏览器）里暂时无法包含 WebSpatial Runtime，会把这种 Web App 作为普通网页来运行。

这种 Web App 如果在 PICO OS 6 里通过 [Web App Runtime](https://developer.picoxr.com/document/web/web-platform/) 在浏览器之外独立运行，或用 [WebSpatial Builder](#webspatial-builder) 打包生成 [Packaged Hybrid App](#packaged-webspatial-app) 在 visionOS 里运行，都会获得有 WebSpatial Runtime 的运行环境，从而成为 WebSpatial App，启用空间计算能力。

WebXR 内容可以「包含」在 WebSpatial App 里，因为 WebSpatial App 就是由标准网页组成的 Web App，网页中可以通过 JS API 启动 WebXR session，接管整个空间，用 WebGL 或 WebGPU 这样的底层 3D 图形 API 渲染 WebXR 内容。但这种空间不是 [Full Space](./spatial-computing.md#spatial-runtime)，不是[统一渲染](./spatial-computing.md#unified-rendering)的，而是 WebXR 代码自己独立负责渲染。WebXR session 一旦启动，WebSpatial App 原有的网页和空间化 UI 都会隐藏，不会同时显示。

:::caution[visionOS 上的当前限制]
由于 visionOS 里的 WKWebView 暂时不支持 WebXR，所以 visionOS 里的 Packaged WebSpatial App 暂时无法启动 WebXR session。
:::

## Web App {#web-app}

广义来说，所有提供完整 App 功能的网站，都是 Web App。

但传统网站只是多个网页或 URL 的互相链接，这些网页或 URL 在浏览器中作为独立标签页运行，彼此缺乏联系，从网页中无法标准化的获取到整个 Web App 的信息（比如应用名称、应用图标、应用包含哪些 URL）。

Web 标准中新增的 [Web App Manifest](../how-to/minimal-pwa.md)（属于 PWA 标准的一部分）让网页可以提供自身所属 Web App 的信息，让这个 Web App 可以在浏览器之外独立运行、可以像原生应用一样被安装和具备更多原生体验和能力。

所以 WebSpatial 文档中出现的「Web App」专指 PWA（网站中[只需要包含 Web App Manifest 就能成为 PWA](../how-to/minimal-pwa.md)，不要求使用 PWA 的其他技术）。

## Web Runtime {#web-runtime}

Web Runtime 就是指能按照 Web 标准运行 Web App、网页和 HTML/CSS/JS 等 Web 代码的 Runtime，这种 Runtime 由浏览器引擎和其他原生实现组成。

visionOS 里的 Safari 和 WKWebView 都是 Web Runtime，用 [WebSpatial Builder](#webspatial-builder) 打包生成的内置 [WebSpatial Runtime](#webspatial-runtime) 的 [Packaged WebSpatial App](#packaged-webspatial-app) 会用 WKWebView 渲染网页和所有 HTML/CSS/JS 代码，因此这些 Hybrid App 也都是 Web Runtime。

PICO OS 6 里内置 [WebSpatial Runtime](#webspatial-runtime) 的 [Web App Runtime](https://developer.picoxr.com/document/web/web-app/) 也是一种 Web Runtime，跟 PICO 浏览器使用[相同的 Chromium 内核](https://developer.picoxr.com/document/web/web-platform/)。

也就是说，WebSpatial Runtime 始终内置在 Web Runtime 内，是这些 Web Runtime 的一部分，因此 [WebSpatial App](./webspatial-app.md) 具备[标准 Web App](#web-app) 的原有能力，继承标准 Web App 的代码和开发方式。

## WebSpatial Runtime {#webspatial-runtime}

WebSpatial Runtime 在 [Web Runtime](#web-runtime) 的基础上，额外实现了 [WebSpatial API](../introduction/getting-started.md#webspatial-api)，能把操作系统中的[空间计算](./spatial-computing.md#unified-rendering)能力提供给[标准 Web App](#web-app)，让它们在这种系统中运行时获得增强。

当前 WebSpatial Runtime 结合浏览器引擎和 hybrid 技术，必须与 [WebSpatial SDK](../introduction/getting-started.md#webspatial-sdk) 搭配使用。拟议 API 由 SDK 与 Runtime 共同实现；浏览器原生支持是另一项独立能力。

有些空间计算操作系统内置了 WebSpatial Runtime（比如 [PICO OS 6](https://developer.picoxr.com/document/web/web-app/)），使用了 WebSpatial SDK 的标准 Web App 可以直接通过 URL 在这些平台上独立运行、启用空间计算能力。

有些空间计算操作系统不包含 WebSpatial Runtime（比如 visionOS），要在这些平台上启用空间计算能力，使用了 WebSpatial SDK 的标准 Web App 需要用 [WebSpatial Builder](#webspatial-builder) 打包成自带 WebSpatial Runtime 的 [Packaged WebSpatial App](#packaged-webspatial-app)。
为这些特定平台实现的可以打包在 hybrid app 里的 WebSpatial Runtime，通过独立的 npm 包提供，比如 WebSpatial SDK [为 visionOS 提供的 `@webspatial/platform-visionos` 包](../introduction/getting-started.md#step-2-optional-builder)。

## Packaged WebSpatial App {#packaged-webspatial-app}

Packaged WebSpatial App 是自带 [WebSpatial Runtime](#webspatial-runtime) 和 [Web Runtime](#web-runtime) 的原生[空间应用](./spatial-computing.md#spatial-app)，这种应用相当于一个运行 [Web App](#web-app) 的原生 App Shell，运行效果相当于安装后独立运行的 PWA，会根据 [Web App Manifest](../how-to/minimal-pwa.md)，在自己的独立窗口中加载起始网页，也支持在自身的新窗口中打开更多属于这个 Web App 的网页。如果这个 Web App 通过 [WebSpatial SDK](../introduction/getting-started.md#webspatial-sdk) 使用了 [WebSpatial API](../introduction/getting-started.md#webspatial-api)，就会在这种情况下自动启用空间计算能力。

这种应用可以在对应空间计算平台（比如 visionOS）的官方模拟器和测试设备上[预览效果](../introduction/getting-started.md#preview)和[调试](../introduction/getting-started.md#debug)，也可以[上架到应用商店](../introduction/getting-started.md#distribution)。对应的空间计算平台上不要求有 WebSpatial Runtime，但需要在打包生成应用的环境里提前准备好 WebSpatial Runtime（比如对于 visionOS，需要在项目中安装 [`@webspatial/platform-visionos`](../introduction/getting-started.md#step-2-optional-builder)）。

要获得 Packaged WebSpatial App，首先需要有一个[集成了 WebSpatial SDK 的网站项目](../introduction/getting-started.md#supported-web-projects)，用 [Web Build Tool](#web-build-tool) 编译生成可部署到服务器的网站产物文件。
这时就已经可以直接用 [WebSpatial Builder](#webspatial-builder) 做打包，builder 会自动[把网站产物复制到应用包里](../introduction/getting-started.md#packaged-app-mode)，应用运行过程中会从本地的包文件中加载 HTML/CSS/JS 等 Web 文件，不从线上获取。
如果进一步把这些 Web Build Tool 的产物[作为网站运行起来](../introduction/getting-started.md#preview)，获得可以从模拟器或空间计算设备上能访问的网址，[把网址提供给 WebSpatial Builder](../api/builder/run.md#--base)，就可以得到不含网站产物的应用包，应用运行过程中会从线上加载 HTML/CSS/JS 等 Web 文件。

## Web Build Tools {#web-build-tool}

Web Build Tool 是指 Vite、Rspack / Webpack 这类开发工具，能把基于 Web 框架的源代码编译构建成 Web Server 实际提供的 HTML 网页和 CSS、JS 等静态 web 文件。

像 Next.js 这样的 Web 框架本身自带 Web Build Tool。

现阶段，[WebSpatial SDK](../introduction/getting-started.md#webspatial-sdk) 需要[借助 Web 框架（React）和 Web Build Tool](../introduction/getting-started.md#supported-web-projects) 才能支持开发者在源代码中使用 [WebSpatial API](../introduction/getting-started.md#webspatial-api)。

## WebSpatial Builder {#webspatial-builder}

WebSpatial SDK 提供了一个叫 WebSpatial Builder 的开发工具（包名是 [`@webspatial/builder`](../introduction/getting-started.md#installation)），简化 [Packaged WebSpatial App](#packaged-webspatial-app) 的生成、[预览](../introduction/getting-started.md#preview)和[分发](../introduction/getting-started.md#distribution)。

这个工具提供三个命令：

- [`run`](../api/builder/run.md): 用于在模拟器中预览效果
- [`build`](../api/builder/build.md)：用于在测试设备上预览效果
- [`publish`](../api/builder/publish.md): 用于提交到应用商店
