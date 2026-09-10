<!--
sidebar_position: 2
description: 'Render 3D model files inside a spatialized container using the Web-standard-inspired `<model>` API.'
-->

# `<Model>`

> [!IMPORTANT]
> These APIs require `@webspatial/react-sdk` version `1.7.0` or later. Individual playback features also depend on the WebSpatial Runtime version; see [Runtime support](#runtime-support).

The `<Model>` component implements the [static 3D content container element](../../../concepts/3d-content-containers.md) in the WebSpatial API. This element is compatible with the API of the `<model>` element in Web standards, while also enhancing the standard capability so that the 2D plane corresponding to the element gains the capabilities of a [spatialized HTML element](../../../concepts/spatialized-html-elements.md), and the 3D model can render truly volumetric 3D content in the space in front of that 2D plane.

> [!IMPORTANT]
> Behavior of the standard model element
>
> In Web standards, the model element can only render a 3D model inside the element's own "canvas". That canvas looks like an opening, and the 3D content appears "inside" or "behind" that opening. See the [WebKit documentation](https://webkit.org/blog/17118/a-step-into-the-spatial-web-the-html-model-element-in-apple-vision-pro/) and [demo](https://webkit.org/demos/model-demos/index.html).

To enable this enhancement, add the [spatialized HTML element marker (`enable-xr`)](./jsx-marker.md#enable-xr) on `<Model>`:

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

![An animated 3D robot model rendered by the Model component in a spatial scene](../../../../../../static/assets/new-docs/api/model-robot.png)

## Fallback

If the `enable-xr` marker is not added, or if the current runtime environment does not have [WebSpatial Runtime](../../../concepts/webspatial-app.md#webspatial-runtime), the `<Model>` component automatically falls back to the `<model>` element from Web standards and is rendered by the browser engine. The browser engine on the current platform may not support this new standard yet. You can use `typeof HTMLModelElement !== "undefined"` for feature detection.

> [!TIP]
> To make fallback `<model>` markup render in browsers that do not yet ship native model element support, add the [model element polyfill](https://github.com/immersive-web/model-element-samples/tree/main/model-element-polyfill) to the page.

In the current version of WebSpatial SDK, `<Model>` supports the following model element APIs:

## Attributes

### `src`

The URL of the 3D model to embed.

```jsx
import { Model } from "@webspatial/react-sdk";

function MyScene() {
  return <Model src="/modelasset/Duck.glb" enable-xr />;
}
```

The `src` prop can specify only one model file. To provide different model formats for different platforms, use [child `<source>` elements](#child-elements). If `src` and `<source>` children are both present, `src` has priority: the runtime tries the model file from `src` first, then falls back to the `<source>` children only if that resource cannot be used.

### `poster`

The `poster` prop provides a placeholder image for times when the 3D model is not yet available. When `<Model>` renders as a volumetric 3D content container, WebSpatial SDK displays the poster image on the 2D back plane of that container while the model file is loading. If `poster` is not provided in this mode, the SDK displays its internal loading spinner.

When `<Model>` falls back to the standard `<model>` element in a 2D webpage, WebSpatial passes `poster` through to the browser; the browser, rather than the SDK, decides how and when to display it. The current [model element draft](https://immersive-web.github.io/model-element/#poster-attribute) says that a user agent can show the image while 3D content is unavailable and recommends fitting it inside the element while preserving its aspect ratio and centering it. A temporary static `<img>`-like placeholder is one possible result, but native browser implementations may differ.

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

The `autoPlay` prop is a Boolean. If `true`, the first animation authored inside the model file starts playing automatically after the model file has loaded and is ready to render. It has no effect on a model file without animation.

Use the React prop name `autoPlay`. A lowercase `autoplay` attribute is not recognized by the SDK.

### `loop`

The `loop` prop is a Boolean. If `true`, the animation authored inside the model file restarts automatically when playback reaches the end.

```jsx
import { Model } from "@webspatial/react-sdk";

function LoopingRobot() {
  return <Model src="/modelasset/robot.glb" autoPlay loop enable-xr />;
}
```

`autoPlay` and `loop` only control playback of animation stored in the model file. They do not move, rotate, or scale the model. See [Animation Playback API](#animation-playback-api) for the imperative controls and for how this differs from animating the model's transform.

### `loading`

The `loading` prop controls when the model file starts downloading.

- `eager` is the default value. The model file starts downloading as soon as the `<Model>` component mounts.
- `lazy` delays the download until the `<Model>` component enters the viewport and needs to render.

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

## Child Elements

### `<source>` {#source}

The `<source>` element specifies one or more model resources for the `<Model>` element. It is a void element: it has no content and does not require a closing tag. In JSX, write it as a self-closing element.

Platforms do not all support the same 3D model formats, so you can provide multiple sources and let the runtime use the first one it understands. Sources are attempted sequentially. If one source loads successfully, the [`onLoad`](#onload) event fires on `<Model>` and later sources are not attempted. If all sources fail, the [`onError`](#onerror) event fires on `<Model>`. Error events are not fired on each individual `<source>` element.

`<source>` supports these attributes:

`src`

The URL of the 3D model resource.

`type`

The [MIME media type](https://www.iana.org/assignments/media-types/media-types.xhtml#model) of the model. Currently supported types are `model/vnd.usdz+zip` (USDZ) and `model/gltf-binary` (GLB).

## Lifecycle Events

### `onLoad` {#onload}

Triggered when the 3D model has loaded successfully and is ready for display and interaction. If multiple sources are provided, this event fires only for the first source that loads successfully.

### `onError` {#onerror}

Triggered when the model fails to load. If multiple sources are provided, this event fires only after all sources have been attempted and have failed; it does not fire for each individual source failure.

## JavaScript API

Access the following JavaScript APIs through a React ref to the underlying `<Model>` element. In TypeScript, type the ref with `ModelRef`, exported from `@webspatial/react-sdk`.

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

A read-only string that returns the URL of the currently loaded resource.

`ready`

This Promise resolves when the model source file has finished loading and processing.
If the source file cannot be fetched, or the file cannot be parsed as a valid 3D model resource, this Promise rejects.

`entityTransform`

A readable and writable `DOMMatrixReadOnly` representing the [relationship between the 3D model and the internal space of the 3D content container](https://github.com/immersive-web/model-element/blob/main/explainer.md#visual-presentation-control).

By default, the 3D model fills as much of `<Model>`'s width or height as possible while preserving its original proportions, so you can control the size of the 3D model by controlling the size of the 2D plane corresponding to `<Model>`.

### Animation Playback API {#animation-playback-api}

These APIs control animation that is authored inside the model file, such as a skeletal or keyframe animation exported in a GLB or USDZ file. The runtime plays the model's first available animation. If the file contains no animation, `duration` is `0` and `play()` has no visible effect.

> [!NOTE]
> **Playback is not the same as moving the model**
>
> The playback API changes what the model shows over time. It does not move, rotate, or scale the model. To place the model inside its container, use `entityTransform`. To animate the position, rotation, or scale of a model over time, render it as a [`<ModelEntity>`](./Reality.md#model-entity) inside `<Reality>` and use [`useEntityAnimation`](../js-api/useEntityAnimation.md). See [Animation](./Reality.md#animation) for the full picture.

`duration`

A read-only `double` reflecting the un-scaled total duration of the model animation in seconds. If the model has no animation, the value is `0`. The value becomes available once the model has loaded; read it in [`onLoad`](#onload) or after `ready` resolves.

`currentTime`

A readable and writable `double` reflecting the un-scaled playback time of the model animation in seconds. Assign it to seek. It is clamped to the duration of the animation, so for a model with no animation, the value is always `0`.

`playbackRate`

A readable and writable `double` reflecting the time scaling for animations, if present. For example, a model with a ten-second animation and a `playbackRate` of `0.5` takes 20 seconds to complete.

`paused`

A read-only `Boolean` indicating whether the model's animation is currently paused. It is `true` until playback starts.

`play()`

Attempts to play the model's animation, if present. Returns a `Promise` that resolves when playback has started successfully.

`pause()`

Attempts to pause the playback of the model's animation. Returns a `Promise`. If the model is already paused, this method has no effect.

Before the model has loaded, the getters return their defaults (`paused` is `true`, `duration` and `currentTime` are `0`, `playbackRate` is `1`), and assignments to `currentTime` and `playbackRate` are ignored.

#### Declarative playback

For the common case of "play the embedded animation as soon as the model loads", use the [`autoPlay`](#autoplay) and [`loop`](#loop) props and no JavaScript:

```jsx
import { Model } from "@webspatial/react-sdk";

function IdleRobot() {
  return <Model src="/modelasset/robot.glb" autoPlay loop enable-xr />;
}
```

#### Imperative playback

For user-controlled playback, seeking, or speed changes, call the API through a ref:

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

#### Runtime support

Playback features are capabilities of the WebSpatial Runtime and are not all available in every runtime version. Use `WebSpatialRuntime.supports` with the `Model` key and the feature names to check before relying on them:

```js
import { WebSpatialRuntime } from "@webspatial/react-sdk";

WebSpatialRuntime.supports("Model", ["autoplay", "loop"]);
WebSpatialRuntime.supports("Model", ["play", "pause", "paused"]);
WebSpatialRuntime.supports("Model", ["duration", "playbackRate", "currentTime"]);
```

The recognized feature names are `autoplay`, `loop`, `play`, `pause`, `paused`, `duration`, `playbackRate`, and `currentTime`. The feature name for the `autoPlay` prop is lowercase `autoplay`. The call returns `true` only when every listed feature is supported, and `false` in ordinary browsers.

When `<Model>` [falls back](#fallback) to the standard `<model>` element, playback support depends on the browser's implementation of that element, not on WebSpatial.
