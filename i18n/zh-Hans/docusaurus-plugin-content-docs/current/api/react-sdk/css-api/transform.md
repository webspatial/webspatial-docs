---
sidebar_position: 2
description: '对空间化 HTML 元素和 3D 容器应用真实的 3D 平移、旋转和缩放。'
---

# 空间变换（Spatial Transform） {#spatial-transform}

## 概述 {#summary}

WebSpatial 让 Web 标准中现有的 CSS Transform 能在[空间化 HTML 元素](../../../concepts/spatialized-html-elements.md) 上带来真实 3D 空间中的变换效果（位移、旋转、缩放），而不是投影到 2D 平面上的效果。

## 适用对象 {#applies-to}

通过 [WebSpatial SDK](../../../introduction/getting-started.md#webspatial-sdk) 在一个 HTML 元素上使用 Spatial Transform 的时候，需要元素被[标记为空间化 HTML 元素](../react-components/jsx-marker.md)。

[3D 容器元素](../../../concepts/3d-content-containers.md)（[`<Model>`](../react-components/Model.md) 和 [`<Reality>`](../react-components/Reality.md)）都是[空间化 HTML 元素](../../../concepts/spatialized-html-elements.md)，所以也能作为一个 2D 面片（相当于 3D 容器的背板）使用 Spatial Transform。

## 心智模型 {#mental-model}

Spatial Transform 维持 CSS Transform 原有的特性，不改变元素在 HTML/CSS 布局中的实际位置，只让元素的视觉效果发生位移、旋转、缩放等变换。

因此 Spatial Transform 也不会改变一个空间化 HTML 元素对应的[本地坐标系](../js-api/convertCoordinate.md)，本地坐标系只由元素的布局位置决定。

## 语法 {#syntax}

`transform: perspective()` 不再需要，会被忽略。

在 WebSpatial SDK 当前的实现中，空间化 HTML 元素已经有[特殊的标记](../react-components/jsx-marker.md)，且空间化 HTML 元素上的 CSS Transform 只能带来空间化变换效果，不支持 2D 投影模式，因此 `transform-style` 不再需要，会被忽略。

Spatial Transform 的其他语法跟 CSS Transform 一致，支持 `transform`、`transform-origin` 属性。

WebSpatial SDK 目前支持以下 transform function：

- `translateZ()`、`translate3d()`：在垂直于网页平面的 Z 轴方向上位移。
- `rotateX()`、`rotateY()`、`rotateZ()`、`rotate3d()`：绕 X/Y 轴旋转元素对应的 2D 面片，会把这个 2D 面片部分推入 3D 空间。
- `scaleZ()`、`scale3d()`：如果元素对应的 2D 面片因为旋转有部分进入了 3D 空间，沿 Z 轴的缩放会改变空间中这些部分的大小。

Spatial Transform 沿用和增强了 CSS Transform，没增加任何新 API，因此不需要 [`-xr-` 前缀](./back.md#syntax)。

示例：

```css
.list-menu {
  position: fixed;
  top: 200px;
  left: 0;
  transform-origin: top left;
  transform: translateZ(320px) rotateY(80deg);
}
```

## 值语法 {#value-grammar}

在 WebSpatial SDK 当前的实现中，Spatial Transform 中的 translate 值只支持用 px 作为单位，等价于 2D GUI 使用的 point 单位（参考[单位转换 API](../js-api/useMetrics.md)），最多允许精确到小数点后一位。

## 初始值 {#initial-value}

初始值相当于：

```css
transform: none;
```

或：

```
transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
```

## 是否继承 {#inherited}

子元素不会继承父元素的 `transform` 属性。

但是跟 CSS Transform 一样，如果父层级的空间化 HTML 元素用了 Spatial Transform，作为子元素的空间化 HTML 元素再使用 Spatial Transform，会相对于自己跟随父元素一起被变换后的视觉位置，继续叠加自己的变换。

## 更新 Transform {#updating-the-transform}

Spatial Transform 就是普通的 CSS，修改方式和修改任何元素的 transform 一样。在[空间化 HTML 元素](../react-components/jsx-marker.md#enable-xr)上，以下方式都是支持的：

用 React state 驱动内联 `style`：

```jsx
<div enable-xr style={{ transform: `translateZ(${offset}px)` }} />
```

通过 class 切换样式表里设置的 transform：

```jsx
<div enable-xr className={raised ? "card raised-card" : "card"} />
```

```css
.raised-card {
  transform: translateZ(100px);
}
```

通过 React ref 直接写入：

```js
ref.current.style.transform = "translateZ(100px)";
```

通过 ref 切换 class（比如 `ref.current.classList.toggle("raised-card")`）也是同样的效果。

一般的更新优先使用 React state 配合 `className` 或 `style`。当你已经持有 ref 时（比如在动画循环或手势处理函数里），通过 ref 写入是同样受支持的替代方式。两种方式都不需要额外的标记或通知。

:::note[样式表选择器]
请让 `transform` 规则直接匹配空间化 HTML 元素本身，比如通过它的 class、它自身的标签或内联 `style`。只能通过页面祖先元素才能匹配到该元素的规则（比如 `.sidebar .card { transform: ... }`）可能不会作为空间变换生效。
:::

## 是否可动画化 {#animatable}

在 WebSpatial SDK 当前的实现中，暂时不支持在 CSS 动画和 CSS transition 中使用 Spatial Transform 的属性。

:::caution[当前限制]
空间化 HTML 元素整体目前都不支持 CSS 动画。
:::

Spatial Transform 支持 JS 动画的实现方式，即用 JS 通过任意一种[受支持的更新方式](#updating-the-transform)反复修改 Spatial Transform 的值。每次写入都会立即生效，所以要让运动平滑，应每帧只更新一次，比如在 `requestAnimationFrame` 里更新，或使用会写入 `style` 的动画库。

JSX API 示例：

```js
export default function Demo({ animatedOffsetZ, animatedOffsetX }) {
  return (
    <div
      enable-xr
      style={{
        transform: `translateZ(${animatedOffsetZ}) translateX(${animatedOffsetX})`,
      }}></div>
  );
}
```

DOM API 示例：

```js
ref.current.style.transform = `translateZ(${animatedOffsetZ})`;
```

## 与其他 CSS API 的交互 {#interaction-with-other-css-apis}

如果一个空间化 HTML 元素[用 `back` 改变在 Z 轴上的布局位置](./back.md)，Spatial Transform 的 `translateZ` 会让这个元素的视觉位置相对于这个 Z 轴位置进一步沿 Z 轴位移。

## DOM 与 JS 映射 {#dom-and-js-reflection}

由于 Spatial Transform 不改变元素的布局位置，不改变一个空间化 HTML 元素对应的[本地坐标系](../js-api/convertCoordinate.md)，因此也不影响这个元素上触发空间交互事件 [`SpatialTapEvent`](../event-api/spatial-tap.md) 和 [`SpatialDragStartEvent`](../event-api/spatial-drag.md) 获取到的相对于本地坐标系的位置信息（`offsetX`、`offsetZ` 等），也不影响用 [`convertCoordinate`](../js-api/convertCoordinate.md) 在本地坐标系和全局坐标系之间转换的结果。

获得一个元素的 ref 后，可以直接读写 `style` 里 `transform` 属性的值：

```js
const currentOffsetZ =
  ref.current.style.transform.match(/translateZ\(([^)]+)\)/)?.[1] ?? "0px";
```

## 回退行为 {#fallback-behavior}

在不支持 WebSpatial 的环境里，Spatial Transform 样式会回退到普通 CSS Transform 的效果。
