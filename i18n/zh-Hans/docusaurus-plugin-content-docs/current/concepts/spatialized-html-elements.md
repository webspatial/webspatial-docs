---
sidebar_position: 4
description: '了解普通 HTML 元素如何进入网页前方的 3D 空间，并获得 Z 轴布局、变形和状态读取能力。'
---

# 空间化 HTML 元素 {#spatialized-html-elements}

空间化 HTML 元素是指不被局限在网页平面内、可以进入网页前方空间中的 HTML 元素。

Web 标准中现有的大部分 2D HTML 元素，都可以通过 [WebSpatial SDK](../introduction/getting-started.md#webspatial-sdk) 被[标记为空间化 HTML 元素](../api/react-sdk/react-components/jsx-marker.md#enable-xr)。

WebSpatial SDK 以 React 组件形式提供的 [3D 内容容器元素](./3d-content-containers.md)，也是空间化 HTML 元素，元素本身被视为 2D 面片，跟空间化的 2D HTML 元素具备相同的特性和行为，只是额外能在这个 2D 面片前方的空间中渲染 3D 内容。

所有空间化 HTML 元素都相当于悬浮在 [Spatial Scene](./spatial-scenes.md) 空间中的 2D 面片，即使脱离了网页平面，也继续参与整个网页的 HTML/CSS 布局系统，在网页平面中保留原本占据的位置。这些 2D 面片的宽高尺寸和它们在 X/Y 轴上的位置，完全由现有的 HTML/CSS 布局系统决定（相当于会跟它们在网页平面中占据的位置保持同步）。

:::note[Transform 不会改变布局边界]
[CSS Transform](../api/react-sdk/css-api/transform.md) 会改变空间化 HTML 元素看上去的位置和大小，不会改变它们在布局系统中的实际位置和大小。
:::

WebSpatial API 只为这些空间化 HTML 元素新增了 Z 轴相关的 CSS 能力和 DOM API，让这些 2D 面片可以在 Z 轴方向上[布局定位](../api/react-sdk/css-api/back.md)和[变形转换](../api/react-sdk/css-api/transform.md)，还可以[获取当前的相关状态](../api/react-sdk/dom-api/offsetBack.md)。

:::caution[当前限制]
对于受到 [CSS Transform](../api/react-sdk/css-api/transform.md) 影响、作为 2D 面片在空间中发生旋转等变化的空间化 HTML 元素，WebSpatial SDK 暂时还不支持用 [`getBoundingClientRect()`](https://developer.mozilla.org/docs/Web/API/Element/getBoundingClientRect) 获取它们的投影范围，也暂时不支持用 WebSpatial API 中新增的 `getBoundingClientCube()` 获取它们在空间中的 3D 包围盒范围。
:::

这些 Z 轴上的新 CSS/DOM API 能跟 Web 标准现有的 X/Y 轴上的 CSS/DOM API 组合使用。

Web 标准中现有的 `opacity`、`display: none`、`visibility: hidden` 等 API 也可以继续在空间化 HTML 元素上生效。

空间化的 2D HTML 元素，可以像 `window` 类型的 Spatial Scene 一样，给自己设置[实时渲染的半透明材质背板](../api/react-sdk/css-api/background-material.md)（可以跟 `border-radius` 组合），或保持默认的全透明、无背板状态（相当于 `background: none`）。

空间化 HTML 元素因为都是空间中独立的 2D 面片，因此这些元素自身不再受到 `z-index` 的影响，不会被普通 HTML 元素遮挡，只有可能被其他空间化 HTML 元素遮挡（取决于父子嵌套关系和 Z 轴位置）。

空间化的 2D HTML 元素内部，可以包含[标记为空间化 HTML 元素](../api/react-sdk/react-components/jsx-marker.md#enable-xr) 的其他 2D 元素或 3D 容器元素作为子元素，除非子元素设置为 `position: fixed`，否则子元素的 Z 轴位置会[相对于父层最近的空间化 HTML 元素的 Z 轴位置](../api/react-sdk/css-api/back.md)。
空间化 2D HTML 元素内部的其余部分仍然是普通的 2D HTML/CSS 内容，都位于父层最近的空间化 HTML 元素对应的 2D 面片上。

空间化 HTML 元素都支持新的[空间交互事件](./natural-interactions.md#spatial-interactions)，在事件结果中使用的[本地坐标系](./3d-content-containers.md#2d-containing-3d)，都是空间化 HTML 元素对应的 2D 面片的坐标系，以左上角为原点，单位也是 2D 布局系统中使用的 point 单位（`px`）。

空间化 HTML 元素的更新方式和普通 HTML 元素一样。用 React state 改变 `className` 或 `style`、切换 CSS class、修改 [`--xr-back`](../api/react-sdk/css-api/back.md) 之类的 CSS 自定义属性、通过 React ref 写入 `style` 或 `classList`，这些方式都是支持的。WebSpatial SDK 会自动检测元素自身尺寸的变化，以及元素自身和其后代元素上 `class`、`style` 的变化。

如果空间化 HTML 元素外部的布局变化导致它在 X/Y 轴上移动、但自身尺寸没有变化，当前版本的 SDK 可能需要在父元素上添加可选的 [`enable-xr-monitor`](../api/react-sdk/react-components/jsx-marker.md#enable-xr-monitor) 标记才能检测到新位置。这只是针对该场景的兼容机制，不属于常规的编写方式。

如果想要通过 DOM API 读取当前状态，需要用 React 的 `useRef` 获取空间化 HTML 元素对应的 DOM 对象。用 `querySelector` 之类的非 React 方式直接查询空间化 HTML 元素，不是受支持的方式。

WebSpatial SDK 暂时还不支持把空间化 HTML 元素的 CSS 属性添加到 CSS 动画里，只支持 JS 动画的实现方式。
