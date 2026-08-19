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

:::note[依赖空间化实现]
在空间化实现加载完成之前，`useMetrics` 只会返回固定的占位值。需要读取真实指标的组件应挂载在 [`<SpatialBoot>`](../react-components/SpatialBoot.md) 内部，确保它们在加载成功后才渲染。
:::

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
