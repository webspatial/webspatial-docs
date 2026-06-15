---
sidebar_position: 2
description: 'Render 3D model files inside a spatialized container using the Web-standard-inspired `<model>` API.'
---

# `<Model>`

:::info[Version requirement]
The APIs documented on this page require `@webspatial/react-sdk` version `1.7.0` or later.
:::

The `<Model>` component implements the [static 3D content container element](../../../concepts/3d-content-containers.md) in the WebSpatial API. This element is compatible with the API of the `<model>` element in Web standards, while also enhancing the standard capability so that the 2D plane corresponding to the element gains the capabilities of a [spatialized HTML element](../../../concepts/spatialized-html-elements.md), and the 3D model can render truly volumetric 3D content in the space in front of that 2D plane.

:::info[Behavior of the standard model element]
In Web standards, the model element can only render a 3D model inside the element's own "canvas". That canvas looks like an opening, and the 3D content appears "inside" or "behind" that opening. See the [WebKit documentation](https://webkit.org/blog/17118/a-step-into-the-spatial-web-the-html-model-element-in-apple-vision-pro/) and [demo](https://webkit.org/demos/model-demos/index.html).
:::

To enable this enhancement, add the [spatialized HTML element marker (`enable-xr`)](./jsx-marker.md#enable-xr) on `<Model>`:

```jsx
import { Model } from "@webspatial/react-sdk";

function Example() {
  return (
    <Model
      enable-xr
      autoplay
      loop
      style={{ height: "200px", "--xr-depth": "100px" }}
    >
      <source src="/modelasset/robot.glb" type="model/gltf-binary" />
      <source src="/modelasset/robot.usdz" type="model/vnd.usdz+zip" />
    </Model>
  );
}
```

<Image img={require("/assets/new-docs/api/model-robot.png")} alt="An animated 3D robot model rendered by the Model component in a spatial scene" />

## Fallback

If the `enable-xr` marker is not added, or if the current runtime environment does not have [WebSpatial Runtime](../../../concepts/webspatial-app.md#webspatial-runtime), the `<Model>` component automatically falls back to the `<model>` element from Web standards and is rendered by the browser engine. The browser engine on the current platform may not support this new standard yet. You can use `typeof HTMLModelElement !== "undefined"` for feature detection.

:::tip[Polyfill for fallback rendering]
To make fallback `<model>` markup render in browsers that do not yet ship native model element support, add the [model element polyfill](https://github.com/immersive-web/model-element-samples/tree/main/model-element-polyfill) to the page.
:::

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

The `poster` prop displays a transitional placeholder image while the model file is loading. When `<Model>` renders as a volumetric 3D content container, the poster image is rendered on the 2D back plane of that 3D container. When `<Model>` renders as the standard `<model>` element in a 2D webpage, the poster behaves like a temporary static `<img>` representation of the model element, matching the standard model element `poster` attribute.

If `poster` is not provided, WebSpatial SDK displays its internal loading spinner.

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

### `autoplay`

The `autoplay` attribute starts built-in model animations automatically after the model file has loaded and is ready to render.

### `loop`

The `loop` prop restarts built-in model animations automatically when playback reaches the end.

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

Access the following JavaScript APIs through a React ref to the underlying `<Model>` element.

`currentSrc`

A read-only string that returns the URL of the currently loaded resource.

`ready`

This Promise resolves when the model source file has finished loading and processing.
If the source file cannot be fetched, or the file cannot be parsed as a valid 3D model resource, this Promise rejects.

`entityTransform`

A readable and writable `DOMMatrixReadOnly` representing the [relationship between the 3D model and the internal space of the 3D content container](https://github.com/immersive-web/model-element/blob/main/explainer.md#visual-presentation-control).

By default, the 3D model fills as much of `<Model>`'s width or height as possible while preserving its original proportions, so you can control the size of the 3D model by controlling the size of the 2D plane corresponding to `<Model>`.

### Animation Playback API

`duration`

A read-only `double` reflecting the un-scaled total duration of the model animation in seconds. If the model has no animation, the value is `0`.

`currentTime`

A readable and writable `double` reflecting the un-scaled playback time of the model animation in seconds. It is clamped to the duration of the animation, so for a model with no animation, the value is always `0`.

`playbackRate`

A readable and writable `double` reflecting the time scaling for animations, if present. For example, a model with a ten-second animation and a `playbackRate` of `0.5` takes 20 seconds to complete.

`paused`

A read-only `Boolean` indicating whether the model's animation is currently paused.

`play()`

Attempts to play the model's animation, if present. Returns a `Promise` that resolves when playback has started successfully.

`pause()`

Attempts to pause the playback of the model's animation. If the model is already paused, this method has no effect.
