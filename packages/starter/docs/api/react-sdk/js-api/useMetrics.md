<!--
sidebar_position: 2
description: 'Convert between 2D pixel units and real-world meter units inside WebSpatial layouts.'
-->

# `useMetrics`

## Summary

Performs [unit conversion](../../../concepts/3d-content-containers.md#2d-containing-3d) between the point unit (`px`) used by 2D GUI and the physical world unit (`m`) used by 3D space.

On visionOS, the default mapping is roughly `1360px ≈ 1 meter`, but this conversion is not always fixed:

If the [Spatial Scene container](../../../concepts/spatial-scenes.md) is of type `window`, or if the scene type is `volume` and [`worldScaling` in the initialization properties is set to `dynamic`](../scene-options/worldScaling.md), then the conversion between these two units is not fixed. See [`worldScalingCompensation`](#return-shape).

The conversion ratio also differs across spatial computing platforms, so this API should be used consistently for unit conversion.

> [!CAUTION]
> **Conversion only works in a WebSpatial Runtime**
>
> Calling `useMetrics()` itself is always safe — in ordinary browsers, during SSR, and before the SDK has finished loading it returns placeholder functions. It is the returned `pointToPhysical` / `physicalToPoint` that throw a `WebSpatialRuntimeError` when called in any of those situations. See [Runtime Requirements](#runtime-requirements).

## Runtime Requirements

`useMetrics` follows the [readiness vs. feature support](../react-components/SpatialBoot.md#readiness-vs-feature-support) model. Two conditions must both hold before you call the conversion functions:

1. **The SDK is ready.** Mount the component that calls `useMetrics()` inside [`<SpatialBoot>`](../react-components/SpatialBoot.md). Inside `<SpatialBoot>` that is all you need to do. The detail only matters if you bypass `<SpatialBoot>` and render the component before boot completes: the hook picks its implementation once, when the component mounts, so such a component keeps the placeholder functions until it is remounted.
2. **The runtime supports unit conversion.** `<SpatialBoot>` also mounts its children in ordinary browsers, where there is nothing to convert, so being inside `<SpatialBoot>` is not enough on its own. Check `WebSpatialRuntime.supports("useMetrics")` and render fallback UI when it returns `false`.

When either condition fails, `useMetrics()` still returns an object, but `pointToPhysical` and `physicalToPoint` throw a `WebSpatialRuntimeError` (with `capability` set to `"useMetrics"`) as soon as they are called. The two function references are stable across renders, so they are safe to list in dependency arrays.

The recommended guard, for a component rendered inside `<SpatialBoot>`:

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

Keep the `useMetrics()` call in a component that only renders when the feature is supported, as above. That way the hook order stays stable and the placeholder functions are never called.

## Signature

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

## Parameters

None.

## Return Shape

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

`worldScalingCompensation` determines whether the current Spatial Scene container's `worldScaling` should be compensated during the conversion.

- `scaled`: the conversion result matches the size perceived by the user after automatic scaling from `worldScaling`
- `unscaled`: returns a stable physical-world value that does not change with `worldScaling`

### pointToPhysical

```ts
pointToPhysical(value: number, options?: MetricConvertOptions): number
```

### physicalToPoint

```ts
physicalToPoint(value: number, options?: MetricConvertOptions): number
```
