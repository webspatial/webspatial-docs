---
sidebar_position: 6
description: '了解注视、捏合、触摸等自然交互方式，以及 WebSpatial 提供的空间事件模型。'
---

# 自然交互 {#natural-interactions}

:::info[平台范围]
下文的注视、捏合、2D 事件映射和 Hover Effect 示例描述文档所述的 visionOS hybrid 实现。输入设备、事件顺序、触摸与鼠标事件模拟、hover 行为可能随 OS 和 Web Runtime 版本变化。请在目标设备上验证，不应把这些示例视为 PICO OS 或普通浏览器的行为约定。SDK 空间手势在下文单独列出。
:::

自然交互是指让用户跟空间中的软件界面和虚拟内容交互时，就像跟现实世界的真实物体互动，不使用任何控制设备（比如 XR 手柄），只靠手和眼就做直观高效的交互。

这种自然交互有两种模式：

1. 直接交互：采用最符合直觉的方式，用单手或双手直接接触虚拟内容元素。
2. 间接交互：更高效，不用抬手接触，先用眼睛注视的方式在虚拟内容元素中做「选择」，然后捏合手指触发「确认」操作，捏住不放还可以进一步做拖拽、旋转、缩放等手势操作。

## 2D 内容交互 {#2d-content-interactions}

在文档所述的 visionOS 实现中，直接触控与注视加捏合可以映射到现有网页输入 API，包括 Pointer Events、Touch Events、兼容性 Mouse Events 和 `click`。具体顺序和模拟事件取决于 Web Runtime。请在目标版本上测试事件处理，不要假定它们完全等价于触屏浏览器。

以下间接交互顺序是该实现的示例，不保证各 Runtime 都采用相同顺序：

1. 在手指捏合之前，眼睛注视位置的移动，不触发任何 JS 事件，也不触发 CSS 的 hover 状态，相当于在触屏交互中，手指还没接触到屏幕前的状态，网页代码完全不知道用户在做什么
2. 在手指捏合然后立刻松开的过程中，会按顺序触发以下 JS 事件：
   1. 捏合瞬间，同时触发「接触」事件（`pointerover`）、「进入」事件（`pointerenter`）、「按下」事件（`pointerdown`）事件。只有在手指捏合的瞬间，网页才能通过这些事件获取交互对象和交互位置信息（知道眼睛在注视哪里）
   2. 接下来会触发「触摸开始」事件（`touchstart`）
   3. 手指松开的瞬间，会同时触发「脱离」事件（`pointerout`）、「离开」事件（`pointerleave`）、「松开」事件（`pointerup`）
   4. 接下来会触发「触摸结束」事件（`touchend`）
   5. 为了保持对旧网页代码的兼容，接下来会模拟触发一系列鼠标事件，包括「接触」事件（`mouseover`）、「进入」事件（`mouseenter`）、「移动」事件（`mousemove`）、「按下」事件（`mousedown`）、「松开」事件（`mouseup`）。还会触发 CSS 的 hover 状态，这种状态由于是模拟出来的，要在跟其他元素交互后才会被解除
   6. 最后触发「点击」事件（`click`）
3. 如果手指捏合后未松开，这对手指的移动行为会在 `touchstart` 事件后持续触发以下事件，直到手指松开
   1. 「移动」事件（`pointermove`，手指移动对应初始交互位置的移动）
   2. 「触摸移动」事件（`touchmove`）

## Hover Effect {#hover-effect}

在这里描述的 visionOS 间接交互中，在手指捏合之前，由于网页不知道眼睛在注视哪里，不会触发任何 JS 事件，也不会改变 CSS 状态，因此无法用网页代码实现 Hover Effect，需要由 [Spatial Runtime](./spatial-computing.md#spatial-runtime) 统一负责在被注视的 HTML 元素上自动渲染 Hover Effect。

为此，[Spatial Runtime](./spatial-computing.md#spatial-runtime) 需要知道网页当前可见区域中有哪些「Interactive Region」。

凡是在桌面浏览器里会让鼠标指针变成 pointer 形状的 HTML 元素，都会被自动识别为 Interactive Region，包括：

1. 链接元素（`<a>`）
2. 表单交互元素（`<button>`、`<input>`、`<select>` 等）
3. 用 Web 标准里的可访问性 API（ARIA）设置成跟上述元素语义等价的元素（比如 `<div role="button">`）
4. 通过 CSS 样式 `cursor: pointer` 主动把鼠标指针设置为 pointer 形状的 HTML 元素

## 空间交互 {#spatial-interactions}

不同于平面内的 2D 内容，[空间化 HTML 元素](./spatialized-html-elements.md)都被视作悬浮在空间中的 2D 面片，可以在 3D 空间的 X/Y/Z 三个方向上[定位和移动](../api/react-sdk/css-api/back.md)，可以在空间中[旋转](../api/react-sdk/css-api/transform.md)，交互命中的范围也从平面上的点变成了空间中 2D 面片和 [3D 网格](./3d-content-containers.md)上的点。

Web 标准中现有的 JS 交互事件只能命中这些空间对象或 3D 内容投影到 2D 平面上的点，只能获取 X/Y 轴位置，无法实现 3D 空间范围中的交互。

当 Runtime 提供对应能力时，WebSpatial SDK 会暴露单击、拖拽、旋转、缩放事件。这些 SDK 手势与平台把注视、手部、控制器等输入映射到网页事件的方式不同。请检查[版本化 Runtime 支持](../introduction/getting-started.md#supported-platforms)，并在每个平台测试目标输入方式：

| Type                                                             | Event Name                                              | React API                                                     | Event Results                                                          |
| ---------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------- |
| [Spatial Tap](../api/react-sdk/event-api/spatial-tap.md)         | `spatialtap`                                            | `onSpatialTap`                                                | `SpatialTapEvent`                                                      |
| [Spatial Drag](../api/react-sdk/event-api/spatial-drag.md)       | `spatialdragstart`<br />`spatialdrag`<br />`spatialdragend` | `onSpatialDragStart`<br />`onSpatialDrag`<br />`onSpatialDragEnd` | `SpatialDragStartEvent`<br />`SpatialDragEvent`<br />`SpatialDragEndEvent` |
| [Spatial Rotate](../api/react-sdk/event-api/spatial-rotate.md)   | `spatialrotate`<br />`spatialrotateend`                   | `onSpatialRotate`<br />`onSpatialRotateEnd`                     | `SpatialRotateEvent`<br />`SpatialRotateEndEvent`                        |
| [Spatial Magnify](../api/react-sdk/event-api/spatial-magnify.md) | `spatialmagnify`<br />`spatialmagnifyend`                 | `onSpatialMagnify`<br />`onSpatialMagnifyEnd`                   | `SpatialMagnifyEvent`<br />`SpatialMagnifyEndEvent`                      |
