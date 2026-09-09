---
sidebar_position: 2
description: '在 WebSpatial 布局中完成 2D 像素单位和真实世界米单位之间的换算。'
---

# `useMetrics`

## 概述 {#summary}

在 2D GUI 使用的 point 单位（`px`）和 3D 空间使用的物理世界单位（`m`）之间做[单位转换](../../../concepts/3d-content-containers.md#2d-containing-3d)。

在 visionOS 里，默认 1360px ≈ 1 米，但这个换算关系不一定能保持固定：

如果[空间场景容器](../../../concepts/spatial-scenes.md)的类型是 `window`，或在类型是 `volume` 的情况下把初始化属性里的[`worldScaling` 设置成了 `dynamic`](../scene-options/worldScaling.md)，这两种单位的转换就不是固定关系（见 [`worldScalingCompensation`](#return-shape)）。

不同空间计算平台上的换算关系也不一致，所以应该统一通过这个 API 来转换单位。

:::caution[单位转换只能在 WebSpatial Runtime 中进行]
调用 `useMetrics()` 本身始终是安全的——在普通浏览器中、SSR 期间，以及 SDK 尚未加载完成时，它会返回占位函数。真正会抛出 `WebSpatialRuntimeError` 的是返回的 `pointToPhysical` / `physicalToPoint`：在上述任一情况下调用它们都会抛错。参见[运行时要求](#runtime-requirements)。
:::

## 运行时要求 {#runtime-requirements}

`useMetrics` 遵循[就绪与功能支持](../react-components/SpatialBoot.md#readiness-vs-feature-support)模型。调用转换函数之前，下面两个条件必须同时满足：

1. **SDK 已就绪。** 把调用 `useMetrics()` 的组件挂载在 [`<SpatialBoot>`](../react-components/SpatialBoot.md) 内部。在 `<SpatialBoot>` 内部，这样做就足够了。只有当你绕过 `<SpatialBoot>`、在启动完成之前就渲染该组件时，下面这一点才需要注意：这个 Hook 只在组件挂载时选择一次实现，所以这样的组件会一直使用占位函数，直到它被重新挂载。
2. **运行时支持单位转换。** `<SpatialBoot>` 在普通浏览器中同样会挂载子节点，而那里并没有任何东西可以转换，所以仅仅位于 `<SpatialBoot>` 内部是不够的。请检查 `WebSpatialRuntime.supports("useMetrics")`，并在它返回 `false` 时渲染回退 UI。

只要其中任一条件不满足，`useMetrics()` 仍然会返回一个对象，但 `pointToPhysical` 和 `physicalToPoint` 一被调用就会抛出 `WebSpatialRuntimeError`（其 `capability` 为 `"useMetrics"`）。这两个函数引用在多次渲染之间保持稳定，所以可以安全地放进依赖数组。

推荐的守卫写法（组件渲染在 `<SpatialBoot>` 内部）：

```jsx
import { useMetrics, WebSpatialRuntime } from "@webspatial/react-sdk";

function PhysicalWidth({ px }) {
  if (!WebSpatialRuntime.supports("useMetrics")) {
    // Ordinary browsers, or a WebSpatial Runtime without unit conversion.
    return <span>{px}px</span>;
  }
  return <PhysicalWidthSpatial px={px} />;
}

function PhysicalWidthSpatial({ px }) {
  const { pointToPhysical } = useMetrics();
  return <span>{pointToPhysical(px).toFixed(2)} m</span>;
}
```

请像上面这样，把 `useMetrics()` 的调用放在只有功能受支持时才渲染的组件里。这样 Hook 的调用顺序保持稳定，占位函数也永远不会被调用。

## 调用形式 {#signature}

```js
import { useMetrics } from "@webspatial/react-sdk";

function UnitConvertTest() {
  const { pointToPhysical, physicalToPoint } = useMetrics();

  return (
    <>
      <pre>
        Scaled conversion
        {"\n"}
        physicalToPoint(1): {physicalToPoint(1)}
        {"\n"}
        pointToPhysical(1): {pointToPhysical(1)}
      </pre>

      <pre>
        Unscaled conversion
        {"\n"}
        physicalToPoint(1):{" "}
        {physicalToPoint(1, { worldScalingCompensation: "unscaled" })}
        {"\n"}
        pointToPhysical(1):{" "}
        {pointToPhysical(1, { worldScalingCompensation: "unscaled" })}
      </pre>
    </>
  );
}
```

## 参数 {#parameters}

无

## 返回结构 {#return-shape}

```ts
type WorldScalingCompensation = "scaled" | "unscaled";

type MetricConvertOptions = {
  worldScalingCompensation?: WorldScalingCompensation;
};

type UseMetricsReturn = {
  pointToPhysical: (value: number, options?: MetricConvertOptions) => number;
  physicalToPoint: (value: number, options?: MetricConvertOptions) => number;
};
```

`worldScalingCompensation` 决定在转换过程中，是否对当前空间场景容器的 `worldScaling` 进行补偿。

- `scaled`：转换结果与经过 `worldScaling` 自动缩放后用户感知到的尺寸一致
- `unscaled`：得到不随 `worldScaling` 缩放而变化的稳定物理世界数值

### pointToPhysical

```ts
pointToPhysical(value: number, options?: MetricConvertOptions): number
```

### physicalToPoint

```ts
physicalToPoint(value: number, options?: MetricConvertOptions): number
```
