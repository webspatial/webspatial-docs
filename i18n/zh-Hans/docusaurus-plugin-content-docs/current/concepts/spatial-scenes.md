---
sidebar_position: 3
description: '理解空间场景容器的类型、初始化方式，以及 WebSpatial App 如何打开和管理多个场景。'
---

# 空间场景 {#spatial-scenes}

Spatial Scene 又叫 Spatial Container，是空间计算操作系统为[空间应用](./spatial-computing.md#spatial-app)提供的最基础的应用内容容器，用于实现[统一渲染](./spatial-computing.md#unified-rendering)和提供[软件和空间结合的基本能力](./spatial-computing.md)。空间应用的所有内容都需要通过这种容器来提供，就好像桌面操作系统里的应用内容都需要通过窗口来提供。

对于 [WebSpatial App](./webspatial-app.md) 来说，每个 Spatial Scene 都相当于一个在独立「窗口」中通过 URL 加载和运行的网页。
WebSpatial App 完全由这些「窗口」组成，所有内容都来自这些「窗口」中运行的 HTML/CSS/JS 代码。

这种「窗口」没有浏览器的标签栏、地址栏等 UI，把空间都留给网页自身，只额外提供[跟 PWA 窗口一样的极简菜单](https://web.dev/learn/pwa/app-design#standalone_experience)，悬浮在网页内容上方，默认折叠，提供「复制当前网址」、「在浏览器中打开」等对 Web App 来说必要的基础功能。其中默认还会包含「后退」等导航按钮，如果在 Web App Manifest 里[把 `display` 模式设成 `standalone`](https://developer.mozilla.org/docs/Web/Progressive_web_apps/Manifest/Reference/display)，会隐藏导航按钮，完全靠网页内的 UI 来导航。

## 场景类型 {#scene-type}

Spatial Scene 目前有三种类型：

默认是 `window` 类型，主体内容是一个悬浮在空间中的 2D 面片，这个 2D 面片可以被用户拖拽改变宽高尺寸（会受到[初始化属性的约束](../api/react-sdk/scene-options/resizability.md)），也可以被用户拖拽改变空间位置，但会受到 [Spatial Runtime](./spatial-computing.md#spatial-runtime) 中空间计算逻辑的约束，还会在移动过程中始终[相对于用户视野区域保持大小不变](../api/react-sdk/scene-options/worldScaling.md)，因为这种类型的 Spatial Scene 优先服务于 GUI 需求，需要让内容和文字始终清晰易读。

网页内容默认位于这个 2D 面片上，通过原有 Web API 获取到的视区大小和窗口大小（比如 `window.innerHeight`）等同于这个面片的大小（用 `window.outerHeight` 获取到的高度会额外包含 PWA 菜单的高度）。

这个 2D 面片的背板可以设置为[全透明、无边框](../api/react-sdk/css-api/background-material.md)，让网页中的内容好像分散悬浮在空中。也可以设置为原生质感的半透明材质（比如在 visionOS 里会是毛玻璃效果），随视角和环境实时动态渲染。

[空间化 HTML 元素](./spatialized-html-elements.md)可以从这个 2D 面片上被「抬升」到前方（朝向用户）的 3D 空间中做 Z 轴方向上的[布局](../api/react-sdk/css-api/back.md)和[变形转换](../api/react-sdk/css-api/transform.md)。
如果在网页中添加 [3D 内容容器元素](./3d-content-containers.md)，也会在这个 2D 面片前方的空间中渲染有体积的 3D 内容。
因此「window」类型的 Spatial Scene 不只是一个平面，不是只能包含 纯 2D 内容，也可以包含空间化 UI 和有体积的 3D 内容。

Spatial Scene 也可以设置为 `volume` 类型，这种类型不再优先服务于 GUI 需求，而是用于模拟现实世界中的真实物体。

因此，这种 Spatial Scene 除了宽和高，会额外多出深度属性（可以通过 [`defaultSize`](../api/react-sdk/scene-options/defaultSize.md) 设置，通过 [`innerDepth`](../api/react-sdk/dom-api/innerDepth.md) 读取）。被用户拖拽改变空间位置的时候，同样会受到 Spatial Runtime 中空间计算逻辑的约束，但不同于 `window` 类型，默认会有近大远小的效果（除非在初始化时修改 [`worldScaling` 属性](../api/react-sdk/scene-options/worldScaling.md)），另一个默认行为是会始终面朝用户（可以在初始化时修改 [`worldAlignment` 属性](../api/react-sdk/scene-options/worldAlignment.md)让它的行为跟真实物体更一致）。

网页内容仍然默认位于 `volume` 的背面上，网页大小等同于这个背面的大小，空间化的 2D HTML 元素和 3D 容器元素中有体积的内容都可以在这个背面前方的空间中显示，这些能力和效果都跟 `window` 类型一样。

这两类 Spatial Scene 都相当于 Spatial Runtime 负责运行的[整个 3D 空间（Shared Space 或 Full Space）](./spatial-computing.md#spatial-runtime)中一块有边界的局部空间，WebSpatial App 只能在这些局部空间的边界内显示网页内容，超出了会被裁剪。

第三种类型的 Spatial Scene 是 `stage`，没有边界，只能在 [Full Space](./spatial-computing.md#spatial-runtime) 模式下创建， WebSpatial SDK 暂时还不支持这种类型。

## Ornament {#ornaments}

空间场景还可以在自身边界之外携带 UI。Ornament 是一块由 [WebSpatial Runtime](./webspatial-app.md#webspatial-runtime) 附着在场景窗口某条边上的 2D HTML 内容，比如悬浮在窗口下方的工具栏，或者窗口旁边的控制面板。它会跟随窗口一起移动和缩放，并且不受窗口边界的裁切。

Ornament 是窗口级别的 UI，而不是网页内容。它不参与网页的 HTML/CSS 布局，不是[空间化 HTML 元素](./spatialized-html-elements.md)，也不是 [3D 内容容器](./3d-content-containers.md)中的 3D 内容。它的内容是渲染在由运行时管理的独立文档中的普通 2D HTML，因此空间化 HTML 元素和 3D 容器元素不能在 Ornament 中使用。

窗口顶部正中的边缘被上文提到的内置 PWA 菜单占用，所以应用自定义的 Ornament 不能锚定在那里。

WebSpatial SDK 以实验性的 [`<Ornament>`](../api/react-sdk/react-components/Ornament.md) React 组件提供 Ornament 能力。Ornament 只存在于 WebSpatial Runtime 中；在其他环境下该组件不渲染任何内容。

## 场景初始化 {#scene-initialization}

桌面操作系统中的浏览器窗口，可以在网页代码中通过 Web API 设置大小甚至位置，并且可以持续控制和修改这些属性。

Spatial Scene 跟空间环境的结合和相关的空间计算由操作系统统一负责，因此这些容器一旦被创建，其自身的属性（比如大小和位置）就不允许被空间应用的代码修改。但空间应用的代码可以在这些容器完成创建前的初始化环节里，提供自定义的初始化属性（比如上文提过的 [`defaultSize`](../api/react-sdk/scene-options/defaultSize.md)、[`resizability`](../api/react-sdk/scene-options/resizability.md)、[`worldScaling`](../api/react-sdk/scene-options/worldScaling.md) 等），影响 Spatial Scene 创建后的初始状态和后续的空间计算行为。

在 WebSpatial App 中，Spatial Scene 的类型也是在自定义初始化属性中设置的（通过 [`type` 属性](../api/react-sdk/scene-options/type.md)）。

## 起始场景 {#start-scene}

WebSpatial App 最初启动时会自动创建第一个 Spatial Scene，称作 Start Scene，其中加载的网页 URL 默认由 [Web App Manifest](./webspatial-app.md#web-app) 里的 [`start_url` 字段](../how-to/minimal-pwa.md)决定。

在 Start Scene 创建完成之前，没有网页代码能够运行，因此如果要为 Start Scene 提供自定义初始化属性，只能[通过 Web App Manifest 来配置](../api/react-sdk/manifest-options/main-scene.md)。

## 新场景 {#new-scenes}

WebSpatial App 可以通过 Web 标准中原有的「在新窗口打开链接」能力，创建更多 Spatial Scene，让更多内容共存，充分利用空间环境。比如：

- `<a href={newSceneUrl} target="_blank">`
- `<a href={newSceneUrl} target="newSceneName">`
- `window.open(newSceneUrl);`
- `window.open(newSceneUrl, "newSceneName");`

这些链接的 URL 必须属于当前 Web App（匹配 [Web App Manifest 中的 `scope`](https://developer.mozilla.org/docs/Web/Progressive_web_apps/Manifest/Reference/scope)），否则会作为第三方网址在浏览器窗口中打开。

在这些链接被打开、新的 Spatial Scene 被创建之前，可以通过 WebSpatial SDK 提供的 [`initScene` API 为新 Spatial Scene 提供自定义初始化属性（前提是新场景有 `name`）](../api/react-sdk/js-api/initScene.md)。
