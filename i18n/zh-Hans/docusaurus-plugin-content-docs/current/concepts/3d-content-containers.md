---
sidebar_position: 5
description: '理解“2D 包含 3D”范式，以及静态和动态 3D 容器如何在局部空间中渲染体积内容。'
---

# 3D 内容容器 {#3d-content-containers}

现有 HTML 元素都只能在 2D 平面中显示内容，即使是基于 WebGL 的 `<canvas>` 元素和新的 `<model>` 元素，都只能在平面画布中渲染 3D 内容，从[空间计算](./spatial-computing.md)的角度来说，它们仍然都是 2D 内容的一部分。

WebXR API 虽然能用 WebGL 在 3D 空间中渲染有体积的 3D 内容，但这些内容[只能在 WebXR session 中显示](./webspatial-app.md)，无法作为 3D HTML 元素参与 HTML/CSS 体系、在 Web App 里直接显示。

[WebSpatial SDK](../introduction/getting-started.md#webspatial-sdk) 提供 `<Model>` 和 `<Reality>` 两种 React 组件作为体积 3D 容器。空间渲染需要受支持的 WebSpatial Runtime，它们不是普通浏览器内置的 HTML 元素。请检查 [Runtime 要求](../introduction/getting-started.md#supported-platforms)和 [Model 回退要求](../api/react-sdk/react-components/Model.md#fallback)。这些元素都是[空间化 HTML 元素](./spatialized-html-elements.md)，作为空间中悬浮的 2D 面片使用，继续参与 HTML/CSS 布局系统，跟空间化的 2D HTML 元素具备相同能力和用法，但除此之外，还能在 2D 面片前方的局部空间中，用 [3D 开发范式](#3d-engine-api)实现有真正体积的 3D 内容，支持[统一渲染](./spatial-computing.md#unified-rendering)，让 3D 内容[能跟 2D 内容融合共存](#2d-containing-3d)。

3D 容器元素除了能基于现有 Web 标准决定 2D 面片的宽和高，还能用 WebSpatial API 新增的 CSS 属性[设置 2D 面片前方局部 3D 空间的深度](../api/react-sdk/css-api/depth.md)，可以用新增的 DOM API [查询当前的深度](../api/react-sdk/dom-api/clientDepth.md)。

[WebSpatial SDK](../introduction/getting-started.md#webspatial-sdk) 以 React 组件的形式提供这两种 3D 容器元素。

## 静态 3D 容器 {#static-3d-containers}

第一种 3D 容器元素是 [`<Model>`](../api/react-sdk/react-components/Model.md)，它在 2D 面片前方的局部空间中用预制好的 3D 模型文件渲染静态 3D 内容，「静态」是指这种 3D 内容虽然能用 API 控制模型文件内置动画的播放，也能通过 API 改变模型文件在这个局部空间中的渲染方式，但无法在应用运行过程中用代码动态渲染任意的 3D 内容。

## 动态 3D 容器 {#dynamic-3d-containers}

第二种 3D 容器元素是 [`<Reality>`](../api/react-sdk/react-components/Reality.md)，它在 2D 面片前方的局部空间中可以用[支持统一渲染的 3D Engine API](#3d-engine-api) 动态渲染任意 3D 内容。

## 3D 引擎 API {#3d-engine-api}

为了让[空间计算](./spatial-computing.md)操作系统和 [Spatial Runtime](./spatial-computing.md#spatial-runtime) 能理解动态 3D 容器中的 3D 内容，能把它们跟空间中其他 2D/3D 内容一起做[统一渲染](./spatial-computing.md#unified-rendering)，不能在动态 3D 容器的内容中直接使用 WebGL/WebGPU 和基于这些底层 3D 图形 API 的任意 Web 3D 引擎。

WebSpatial SDK 通过采用 JSX 语法的 React 组件提供声明式 3D 引擎 API。ECS 风格的实体和统一渲染由受支持的 Runtime 实现；JSX 语法不代表浏览器原生支持这些元素。

这套 API 以 WebSpatial SDK React 组件的形式提供[各种开箱即用的 3D Entity](../api/react-sdk/react-components/Reality.md#3d-entity)，这些 Entity 的底层实现中基于 ECS 架构内置了不同的 Component 能力（ECS 的概念，不是指 UI Component），这些 Component 能力可以通过 React props 配置，比如可以引用[提前声明好的 3D 资产](../api/react-sdk/react-components/Reality.md#3d-assets)、设置[几何物体](../api/react-sdk/react-components/Reality.md#primitive-entities)的尺寸等。

这些 React 组件只能在动态 3D 容器中[作为 Scene Graph 根节点的 `<World>`](../api/react-sdk/react-components/Reality.md#scene-graph) 中使用，不支持 CSS 和 2D 布局系统，而是采用 3D 引擎体系中的 [Transform 属性](../api/react-sdk/react-components/Reality.md#3d-entity)在 3D 坐标系中渲染。

这些 3D Entity 不仅可以通过动态 3D 容器融入到 2D 布局体系和 HTML/CSS 内容中，还可以在 Entity 上[附着 HTML/CSS 内容](../api/react-sdk/react-components/Reality.md#attachment-entity)，让 2D 内容也能进入 3D 渲染体系。

这些[在 `<Reality>` 内部使用的 SDK 组件](../api/react-sdk/react-components/Reality.md)在 [WebSpatial SDK](../introduction/getting-started.md#webspatial-sdk) 中同样以 React 组件的形式提供。

## 2D 包含 3D {#2d-containing-3d}

3D 容器元素就像桥梁，能把容器外基于 CSS 的 2D 布局系统，和容器内基于 3D 引擎的 3D 渲染体系，融合到一起，实现「2D 包含 3D」的新范式：
整个 WebSpatial App 可以默认作为 2D Web App 来开发，使用主流的 2D Web 框架（比如 React）和基于 HTML/CSS 的主流 Web API。只在应用中真正需要 3D 内容的局部区域，按需使用 3D 引擎体系的开发范式。且 3D 引擎的渲染能融入 2D 渲染体系中（WebSpatial SDK 提供的 HTML 风格 3D 引擎 API，能基于 React 的渲染机制做 3D 内容的初始化和更新）。

WebSpatial App 中的 [Spatial Scene](./spatial-scenes.md)、[空间化 HTML 元素](./spatialized-html-elements.md)（包括元素上触发的[空间事件](./natural-interactions.md#spatial-interactions)的结果）、基于 HTML/CSS 的 2D 内容，都属于 2D 开发范式，采用左手坐标系，原点都位于 2D 面片的左上角，Y 轴向下，Z 轴朝向用户，长度单位默认用面向 GUI 的 point 单位（`px`）。

3D 容器元素中的 3D 内容，则采用 3D 开发范式，采用右手坐标系，原点在容器对应的局部 3D 空间的中心点，Y 轴朝上，Z 轴朝向用户，长度单位默认用面向现实世界物体的物理单位（`m`）。

由于这些内容都由 [Spatial Runtime](./spatial-computing.md#spatial-runtime) 做[统一渲染](./spatial-computing.md#unified-rendering)，因此可以在这些坐标系和长度之间任意转换，让 2D 范式的内容能跟 3D 范式的内容互相结合，比如在空间中对齐位置、自动跟随、彼此联动等。

WebSpatial SDK 通过 npm 包导出的[单位转换](../api/react-sdk/js-api/useMetrics.md)和[坐标系转换](../api/react-sdk/js-api/convertCoordinate.md) API 提供这种能力。
