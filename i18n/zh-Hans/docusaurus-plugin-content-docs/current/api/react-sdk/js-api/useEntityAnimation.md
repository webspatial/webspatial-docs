---
sidebar_position: 4
description: '用原生时间轴动画，让 Reality 容器内 3D Entity 的 position、rotation、scale 动起来。'
---

# `useEntityAnimation`

## 概述 {#summary}

`useEntityAnimation` 用于让 [`<Reality>`](../react-components/Reality.md) 内 3D Entity 的 [Transform 属性](../react-components/Reality.md#3d-entity)（`position`、`rotation`、`scale`）动起来。你只需要用起点姿态、终点姿态和可选的关键帧描述一次动画，WebSpatial Runtime 就会在原生层播放它，不需要每一帧都重新渲染 React 组件。

这个 Hook 适用于所有 Entity 组件：`<Entity>`、`<Box>`、`<Sphere>`、`<Plane>`、`<Cone>`、`<Cylinder>` 和 `<ModelEntity>`。

它只会改变 Entity 的 transform，不会播放 3D 模型文件内部自带的动画。要播放那种动画，请使用 [`<Model>` 的播放 API](../react-components/Model.md#animation-playback-api)。关于几种动画 API 的分工，请参考 `<Reality>` 文档中的[动画](../react-components/Reality.md#animation)一节。

:::caution[实验性 API]
`useEntityAnimation` 从 `@webspatial/react-sdk/experimental` 导出，而不是默认的 `@webspatial/react-sdk` 入口。在它进入默认入口之前，名称和参数仍可能变化。升级时请查看 SDK 的发布说明。
:::

:::caution[只能在 WebSpatial 环境中使用]
与 [`useMetrics`](./useMetrics.md) 一样，这个 Hook 只能在 WebSpatial 环境中、SDK 的空间能力加载完成之后调用，在其他地方调用会抛出错误。请把调用它的组件放在 [`<SpatialBoot>`](../react-components/SpatialBoot.md) 内部，并且只在确认[运行环境支持](#runtime-support)之后再渲染它。
:::

## 调用形式 {#signature}

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

每个需要动画的 Entity 调用一次这个 Hook。它返回一个包含三个值的元组：

| 返回值 | 类型 | 作用 |
| --- | --- | --- |
| `animation` | `EntityMotionAnimation` | 不透明的绑定对象，传给 Entity 的 `animation` 属性。 |
| `api` | `EntityPlaybackApi` | 播放控制和播放状态，见[播放 API](#playback-api)。 |
| `entityProps` | `EntityMotionProps` | 运行时最近一次确认的姿态。把它展开到同一个 Entity 上，放在静态 Transform 属性之后，见[让物体停在终点姿态](#keeping-the-final-pose)。 |

## 参数 {#parameters}

这个 Hook 接收一个类型为 `EntityMotionConfig` 的 `config` 对象。

```ts
type Vec3 = { x: number; y: number; z: number };
type TimingFunction = "linear" | "easeIn" | "easeOut" | "easeInOut";

// 任意轴都可以省略。
type EntityMotionPatch = {
  position?: Partial<Vec3>; // 单位：米
  rotation?: Partial<Vec3>; // 单位：度
  scale?: Partial<Vec3>; // 倍数，1 = 原始大小
};

type EntityMotionFrame = EntityMotionPatch & {
  timingFunction?: TimingFunction;
};

type EntityMotionTimeline = {
  from?: EntityMotionFrame; // 等同于 "0%"
  to?: EntityMotionFrame; // 等同于 "100%"
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

### 描述动画 {#describing-the-motion}

两种写法二选一。

起点和终点姿态：在 config 顶层写 `from` 和 `to`。这种写法下 `duration` 默认为 `0.3` 秒。

```js
useEntityAnimation({
  from: { position: { x: -0.2 }, scale: { x: 1, y: 1, z: 1 } },
  to: { position: { x: 0.2 }, scale: { x: 1.2, y: 1.2, z: 1.2 } },
  duration: 0.8,
});
```

关键帧：写一个以百分比为 key 的 `timeline`。`timeline` 内部也可以用 `from` 和 `to` 作为 `0%` 和 `100%` 的别名。这种写法必须提供 `duration`。写在某一帧上的 `timingFunction` 作用于从这一帧开始的那一段，并覆盖 config 顶层的 `timingFunction`。

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

两种写法共同遵守的规则：

- 起点帧（`from` 或 `0%`）和终点帧（`to` 或 `100%`）都必须提供。缺少任意一端不会用 Entity 的当前姿态补全，而是直接抛出错误。
- 只写你想动画的轴。每轮播放开始时，运行时会读取 Entity 的当前 transform，config 没有提到的轴都沿用这个值。
- `from` 和 `0%` 是同一帧，`to` 和 `100%` 也是同一帧。在同一个 `timeline` 里把同一帧写两遍会抛出错误。
- 如果同时写了 `timeline` 和顶层 `from` / `to`，以 `timeline` 为准，顶层的值会被忽略，并在开发模式下输出警告。
- 只有 `position`、`rotation`、`scale` 可以做动画。帧里出现其他属性会抛出错误。

非法的 config 被视为程序错误：Hook 会在渲染阶段抛出，由最近的 React error boundary 接住，而不是通过 `onError` 通知。

### 播放选项 {#playback-options}

| 选项 | 默认值 | 说明 |
| --- | --- | --- |
| `duration` | 顶层 `from` / `to` 写法下为 `0.3`；使用 `timeline` 时必填 | 一轮播放的时长，单位为秒。 |
| `timingFunction` | `"easeInOut"` | 所有分段的默认缓动。某一帧自己的 `timingFunction` 会覆盖从该帧开始的那一段。 |
| `delay` | `0` | 每轮新播放开始前等待的秒数。不受 `playbackRate` 缩放，也不会在循环边界重复。 |
| `playbackRate` | `1` | 速度倍数。必须是大于 `0` 的有限数。 |
| `loop` | `false` | `true` 表示从起点帧无限重复；`{ reverse: true }` 表示正向、反向交替播放。 |
| `autoStart` | `true` | 绑定到 Entity 后立刻开始播放。设为 `false` 时通过 `api.play()` 开始。`autoStart` 只在首次绑定时生效，config 变化后不会重新自动播放。 |

### 回调 {#callbacks}

所有回调都只是通知。它们的返回值会被忽略，不能决定 Entity 最终停在哪里。

| 回调 | 触发时机 | 参数 |
| --- | --- | --- |
| `onStart` | 一轮播放开始（延迟结束之后）。 | 完整的起点姿态。 |
| `onComplete` | 非循环播放到达终点，或调用了 `api.finish()`。 | 完整的终点姿态。 |
| `onStop` | 调用了 `api.stop()`。 | 停止时刻的完整姿态。 |
| `onReset` | 调用了 `api.reset()`。 | 完整的起点姿态。 |
| `onError` | 某个运行时命令失败。 | `{ code, reason }` |

`values` 参数始终包含运行时确认的完整 `position`、`rotation`、`scale`，包括 config 中没有动画的轴。

`onError` 收到的是 `EntityPlaybackError`，其 `code` 为 `TARGET_NOT_FOUND`、`UNSUPPORTED_TARGET`、`ANIMATION_NOT_FOUND`、`INVALID_TIMELINE`、`COMPILATION_FAILED`、`INVALID_CONTROL_STATE`、`INVALID_SET_VALUES` 之一。如果原生动画创建失败，`onError` 会触发一次，`entityProps` 被清空，之后所有 `api` 调用都会被忽略并输出 console 警告，直到 Entity 绑定新的动画。

## 返回值 {#return-shape}

### 播放 API {#playback-api}

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

| 方法 | 行为 |
| --- | --- |
| `play()` | 从 `idle` 或 `finished` 开始一轮新播放，从 `paused` 恢复播放，在 `running` 时不做任何事。新一轮播放会读取 Entity 当前的 transform，作为 config 未动画的轴的基准值。 |
| `pause()` | 在当前姿态暂停正在播放的动画。暂停期间运行时仍然拥有 transform 的控制权。 |
| `stop()` | 在当前姿态停止并提交这个姿态，回到 `idle`。触发 `onStop`。 |
| `reset()` | 跳回 config 声明的起点姿态并提交，回到 `idle`。触发 `onReset`。 |
| `finish()` | 跳到 config 声明的终点姿态并提交，进入 `finished`。触发 `onComplete`。 |
| `set(update)` | 在播放空闲时，通过动画写入一次稀疏的 transform 更新。没有提到的轴保持当前值。确认后的完整姿态通过 `entityProps` 返回。在动画播放中、延迟中或暂停中调用会被忽略并输出警告。 |

`playState` 和三个 Boolean getter 都来自运行时确认的状态：

| `playState` | 含义 | `isAnimating` | `isPaused` | `finished` |
| --- | --- | --- | --- | --- |
| `queued` | 有播放命令正在等待原生动画对象创建完成。 | `false` | `false` | `false` |
| `idle` | 未播放。静态 Transform 属性控制 Entity。 | `false` | `false` | `false` |
| `running` | 播放中，包括开头的 `delay`。 | `true` | `false` | `false` |
| `paused` | 被 `pause()` 暂停。 | `false` | `true` | `false` |
| `finished` | 到达终点帧，或调用了 `finish()`。 | `false` | `false` | `true` |

当 `playState` 或 `entityProps` 变化时组件会重新渲染，因此可以直接在 JSX 中读取 `api.playState`。

### 让物体停在终点姿态 {#keeping-the-final-pose}

`entityProps` 保存运行时最近一次确认的完整 `position`、`rotation`、`scale`。它不会逐帧更新，只在播放开始、完成、停止、重置、结束，以及 config 更新成功或 `api.set()` 成功后更新。在第一次更新之前它是一个空对象。

把它展开到被动画的 Entity 上，并放在静态 Transform 属性之后，这样动画不再播放时，最近确认的姿态才能生效：

```jsx
<Box position={basePosition} {...entityProps} animation={animation} />
```

否则，运行时释放 transform 控制权后，Entity 会立刻弹回静态 `position` 的值。

## transform 归谁控制 {#transform-ownership}

动画在播放中、延迟中或暂停中时，WebSpatial Runtime 拥有这个 Entity 的完整 transform。这期间对 `position`、`rotation`、`scale` 属性的普通更新会被忽略，`api.set()` 也一样。config 中没有动画的轴保持本轮播放开始时捕获的基准值。

动画空闲（`idle` 或 `finished`）时，组合后的 React 属性重新控制 transform，包括静态属性和展开的 `entityProps`。

移除 `animation` 属性、换成另一个 animation，或者卸载 Entity，都会解除绑定、释放原生资源、清空 `entityProps`，并把控制权交还给静态属性。

## 绑定期间修改 config {#changing-the-config-while-bound}

给 Hook 传入新的 config 对象会原地更新已有的动画。效果取决于当前状态：

| 修改 config 时的状态 | 行为 |
| --- | --- |
| `running`（含延迟） | 从当前姿态重新定向，然后从头执行新的延迟和完整时长。被打断的那一轮既不触发 `onStop` 也不触发 `onComplete`；新的一轮触发一次 `onStart`。 |
| `paused` | 保持暂停。下次 `play()` 从暂停姿态执行新的时间轴。 |
| `idle` 或 `finished` | 保持当前状态。下次 `play()` 使用新 config 的起点帧。 |

只修改回调不会影响播放。如果更新失败，之前的动画、状态和 `entityProps` 保持不变，`onError` 触发一次。

Hook 按对象引用比较 config，因此如果不打算重新定向动画，请在多次渲染之间保持 config 稳定（例如使用 `useMemo` 或模块级常量）。

## 多个动画 {#multiple-animations}

- 一个 Entity 只接受一个 `animation` 属性。要同时动画多个 transform 分量，把它们写进同一个 config。
- 一个 `animation` 值只能绑定到一个 Entity。把同一个值绑定到第二个 Entity 会抛出错误。请为每个 Entity 分别调用一次 Hook。
- 要在同一个 Entity 上依次播放多段运动，使用 `timeline` 关键帧，或者在 `onComplete` 之后替换 config。

## 运行环境支持 {#runtime-support}

Entity transform 动画是 WebSpatial Runtime 的能力，不只取决于 SDK 版本。在渲染调用这个 Hook 的组件之前先检查：

```jsx
import { Box, WebSpatialRuntime } from "@webspatial/react-sdk";

function AnimatedBoxIfSupported() {
  if (!WebSpatialRuntime.supports("useEntityAnimation")) {
    // 运行环境不支持：直接把 Entity 渲染在最终姿态上。
    return (
      <Box position={{ x: 0, y: 0.1, z: 0 }} width={0.1} height={0.1} depth={0.1} />
    );
  }
  return <RisingBox />;
}
```

只有当前 WebSpatial Runtime 声明支持这项能力时，`WebSpatialRuntime.supports("useEntityAnimation")` 才返回 `true`。在普通浏览器中，以及在 WebSpatial SDK 2.0 之前发布的 WebSpatial Runtime 版本中，它返回 `false`。返回 `false` 时，这个 Hook 的任何行为都没有保证，不要在这条路径上调用它。

## 限制 {#limitations}

- 只能动画 `position`、`rotation`、`scale`。不支持透明度、材质和颜色。
- `entityProps` 不是逐帧的数据流。没有 API 可以在播放过程中读取插值后的姿态。
- 循环动画不会自行结束。调用 `stop()` 或 `finish()` 才会提交姿态并更新 `entityProps`。
- 这个 Hook 不控制模型文件内部自带的动画。请使用 [`<Model>` 的播放 API](../react-components/Model.md#animation-playback-api)。

## 示例：手动控制播放 {#example-manual-playback-control}

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
