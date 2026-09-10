<!--
sidebar_position: 4
description: 'Animate the position, rotation, and scale of a 3D Entity inside a Reality container with a native timeline animation.'
-->

# `useEntityAnimation`

## Summary

`useEntityAnimation` animates the [Transform props](../react-components/Reality.md#3d-entity) (`position`, `rotation`, `scale`) of a 3D Entity inside [`<Reality>`](../react-components/Reality.md). You describe the motion once as a start pose, an end pose, and optional keyframes. The WebSpatial Runtime then plays it natively, without re-rendering the React component on every frame.

The hook works with every Entity component: `<Entity>`, `<Box>`, `<Sphere>`, `<Plane>`, `<Cone>`, `<Cylinder>`, and `<ModelEntity>`.

It only animates the transform of the Entity. It does not play animation stored inside a 3D model file. For that, use the [`<Model>` playback API](../react-components/Model.md#animation-playback-api). See [Animation](../react-components/Reality.md#animation) in the `<Reality>` docs for how the animation APIs fit together.

> [!CAUTION]
> **Experimental API**
>
> `useEntityAnimation` is exported from `@webspatial/react-sdk/experimental`, not from the default `@webspatial/react-sdk` entry. Its names and parameters may still change before it graduates to the default entry. Check the SDK release notes when upgrading.

> [!CAUTION]
> **Only works in a WebSpatial environment**
>
> Like [`useMetrics`](./useMetrics.md), this hook can only be called after the spatial capabilities of the SDK have finished loading in a WebSpatial environment. Calling it anywhere else throws an error. Put components that call it inside [`<SpatialBoot>`](../react-components/SpatialBoot.md), and render them only after confirming [runtime support](#runtime-support).

## Signature

```jsx
import { Reality, World, Box } from "@webspatial/react-sdk";
import { useEntityAnimation } from "@webspatial/react-sdk/experimental";

function RisingBox() {
  const [animation, api, entityProps] = useEntityAnimation({
    from: { position: { x: 0, y: -0.1, z: 0 } },
    to: { position: { x: 0, y: 0.1, z: 0 } },
    duration: 1,
    timingFunction: "easeInOut",
    loop: { reverse: true },
  });

  return (
    <Reality style={{ width: "500px", height: "500px", "--xr-depth": 200 }}>
      <World>
        <Box
          width={0.1}
          height={0.1}
          depth={0.1}
          {...entityProps}
          animation={animation}
        />
      </World>
    </Reality>
  );
}
```

Call the hook once for each Entity you want to animate. It returns a tuple of three values:

| Value | Type | Purpose |
| --- | --- | --- |
| `animation` | `EntityMotionAnimation` | Opaque binding. Pass it to the Entity's `animation` prop. |
| `api` | `EntityPlaybackApi` | Playback controls and playback state. See [Playback API](#playback-api). |
| `entityProps` | `EntityMotionProps` | The last pose confirmed by the runtime. Spread it onto the same Entity, after any static Transform props. See [Keeping the final pose](#keeping-the-final-pose). |

## Parameters

The hook takes one `config` object of type `EntityMotionConfig`.

```ts
type Vec3 = { x: number; y: number; z: number };
type TimingFunction = "linear" | "easeIn" | "easeOut" | "easeInOut";

// Any axis can be omitted.
type EntityMotionPatch = {
  position?: Partial<Vec3>; // meters
  rotation?: Partial<Vec3>; // degrees
  scale?: Partial<Vec3>; // multipliers, 1 = original size
};

type EntityMotionFrame = EntityMotionPatch & {
  timingFunction?: TimingFunction;
};

type EntityMotionTimeline = {
  from?: EntityMotionFrame; // same frame as "0%"
  to?: EntityMotionFrame; // same frame as "100%"
  [percentage: `${number}%`]: EntityMotionFrame;
};

type EntityMotionConfig = {
  from?: EntityMotionPatch;
  to?: EntityMotionPatch;
  timeline?: EntityMotionTimeline;
  duration?: number;
  timingFunction?: TimingFunction;
  delay?: number;
  playbackRate?: number;
  loop?: boolean | { reverse?: boolean };
  autoStart?: boolean;
  onStart?: (values: EntityMotionProps) => void;
  onComplete?: (values: EntityMotionProps) => void;
  onStop?: (values: EntityMotionProps) => void;
  onReset?: (values: EntityMotionProps) => void;
  onError?: (error: EntityPlaybackError) => void;
};
```

### Describing the motion

Choose one of two authoring shapes.

Start and end pose: write `from` and `to` at the top level of the config. `duration` defaults to `0.3` seconds in this shape.

```js
useEntityAnimation({
  from: { position: { x: -0.2 }, scale: { x: 1, y: 1, z: 1 } },
  to: { position: { x: 0.2 }, scale: { x: 1.2, y: 1.2, z: 1.2 } },
  duration: 0.8,
});
```

Keyframes: write a `timeline` keyed by percentages. `from` and `to` can be used inside the timeline as aliases for `0%` and `100%`. A `duration` is required in this shape. A `timingFunction` on a frame applies to the segment that starts at that frame and overrides the config-level `timingFunction`.

```js
useEntityAnimation({
  duration: 1.2,
  timingFunction: "linear",
  timeline: {
    "0%": { position: { y: 0 }, timingFunction: "easeIn" },
    "50%": { position: { y: 0.25 }, timingFunction: "easeOut" },
    "100%": { position: { y: 0 } },
  },
});
```

Rules that apply to both shapes:

- The start frame (`from` or `0%`) and the end frame (`to` or `100%`) are both required. A missing boundary is not filled from the Entity's current pose. It throws instead.
- List only the axes you want to animate. When a run starts, the runtime reads the Entity's current transform and uses it for every axis the config does not mention.
- `from` and `0%` are the same frame, as are `to` and `100%`. Defining both names for the same frame in one `timeline` throws.
- If `timeline` and top-level `from` / `to` are both present, `timeline` wins and the top-level values are ignored, with a warning in development.
- Only `position`, `rotation`, and `scale` can be animated. Any other property in a frame throws.

Invalid config is treated as a programmer error: the hook throws during render, so it surfaces through the nearest React error boundary rather than through `onError`.

### Playback options

| Option | Default | Description |
| --- | --- | --- |
| `duration` | `0.3` with top-level `from` / `to`; required with `timeline` | Length of one run in seconds. |
| `timingFunction` | `"easeInOut"` | Default easing for every segment. A frame's own `timingFunction` overrides it for the segment that begins at that frame. |
| `delay` | `0` | Seconds to wait before each fresh run starts. The delay is not scaled by `playbackRate` and is not repeated at loop boundaries. |
| `playbackRate` | `1` | Speed multiplier. Must be a finite number greater than `0`. |
| `loop` | `false` | `true` restarts from the start frame forever. `{ reverse: true }` plays forward and backward alternately. |
| `autoStart` | `true` | Start playing as soon as the animation is bound to an Entity. Set `false` to start with `api.play()`. `autoStart` only applies to the first binding; it does not replay after a config change. |

### Callbacks

All callbacks are notifications. Their return values are ignored and cannot change where the Entity ends up.

| Callback | When it fires | Argument |
| --- | --- | --- |
| `onStart` | Playback of a run has started (after the delay). | Complete start pose. |
| `onComplete` | A non-looping run reached its end, or `api.finish()` was called. | Complete end pose. |
| `onStop` | `api.stop()` was called. | Complete pose at the moment of stopping. |
| `onReset` | `api.reset()` was called. | Complete start pose. |
| `onError` | A runtime command failed. | `{ code, reason }` |

The `values` argument always contains complete `position`, `rotation`, and `scale` as confirmed by the runtime, including the axes your config did not animate.

`onError` receives an `EntityPlaybackError` whose `code` is one of `TARGET_NOT_FOUND`, `UNSUPPORTED_TARGET`, `ANIMATION_NOT_FOUND`, `INVALID_TIMELINE`, `COMPILATION_FAILED`, `INVALID_CONTROL_STATE`, or `INVALID_SET_VALUES`. If creating the native animation fails, `onError` fires once, `entityProps` is cleared, and every later `api` call is ignored with a console warning until the Entity is bound to a new animation.

## Return Shape

### Playback API

```ts
type EntityPlaybackApi = {
  play(): void;
  pause(): void;
  stop(): void;
  reset(): void;
  finish(): void;
  set(update: EntityMotionPatch): void;
  readonly playState: "idle" | "queued" | "running" | "paused" | "finished";
  readonly isAnimating: boolean;
  readonly isPaused: boolean;
  readonly finished: boolean;
};
```

| Method | Behavior |
| --- | --- |
| `play()` | Starts a fresh run from `idle` or `finished`, resumes from `paused`, and does nothing while `running`. A fresh run reads the Entity's current transform as the baseline for axes the config does not animate. |
| `pause()` | Pauses a running animation at the current pose. The runtime keeps ownership of the transform while paused. |
| `stop()` | Stops at the current pose, commits it, and returns to `idle`. Fires `onStop`. |
| `reset()` | Jumps back to the configured start pose, commits it, and returns to `idle`. Fires `onReset`. |
| `finish()` | Jumps to the configured end pose, commits it, and enters `finished`. Fires `onComplete`. |
| `set(update)` | Writes a sparse transform update through the animation while playback is inactive. Axes you do not mention keep their current values. The confirmed complete pose arrives through `entityProps`. Ignored with a warning while the animation is playing, delayed, or paused. |

`playState` and the three Boolean getters are read from the runtime-confirmed state:

| `playState` | Meaning | `isAnimating` | `isPaused` | `finished` |
| --- | --- | --- | --- | --- |
| `queued` | A playback command is waiting for the native animation to be created. | `false` | `false` | `false` |
| `idle` | Not playing. Static Transform props control the Entity. | `false` | `false` | `false` |
| `running` | Playing, including the initial `delay`. | `true` | `false` | `false` |
| `paused` | Paused by `pause()`. | `false` | `true` | `false` |
| `finished` | Reached the end frame or `finish()` was called. | `false` | `false` | `true` |

The component re-renders when `playState` or `entityProps` changes, so you can read `api.playState` directly in JSX.

### Keeping the final pose

`entityProps` holds the complete `position`, `rotation`, and `scale` most recently confirmed by the runtime. It is not updated every frame. It updates when a run starts, completes, stops, resets, or finishes, and after a successful config update or `api.set()`. Before the first of those events it is an empty object.

Spread it onto the animated Entity after the static Transform props, so that the last confirmed pose wins once the animation is no longer playing:

```jsx
<Box position={basePosition} {...entityProps} animation={animation} />
```

Without this, the Entity would snap back to the static `position` value as soon as the runtime releases the transform.

## Transform Ownership

While an animation is playing, delayed, or paused, the WebSpatial Runtime owns the whole transform of the Entity. Ordinary updates to `position`, `rotation`, or `scale` props are ignored during that time, and so is `api.set()`. Axes the config does not animate hold the baseline captured when the run started.

When the animation is inactive (`idle` or `finished`), the combined React props control the transform again. That includes the static props and the spread `entityProps`.

Removing the `animation` prop, passing a different animation, or unmounting the Entity unbinds the animation, releases the native resources, clears `entityProps`, and hands control back to the static props.

## Changing the Config While Bound

Passing a new config object to the hook updates the existing animation in place. The effect depends on the current state:

| State when the config changes | Behavior |
| --- | --- |
| `running` (including the delay) | Retargets from the current pose, then runs the new delay and full duration from the beginning. The interrupted run fires neither `onStop` nor `onComplete`; the new run fires `onStart` once. |
| `paused` | Stays paused. The next `play()` runs the new timeline from the paused pose. |
| `idle` or `finished` | Keeps the current state. The next `play()` uses the new config's start frame. |

Changing only callbacks never affects playback. If the update fails, the previous animation, state, and `entityProps` are kept and `onError` fires once.

Because the hook compares the config object by identity, keep the config stable across renders (for example with `useMemo` or module-level constants) when you do not intend to retarget the animation.

## Multiple Animations

- One Entity accepts one `animation` prop. To animate several transform components together, put them all in one config.
- One `animation` value binds to one Entity. Binding the same value to a second Entity throws. Call the hook once per Entity instead.
- To play motions in sequence on one Entity, use `timeline` keyframes, or swap the config after `onComplete`.

## Runtime Support

Entity transform animation is a capability of the WebSpatial Runtime, not only of the SDK. Check it before rendering a component that calls the hook:

```jsx
import { Box, WebSpatialRuntime } from "@webspatial/react-sdk";

function AnimatedBoxIfSupported() {
  if (!WebSpatialRuntime.supports("useEntityAnimation")) {
    // Unsupported runtime: render the Entity directly at its final pose.
    return (
      <Box position={{ x: 0, y: 0.1, z: 0 }} width={0.1} height={0.1} depth={0.1} />
    );
  }
  return <RisingBox />;
}
```

`WebSpatialRuntime.supports("useEntityAnimation")` returns `true` only when the current WebSpatial Runtime declares this capability. It returns `false` in ordinary browsers and in WebSpatial Runtime versions released before WebSpatial SDK 2.0. When it returns `false`, no behavior of the hook is guaranteed. Do not call the hook in that path.

## Limitations

- Only `position`, `rotation`, and `scale` are animatable. Opacity, materials, and colors are not.
- `entityProps` is not a per-frame value stream. There is no API to read the interpolated pose during playback.
- A looping animation never completes on its own. Call `stop()` or `finish()` to commit a pose and update `entityProps`.
- This hook does not control animation authored inside a model file. Use the [`<Model>` playback API](../react-components/Model.md#animation-playback-api) for that.

## Example: Manual Playback Control

```jsx
import { useMemo } from "react";
import { Reality, World, ModelAsset, ModelEntity } from "@webspatial/react-sdk";
import { useEntityAnimation } from "@webspatial/react-sdk/experimental";

const SPIN = {
  from: { rotation: { y: 0 } },
  to: { rotation: { y: 360 } },
  duration: 4,
  timingFunction: "linear",
  autoStart: false,
};

function TurntableShip() {
  const config = useMemo(() => SPIN, []);
  const [animation, api, entityProps] = useEntityAnimation(config);

  return (
    <>
      <Reality style={{ width: "100%", height: "500px" }}>
        <ModelAsset id="ship" src="https://example.com/fighter-jet.usdz" />
        <World>
          <ModelEntity
            model="ship"
            position={{ x: 0, y: 0, z: 0 }}
            {...entityProps}
            animation={animation}
          />
        </World>
      </Reality>
      <button onClick={() => api.play()}>Play</button>
      <button onClick={() => api.pause()}>Pause</button>
      <button onClick={() => api.stop()}>Stop</button>
      <button onClick={() => api.reset()}>Reset</button>
      <button onClick={() => api.finish()}>Finish</button>
      <button onClick={() => api.set({ position: { y: 0.2 } })}>Raise</button>
      <span>{api.playState}</span>
    </>
  );
}
```
