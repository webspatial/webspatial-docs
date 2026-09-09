---
sidebar_position: 1
description: '在 JSX 中为元素添加标记，让 WebSpatial SDK 能把它们转成空间化 HTML 元素。'
---

# JSX 标记

[WebSpatial SDK](../../../introduction/getting-started.md#webspatial-sdk) 支持把大部分普通 HTML 元素转变成[空间化 HTML 元素](../../../concepts/spatialized-html-elements.md)，但出于性能、开源生态兼容性等方面的考虑，现阶段需要开发者在 JSX 代码中给这些 HTML 元素加上一个特殊标记。

对于一般的应用来说，`enable-xr` 是唯一需要的标记。元素被标记后，就用普通的 React 和 CSS 方式来更新它。`enable-xr-monitor` 是一个可选的兼容性标记，只针对[下文](#enable-xr-monitor)描述的一种特定布局场景。

## `enable-xr`

这个特殊标记表示把一个 HTML 元素转变成空间化 HTML 元素。

为了兼容第三方开源库，SDK 支持三种标记方式：

1. 将属性 `enable-xr` 作为 HTML 属性传给元素：

```html
<div className="card" enable-xr></div>
```

2. 将 `__enableXr__` 添加到元素的 `className` 中：

```html
<div className="card __enableXr__"></div>
```

3. 在元素的内联样式中添加 `enableXr: true`:

```js
<div className="card" style={{ enableXr: true, marginTop: "10px" }}></div>
```

:::info[这会为 `<Model>` 启用什么]
在 [`<Model>`](./Model.md) 上使用这个标记，会让这个元素从 web 标准里只能在平面画布中渲染 3D 模型的 model element 增强为可以在空间中渲染 3D 模型的[静态 3D 容器元素](../../../concepts/3d-content-containers.md)。
:::

### 更新空间化元素 {#updating-a-spatialized-element}

空间化 HTML 元素在 React 树和 DOM 里仍然是一个普通元素，用修改其他任何元素的方式修改它即可：

```jsx
function Card({ raised }) {
  return (
    <div enable-xr className={raised ? "card card-raised" : "card"}>
      Hello
    </div>
  );
}
```

```css
.card {
  position: relative;
  --xr-background-material: translucent;
}

.card-raised {
  --xr-back: 50px;
  transform: rotateY(-10deg);
}
```

以下方式都是支持的：

- 用 React state 驱动 `className` 或 `style`
- CSS class 和样式表规则
- CSS 自定义属性，比如 [`--xr-back`](../css-api/back.md)，无论写在样式表里还是 `style` 里
- 通过 React ref 直接写入，比如 `ref.current.style.transform = "..."` 或 `ref.current.classList.toggle("card-raised")`

SDK 会自动检测元素自身尺寸的变化，以及元素自身和其内部任何内容的 `class`、`style` 变化。这些更新不需要通知 SDK，也不需要添加任何额外标记。通用规则见[空间化 HTML 元素](../../../concepts/spatialized-html-elements.md)，transform 相关的说明（包括动画）见 [Spatial Transform](../css-api/transform.md#updating-the-transform)。

## `enable-xr-monitor`

`enable-xr-monitor` 是一个只针对一种场景的可选标记：当空间化 HTML 元素*外部*的内容改变了页面布局，导致这个元素在 X/Y 轴上的位置发生变化、但元素自身尺寸没有变化时，当前版本的 WebSpatial SDK 不会自动检测到新的位置。典型的触发情况是元素上方的兄弟元素被插入或移除，或者父元素的间距发生了变化。

把 `enable-xr-monitor` 添加到一个父元素上，可以让 SDK 监听这个父元素内部内容的变化。如果这些变化影响到了空间化 HTML 元素的[尺寸或在 X/Y 轴上的布局位置](../../../concepts/spatialized-html-elements.md)，SDK 会重新同步这个空间化 HTML 元素。

```js
function CardList() {
  const [showFirstCard, setShowFirstCard] = useState(true);

  const onClick = () => {
    setShowFirstCard(prevState => !prevState);
  };

  return (
    <div enable-xr-monitor>
      {showFirstCard && <div>first card</div>}
      <div enable-xr>second card</div>
      <button onClick={onClick}>toggle</button>
    </div>
  );
}
```

当 "first card" 被移除时，"second card" 会沿 Y 轴向上移动，这个标记能保证空间化元素跟着移动。

什么时候需要它：

- **新应用默认不需要。** 先只用 `enable-xr`。空间化元素自身的变化，包括尺寸、`className`、`style` 以及内部的任何内容，不需要这个标记就能被检测到。
- **只在观察到问题时添加。** 如果一个空间化 HTML 元素在外部发生布局变化后仍停留在旧位置，就把 `enable-xr-monitor` 添加到同时包含变化内容和空间化元素的最近父元素上。
- **范围尽量小。** 这个标记会监听其子树内的所有内容变化，所以应该加在受影响的容器上，而不是整个应用上。
- **是否需要取决于 SDK 版本，而不是你的代码。** 某种布局变化是否需要这个标记，是所用 WebSpatial SDK 版本的特性，不属于 WebSpatial 编程模型。这个标记会持续被支持，所以保留它总是安全的。

:::info[已有应用]
已有的 `enable-xr` 代码无需改动，可以继续使用。已有的 `enable-xr-monitor` 用法不需要移除，在当前 SDK 版本上仍然有效。新代码只应在上述场景下添加它；当你所用的 SDK 版本不再需要它来处理你的布局时，可以从自己的代码里移除。
:::
