---
sidebar_position: 2
description: '使用接近 Web 标准 `<model>` 的 API，在空间化容器中渲染 3D 模型文件。'
---

# `<Model>`

:::info[版本要求]
本页记录的 API 需要 `@webspatial/react-sdk` `1.7.0` 或更高版本。各项播放功能是否可用还取决于 WebSpatial Runtime 的版本，见[运行环境支持](#runtime-support)。
:::

`<Model>` 组件实现了 WebSpatial API 中的[静态 3D 内容容器元素](../../../concepts/3d-content-containers.md)，这种元素兼容 Web 标准中的 `<model>` 元素的 API，同时对 web 标准中的能力做了增强，不仅让元素对应的 2D 面片具备了[空间化 HTML 元素的能力](../../../concepts/spatialized-html-elements.md)，也让 3D 模型能在这个 2D 面片前方的空间中渲染出有真实体积的 3D 内容。

:::info[标准 model element 的行为]
Web 标准中的 model element 原本只能让 3D 模型在这个元素的「画布」上渲染，这个画布看上去像一个洞口，3D 内容在洞口的「内部」或「后方」显示。可参考 [WebKit 的文档](https://webkit.org/blog/17118/a-step-into-the-spatial-web-the-html-model-element-in-apple-vision-pro/) 和 [demo](https://webkit.org/demos/model-demos/index.html)。
:::

要启用这种增强，需要在 `<Model>` 上添加[空间化 HTML 元素的标记（`enable-xr`）](./jsx-marker.md#enable-xr)：

```jsx
import { Model } from "@webspatial/react-sdk";

function Example() {
  return (
    <Model
      enable-xr
      autoPlay
      loop
      style={{ height: "200px", "--xr-depth": "100px" }}
    >
      <source src="/modelasset/robot.glb" type="model/gltf-binary" />
      <source src="/modelasset/robot.usdz" type="model/vnd.usdz+zip" />
    </Model>
  );
}
```

<Image img={require("/assets/new-docs/api/model-robot.png")} alt="在空间场景中由 Model 组件渲染的动画 3D 机器人模型" />

## 回退行为 {#fallback}

如果没有添加 `enable-xr` 标记，或当前运行环境中没有 [WebSpatial Runtime](../../../concepts/webspatial-app.md#webspatial-runtime)， `<Model>` 组件会自动降级成 web 标准中的 `<model>` 元素，由浏览器引擎负责渲染（当前平台上的浏览器引擎可能还不支持这个新标准，可以用 `typeof HTMLModelElement !== "undefined"` 做特性检测）。

:::tip[回退渲染的 polyfill]
为了让回退状态下的标准 `<model>` 代码在暂未原生支持 model element 标准的浏览器中也能显示，可以在页面中添加 [model element polyfill](https://github.com/immersive-web/model-element-samples/tree/main/model-element-polyfill)。
:::

WebSpatial SDK 当前版本中，`<Model>` 支持以下 model element 的 API：

## 属性 {#attributes}

### `src` {#src}

要嵌入的 3D 模型的 URL。

```jsx
import { Model } from "@webspatial/react-sdk";

function MyScene() {
  return <Model src="/modelasset/Duck.glb" enable-xr />;
}
```

使用 `src` 时只能指定一种格式的模型文件。要为不同平台提供不同格式的模型文件，请使用[子元素 `<source>`](#child-elements)。如果同时使用 `src` 和 `<source>` 子元素，`src` 的优先级最高：运行时会先尝试加载和使用 `src` 提供的模型文件，只有这个资源不可用时才会继续尝试 `<source>` 子元素。

### `poster` {#poster}

`poster` 用于在 3D 模型尚不可用时提供一张占位图片。当 `<Model>` 作为有真实体积的 3D 内容容器渲染时，WebSpatial SDK 会在模型文件加载期间把这张图片显示在 3D 容器的 2D 背板上。在此模式下，如果不提供 `poster`，SDK 会显示内部默认的 loading spinner。

当 `<Model>` 在 2D 网页中回退为标准 `<model>` 元素时，WebSpatial 只会把 `poster` 传递给浏览器，具体的展示时机和方式由浏览器而非 SDK 决定。当前的 [model element 规范草案](https://immersive-web.github.io/model-element/#poster-attribute) 说明，浏览器可以在 3D 内容不可用时显示这张图片，并建议在保持宽高比的前提下将其完整放入元素内并居中显示。暂时显示成类似静态 `<img>` 的占位图只是可能的效果之一，不是 WebSpatial SDK 保证的行为；不同原生浏览器的实现可能不同。

```jsx
import { Model } from "@webspatial/react-sdk";

function MyScene() {
  return (
    <Model
      src="/MaterialsVariantsShoe.glb"
      poster="/shoe-poster.png"
      enable-xr
    />
  );
}
```

### `autoPlay` {#autoplay}

`autoPlay` 是一个 Boolean 属性。为 `true` 时，模型文件加载完成并可渲染后，会立刻自动播放模型文件内部自带的第一段动画。对没有动画的模型文件没有效果。

请使用 React 属性名 `autoPlay`。全小写的 `autoplay` 不会被 SDK 识别。

### `loop` {#loop}

`loop` 是一个 Boolean 属性。为 `true` 时，模型文件内部自带的动画播放到结尾后会自动重新开始。

```jsx
import { Model } from "@webspatial/react-sdk";

function LoopingRobot() {
  return <Model src="/modelasset/robot.glb" autoPlay loop enable-xr />;
}
```

`autoPlay` 和 `loop` 只控制模型文件内部自带动画的播放，不会移动、旋转或缩放模型。命令式的播放控制，以及它和「让模型的 transform 动起来」的区别，见 [Animation Playback API](#animation-playback-api)。

### `loading` {#loading}

`loading` 控制模型文件什么时候开始下载。

- `eager` 是默认值，表示 `<Model>` 组件挂载后立刻开始下载模型文件。
- `lazy` 表示等到 `<Model>` 进入网页视区、真正需要渲染时再开始下载。

```jsx
import { Model } from "@webspatial/react-sdk";

function LongScrollPage() {
  return (
    <>
      {/* ... a lot of content ... */}
      <Model loading="lazy" src="/modelasset/cone.glb" enable-xr />
    </>
  );
}
```

## 子元素 {#child-elements}

### `<source>` {#source}

`<source>` 元素用于为 `<Model>` 指定一个或多个模型资源。它是一个 void element：没有内容，也不需要结束标签。在 JSX 中请使用自闭合形式。

不同平台支持的 3D 模型格式并不完全相同，因此你可以提供多个 source，由运行时使用第一个能理解的资源。source 会按顺序尝试加载。只要有一个 source 加载成功，就会在 `<Model>` 上触发 [`onLoad`](#onload) 事件，并且不会继续尝试后续 source。如果所有 source 都失败，会在 `<Model>` 上触发 [`onError`](#onerror) 事件。不会在每个单独的 `<source>` 元素上触发 error 事件。

`<source>` 支持以下属性：

`src`

3D 模型资源的 URL。

`type`

模型的 [MIME media type](https://www.iana.org/assignments/media-types/media-types.xhtml#model)。当前支持的类型包括 `model/vnd.usdz+zip` (USDZ) 和 `model/gltf-binary` (GLB)。

## 生命周期事件 {#lifecycle-events}

### `onLoad` {#onload}

当 3D 模型成功加载，并且已经可用于显示和交互时触发。如果提供了多个 source，这个事件只会针对第一个成功加载的 source 触发。

### `onError` {#onerror}

当模型加载失败时触发。如果提供了多个 source，这个事件只会在所有 source 都已尝试且全部失败后触发，不会针对每一次单独的 source 加载失败触发。

## JavaScript API {#javascript-api}

下面这些 JavaScript API 可以通过指向 `<Model>` 元素的 React ref 访问。在 TypeScript 中，可以用 `@webspatial/react-sdk` 导出的 `ModelRef` 作为 ref 的类型。

```jsx
import { useRef } from "react";
import { Model } from "@webspatial/react-sdk";

function ModelWithRef() {
  const modelRef = useRef(null);

  return (
    <Model
      ref={modelRef}
      src="/modelasset/robot.glb"
      enable-xr
      onLoad={() => console.log(modelRef.current.currentSrc)}
    />
  );
}
```

`currentSrc`

只读字符串，返回当前已加载资源的 URL。

`ready`

当模型的源文件已完成加载和处理时，这个 Promise 会 resolve。
如果源文件无法被获取，或者文件无法被解析为有效的 3D 模型资源，这个 Promise 会 reject。

`entityTransform`

一个可读可写的 DOMMatrixReadOnly，可以表示 [3D 模型和 3D 内容容器内部空间之间的关系](https://github.com/immersive-web/model-element/blob/main/explainer.md#visual-presentation-control)。

在默认状态下，3D 模型会在保持原有比例的前提下，尽可能撑满 `<Model>` 的宽或高，因此可以通过控制 `<Model>` 对应的 2D 面片的尺寸来控制 3D 模型的大小。

### Animation Playback API {#animation-playback-api}

这些 API 控制模型文件内部自带的动画，例如 GLB 或 USDZ 文件中导出的骨骼动画或关键帧动画。运行时会播放模型的第一段可用动画。如果文件中没有动画，`duration` 为 `0`，`play()` 不会产生可见效果。

:::note[播放动画不等于移动模型]
播放 API 改变的是模型随时间显示的内容，不会移动、旋转或缩放模型。要在容器内摆放模型，使用 `entityTransform`。要让模型的位置、旋转或缩放随时间变化，请把它作为 [`<ModelEntity>`](./Reality.md#model-entity) 渲染在 `<Reality>` 内，并使用 [`useEntityAnimation`](../js-api/useEntityAnimation.md)。完整说明见[动画](./Reality.md#animation)。
:::

`duration`

只读 `double`，表示模型动画未经缩放的总时长，单位为秒。如果模型没有动画，值为 `0`。这个值在模型加载完成后才可用，请在 [`onLoad`](#onload) 中或 `ready` resolve 之后读取。

`currentTime`

可读可写的 `double`，表示模型动画未经缩放的播放时间，单位为秒。给它赋值即可跳转进度。它会被限制在动画总时长范围内，因此对于没有动画的模型，这个值始终为 `0`。

`playbackRate`

可读可写的 `double`，表示动画的时间缩放比例。例如，一个动画时长为 10 秒的模型，如果 `playbackRate` 为 `0.5`，则需要 20 秒播放完成。

`paused`

只读 `Boolean`，表示模型动画当前是否处于暂停状态。开始播放之前为 `true`。

`play()`

尝试播放模型动画（如果模型包含动画）。返回一个 `Promise`，在播放成功开始后 resolve。

`pause()`

尝试暂停模型动画的播放。返回一个 `Promise`。如果模型已经处于暂停状态，这个方法不会产生额外效果。

模型加载完成之前，各个 getter 返回默认值（`paused` 为 `true`，`duration` 和 `currentTime` 为 `0`，`playbackRate` 为 `1`），对 `currentTime` 和 `playbackRate` 的赋值会被忽略。

#### 声明式播放 {#declarative-playback}

对于「模型加载完成后立刻播放内嵌动画」这种最常见的需求，只需使用 [`autoPlay`](#autoplay) 和 [`loop`](#loop) 属性，不需要写 JavaScript：

```jsx
import { Model } from "@webspatial/react-sdk";

function IdleRobot() {
  return <Model src="/modelasset/robot.glb" autoPlay loop enable-xr />;
}
```

#### 命令式播放 {#imperative-playback}

需要由用户控制播放、跳转进度或调整速度时，通过 ref 调用 API：

```jsx
import { useRef } from "react";
import { Model } from "@webspatial/react-sdk";

function RobotPlayer() {
  const modelRef = useRef(null);

  return (
    <>
      <Model
        ref={modelRef}
        src="/modelasset/robot.glb"
        loop
        enable-xr
        style={{ height: "200px", "--xr-depth": "100px" }}
        onLoad={() => console.log("duration:", modelRef.current.duration)}
      />
      <button onClick={() => modelRef.current.play()}>Play</button>
      <button onClick={() => modelRef.current.pause()}>Pause</button>
      <button onClick={() => (modelRef.current.currentTime = 2)}>
        Seek to 2s
      </button>
      <button onClick={() => (modelRef.current.playbackRate = 0.5)}>
        Half speed
      </button>
    </>
  );
}
```

#### 运行环境支持 {#runtime-support}

播放功能是 WebSpatial Runtime 的能力，并非每个运行时版本都全部支持。在依赖这些功能之前，用 `WebSpatialRuntime.supports` 搭配 `Model` key 和功能名称做检查：

```js
import { WebSpatialRuntime } from "@webspatial/react-sdk";

WebSpatialRuntime.supports("Model", ["autoplay", "loop"]);
WebSpatialRuntime.supports("Model", ["play", "pause", "paused"]);
WebSpatialRuntime.supports("Model", ["duration", "playbackRate", "currentTime"]);
```

可识别的功能名称包括 `autoplay`、`loop`、`play`、`pause`、`paused`、`duration`、`playbackRate` 和 `currentTime`。`autoPlay` 属性对应的功能名称是全小写的 `autoplay`。只有列出的功能全部支持时才返回 `true`，在普通浏览器中返回 `false`。

当 `<Model>` [回退](#fallback)为标准 `<model>` 元素时，播放功能是否可用取决于浏览器对该元素的实现，而不是 WebSpatial。
