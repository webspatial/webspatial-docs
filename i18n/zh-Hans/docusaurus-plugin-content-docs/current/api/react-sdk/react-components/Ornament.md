---
sidebar_position: 5
description: '把工具栏、侧边面板等窗口级别的 HTML UI 附着在当前空间场景窗口的边缘。'
---

# `<Ornament>`

:::caution[实验性 API]
`<Ornament>` 只从可选的实验性入口 `@webspatial/react-sdk/experimental` 导出。在它进入默认的 `@webspatial/react-sdk` 入口之前，名称和属性仍可能变化。它需要引入了该入口的 `@webspatial/react-sdk` `2.x` 版本。
:::

## 概述 {#summary}

Ornament 是一块由 [WebSpatial Runtime](../../../concepts/webspatial-app.md#webspatial-runtime) 附着在当前[空间场景](../../../concepts/spatial-scenes.md#ornaments)窗口外侧边缘的 2D HTML UI，比如悬浮在窗口下方的工具栏，或者窗口旁边的控制面板。它对应原生空间应用挂在窗口周围的 ornament。

Ornament 是窗口级别的 UI，而不是网页内容：

- 它不参与网页的 HTML/CSS 布局。它相对于场景窗口的边缘定位，而不是相对于网页中的任何元素，并且不受窗口边界的裁切。
- 它不是[空间化 HTML 元素](../../../concepts/spatialized-html-elements.md)，也不是 `<Reality>` 等 [3D 内容容器](../../../concepts/3d-content-containers.md)中的 3D 内容。
- 它的子内容渲染在由运行时管理的独立文档中。React 会把子内容 portal 到该文档里，因此 React 的状态、context 和事件处理都照常工作。
- 它会跟随场景窗口一起移动、缩放和隐藏。

```tsx
import { Ornament } from "@webspatial/react-sdk/experimental";

function PlayerToolbar() {
  return (
    <Ornament
      attachmentAnchor="bottom"
      contentAlignment="center"
      visibility="visible"
      width={360}
      height={64}
      cornerRadius={{
        topLeading: 32,
        topTrailing: 32,
        bottomLeading: 32,
        bottomTrailing: 32,
      }}
      style={{ "--xr-background-material": "translucent" }}
    >
      <nav className="toolbar">
        <button>Previous</button>
        <button>Play</button>
        <button>Next</button>
      </nav>
    </Ornament>
  );
}
```

`<Ornament>` 可以放在 [`<SpatialBoot>`](./SpatialBoot.md) 内部的任意位置。它在 React 树中的位置只决定生命周期：组件挂载时创建 Ornament，卸载时销毁 Ornament。一个页面可以同时渲染多个 Ornament，每个都独立锚定。

## 适用范围 {#availability}

| 平台 | Ornament | WebSpatial Runtime 最低版本 |
| --- | --- | --- |
| visionOS，以[打包版 WebSpatial App](../../../concepts/webspatial-app.md#packaged-webspatial-app) 运行 | 支持 | `WSAppShell/1.7.0` |
| PICO OS 6，在 [Web App Runtime](../../../concepts/webspatial-app.md#web-runtime) 中运行 | 支持 | `PicoWebApp/0.3.1` |
| 桌面和手机上的普通浏览器 | 不渲染 | 见[回退行为](#fallback) |

运行时版本即 [User Agent 字符串](../dom-api/userAgent.md)中报告的版本。更早的 WebSpatial Runtime 表现与不支持的平台相同。

## 属性 {#props}

```ts
import type { BackgroundMaterialType, CornerRadius } from "@webspatial/react-sdk";
import type { OrnamentPoint3D, OrnamentVisibility } from "@webspatial/react-sdk/experimental";

type OrnamentProps = {
  attachmentAnchor?: OrnamentPoint3D; // default: "bottom"
  contentAlignment?: OrnamentPoint3D; // default: "back"
  visibility?: OrnamentVisibility; // "visible" | "hidden", default: "visible"
  width?: number; // default: 200
  height?: number; // default: 150
  cornerRadius?: Partial<CornerRadius>; // default: 0 for every corner
  style?: React.CSSProperties & {
    "--xr-background-material"?: BackgroundMaterialType; // default: "none"
  };
  children: React.ReactNode;
};
```

所有属性都可以在 Ornament 挂载期间修改。修改会就地应用到现有的 Ornament 上，不会重新创建 Ornament，也不会重新挂载子内容。

### `attachmentAnchor`

Ornament 附着在场景窗口上的位置点。默认值是 `bottom`，即窗口底边的中点。

`OrnamentPoint3D` 通过组合垂直部分（`top`、`bottom`，或省略表示垂直居中）、水平部分（`leading`、`trailing`，或省略表示水平居中）和深度部分（`front`、`back`，或省略表示深度居中）来命名窗口 3D 包围盒上的一个点。在从左到右的布局中，`leading` 是左侧，`trailing` 是右侧。

```ts
type OrnamentPoint3D =
  | "topLeadingFront" | "topLeading" | "topLeadingBack"
  | "topFront" | "top" | "topBack"
  | "topTrailingFront" | "topTrailing" | "topTrailingBack"
  | "leadingFront" | "leading" | "leadingBack"
  | "front" | "center" | "back"
  | "trailingFront" | "trailing" | "trailingBack"
  | "bottomLeadingFront" | "bottomLeading" | "bottomLeadingBack"
  | "bottomFront" | "bottom" | "bottomBack"
  | "bottomTrailingFront" | "bottomTrailing" | "bottomTrailingBack";
```

:::caution[顶部正中的锚点已被保留]
`top`、`topFront` 和 `topBack` 不能作为 `attachmentAnchor` 的值。场景窗口的顶边被[内置的场景菜单](../../../concepts/spatial-scenes.md)占用。如果传入这三个值之一，SDK 会回退到默认值 `bottom`。要把 Ornament 放在靠近顶部的位置，请改用 `topLeading*` 或 `topTrailing*`。
:::

### `contentAlignment`

Ornament 自身内容盒上与 [`attachmentAnchor`](#attachmentanchor) 对齐的位置点。它接受同一组 `OrnamentPoint3D` 值，没有保留值。默认值是 `back`：Ornament 在水平和垂直方向上以锚点为中心，背面与窗口所在平面对齐。

组合这两个属性可以控制 Ornament 相对窗口边缘的最终位置。例如，在 `attachmentAnchor="bottom"` 时：

- `contentAlignment="top"` 让整个 Ornament 悬挂在窗口边缘下方。
- `contentAlignment="center"` 让 Ornament 跨在边缘上，一半在窗口内、一半在窗口外。
- `contentAlignment="bottom"` 让 Ornament 与窗口重叠，Ornament 的底边贴在窗口底边上。

### `visibility`

`visible`（默认）或 `hidden`。隐藏的 Ornament 仍然存在、子内容仍然处于挂载状态，但不会被绘制，也不接收输入。如果 Ornament 很快还会再显示，请切换 `visibility`；条件渲染 `<Ornament>` 则会销毁并重新创建它。

### `width` 和 `height` {#width-and-height}

Ornament 内容区域的尺寸，使用与网页布局相同的 `px` 单位。默认值为 `200` × `150`。值必须是正的有限数字，否则回退到默认值。Ornament 不会根据内容自动调整尺寸：子内容在一个视口恰好为该尺寸的文档中布局，文档的 body 会被拉伸以填满该尺寸。

### `cornerRadius`

让 Ornament 背板的角变圆，并把内容裁切成相同的形状。可以传入 `topLeading`、`topTrailing`、`bottomLeading`、`bottomTrailing` 的任意子集，单位为 `px`，每个值不小于 `0`。省略的角保留当前值（初始为 `0`）。它与你在 Ornament 内部元素上设置的 CSS `border-radius` 相互独立。

### `style`

应用在 Ornament 文档的根 `<html>` 元素上，而不是子内容外层的某个包裹元素上。值的序列化方式与 React 内联样式相同：需要长度的属性中数字会变成 `px`，camelCase 名称会转换为 CSS 名称。

实际使用中有两类用途：

- `--xr-background-material` 设置 Ornament 背板的材质，与 [`background-material`](../css-api/background-material.md) 作用于场景窗口和空间化 HTML 元素的方式相同。可接受的值有 `none`（默认）、`transparent`、`translucent`、`thin`、`regular` 和 `thick`。`none` 和 `transparent` 只显示 HTML 内容、没有背板；其余值会在内容后方渲染实时材质。
- 其他属性，例如 `color`、`fontFamily`，或 `--accent` 这样的自定义属性，会成为 Ornament 内容继承的文档级样式。由于它设置在 Ornament 文档的根元素上，这里的 `backgroundColor` 会覆盖整个 Ornament 区域，位于材质背板的前方。

## 内容规则 {#content-rules}

Ornament 的子内容是普通的 2D HTML：

- 网页样式在 Ornament 中可用。网页 `<head>` 中的 `<style>` 和 `<link rel="stylesheet">` 元素（包括 CSS-in-JS 库在运行时注入的 style 标签）会同步到 Ornament 文档中，因此全局 CSS、class 名和 CSS 变量的行为与网页中一致。
- `target` 不是 `_self` 的链接（例如 `<a href target="_blank">`）会打开一个[新场景](../../../concepts/spatial-scenes.md#new-scenes)，与网页中相同。
- Ornament 内容中不支持空间化原语，因为 Ornament 文档本身不是空间场景。带有 [`enable-xr` 标记](./jsx-marker.md#enable-xr)的元素会渲染为普通 HTML，[`<Model>`](./Model.md) 会回退到标准的 `<model>` 元素，[`<Reality>`](./Reality.md) 不渲染任何内容。开发构建会在每种情况下输出警告。
- 不支持嵌套。声明在另一个 Ornament 的子内容中，或者声明在 `<AttachmentAsset>` 内容中的 `<Ornament>` 会被忽略，并在开发构建中输出警告。

## 回退行为 {#fallback}

在不支持 Ornament 的环境中（包括普通浏览器），`<Ornament>` 渲染 `null`。它的子内容不会渲染到网页的任何位置，也不会创建 2D 覆盖层来代替。如果 Ornament 中的 UI 是必需的，请在 Ornament 不可用时渲染网页内的替代方案。`@webspatial/react-sdk` 导出的 `WebSpatialRuntime.supports("Ornament")` 会返回当前运行时是否支持它，[User Agent 检测](../dom-api/userAgent.md)则可以识别平台。

:::tip[使用 SSR？]
`<Ornament>` 只在客户端运行。请按照[如何在启用 SSR 的项目中启用 WebSpatial](../../../how-to/ssr.md) 的说明，把它放在客户端渲染代码里的 [`<SpatialBoot>`](./SpatialBoot.md) 内部。如果它在空间能力加载完成之前挂载，开发构建会在页面上显示一条诊断信息，而不是 Ornament。
:::
