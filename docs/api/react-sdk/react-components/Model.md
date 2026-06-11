---
sidebar_position: 2
description: 'Render a static 3D model with multi-format sources, animation playback, and built-in spatial interaction, using the Web-standard-inspired `<model>` API.'
---

# `<Model>`

The `<Model>` component implements the [static 3D content container element](../../../concepts/3d-content-containers.md) in the WebSpatial API. This element is compatible with the API of the `<model>` element in Web standards, while also enhancing the standard capability so that the 2D plane corresponding to the element gains the capabilities of a [spatialized HTML element](../../../concepts/spatialized-html-elements.md), and the 3D model can render truly volumetric 3D content in the space in front of that 2D plane.

It handles loading 3D model assets, managing playback of animations embedded in the model file, and responding to [spatial interactions](../../../concepts/natural-interactions.md#spatial-interactions).

:::info[Behavior of the standard model element]
In Web standards, the model element can only render a 3D model inside the element's own "canvas". That canvas looks like an opening, and the 3D content appears "inside" or "behind" that opening. See the [WebKit documentation](https://webkit.org/blog/17118/a-step-into-the-spatial-web-the-html-model-element-in-apple-vision-pro/) and [demo](https://webkit.org/demos/model-demos/index.html).
:::

To enable this enhancement, add the [spatialized HTML element marker (`enable-xr`)](./jsx-marker.md#enable-xr) on `<Model>`:

```jsx
import { Model } from "@webspatial/react-sdk";

function Example() {
  const style = { height: "200px", "--xr-depth": "100px" };
  return (
    <Model enable-xr autoPlay loop style={style}>
      <source src="/model/robot.glb" type="model/gltf-binary" />
      <source src="/model/robot.usdz" type="model/vnd.usdz+zip" />
    </Model>
  );
}
```

<Image img={require("/assets/api/model-robot.png")} alt="An animated 3D robot model rendered by the Model component in a spatial scene" />

## Fallback {#fallback}

If the `enable-xr` marker is not added, or if the current runtime environment does not have [WebSpatial Runtime](../../../concepts/webspatial-app.md#webspatial-runtime), the `<Model>` component automatically falls back to the `<model>` element from Web standards and is rendered by the browser engine. The browser engine on the current platform may not support this new standard yet. You can use `typeof HTMLModelElement !== "undefined"` for feature detection.

In the current version of WebSpatial SDK, `<Model>` supports the following model element APIs:

## Attributes {#attributes}

Like standard HTML elements, the `<Model>` component supports a range of attributes (passed as React props) to control its behavior.

`src`

The URL of the 3D model to embed. This attribute has the highest priority when multiple sources are provided. If `src` is specified, it is the first source attempted for loading.

`poster`

A URL for an image to be shown while the 3D model is downloading or if it fails to load. If this attribute is not specified, a default loading spinner is displayed.

`loading`

Specifies how the model should be loaded.

- `eager` (default): the model begins loading immediately.
- `lazy`: model loading is deferred until the element enters the viewport. This is handled natively to ensure accurate intersection detection and optimal performance.

`autoPlay`

A Boolean attribute. If `true`, the model's first available animation automatically begins to play as soon as the model has loaded successfully.

`loop`

A Boolean attribute. If `true`, the animation automatically seeks back to the start upon reaching the end.

`stagemode`

Controls the built-in user interaction mode for the model.

- `none` (default): no built-in interaction is enabled. All interactions must be handled via [spatial events](#spatial-events).
- `orbit`: enables a native orbit interaction mode that lets users rotate the model by dragging, without writing any gesture-handling code.

:::caution[Orbit mode interaction conflicts]
When `stagemode` is set to `orbit`, the view is updated exclusively based on the user's drag input: [`entityTransform`](#transform-and-bounds) becomes read-only and is not updated by the orbit gesture, and the drag gesture handlers `onSpatialDragStart`, `onSpatialDrag`, and `onSpatialDragEnd` are disabled.
:::

## `<source>` Child Element {#source-element}

The `<source>` element specifies one or more model resources for the `<Model>` element. It is a void element: it has no content and does not require a closing tag.

Platforms do not all support the same 3D model formats, so you can provide multiple sources and the runtime uses the first one it understands. Sources are attempted sequentially; if a source fails to load, the next source is attempted. After all sources have failed, an error event fires on the `<Model>` element. Error events are not fired on each individual `<source>` element.

`src`

The URL of the 3D model resource.

`type`

The [MIME media type](https://www.iana.org/assignments/media-types/media-types.xhtml#model) of the model. Currently supported types are `model/vnd.usdz+zip` (USDZ) and `model/gltf-binary` (GLB).

## Lifecycle Events {#lifecycle-events}

`onLoad`

Triggered when the 3D model has loaded successfully and is ready for display and interaction. If multiple sources are provided, this event fires only for the first source that loads successfully.

`onError`

Triggered when the model fails to load. If multiple sources are provided, this event fires only after all sources have been attempted and have failed; it does not fire for each individual source failure.

## Spatial Events {#spatial-events}

`<Model>` is a [3D container element](../../../concepts/3d-content-containers.md), so users can interact with its 3D content directly through [spatial events](../../../concepts/natural-interactions.md#spatial-interactions). The following JSX props are supported:

| JSX prop | Fired when | Reference |
| --- | --- | --- |
| `onSpatialTap` | The user performs a tap gesture on the model. | [Spatial Tap](../event-api/spatial-tap.md) |
| `onSpatialDragStart` | The user begins a drag gesture on the model. | [Spatial Drag](../event-api/spatial-drag.md) |
| `onSpatialDrag` | Continuously while the user drags the model. | [Spatial Drag](../event-api/spatial-drag.md) |
| `onSpatialDragEnd` | The user releases the drag gesture. | [Spatial Drag](../event-api/spatial-drag.md) |
| `onSpatialRotate` | The user performs a rotation gesture on the model. | [Spatial Rotate](../event-api/spatial-rotate.md) |
| `onSpatialRotateEnd` | The user completes the rotation gesture. | [Spatial Rotate](../event-api/spatial-rotate.md) |
| `onSpatialMagnify` | The user performs a magnification (pinch) gesture on the model. | [Spatial Magnify](../event-api/spatial-magnify.md) |
| `onSpatialMagnifyEnd` | The user completes the magnification gesture. | [Spatial Magnify](../event-api/spatial-magnify.md) |

## JavaScript API {#javascript-api}

The React `ref` of `<Model>` provides an interface that extends `HTMLDivElement` with the following model element properties and methods.

### Source State {#source-state}

`currentSrc`

A read-only string that returns the URL of the currently loaded resource.

`ready`

This Promise resolves when the model source file has finished loading and processing.
If the source file cannot be fetched, or the file cannot be parsed as a valid 3D model resource, this Promise rejects.

### Transform and Bounds {#transform-and-bounds}

`entityTransform`

A readable and writable `DOMMatrixReadOnly` representing the [relationship between the 3D model and the internal space of the 3D content container](https://github.com/immersive-web/model-element/blob/main/explainer.md#visual-presentation-control).

By default, the 3D model fills as much of `<Model>`'s width or height as possible while preserving its original proportions, so you can control the size of the 3D model by controlling the size of the 2D plane corresponding to `<Model>`.

`boundingBoxCenter`

A read-only `DOMPoint` that indicates the center of the axis-aligned bounding box (AABB) of the model contents. If the model has an animation, the bounding box is computed from the animation's bind pose and remains static for the lifetime of the model. It does not update when `entityTransform` changes.

`boundingBoxExtents`

A read-only `DOMPoint` that indicates the extents of the bounding box of the model contents.

### Animation Playback {#animation-playback}

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

## Examples {#examples}

### Single `src` {#single-src}

A basic model embed using the `src` attribute:

```jsx
import { Model } from "@webspatial/react-sdk";

function MyScene() {
  return <Model src="/modelasset/Duck.glb" enable-xr />;
}
```

### Multiple `<source>` elements {#multiple-source-elements}

Provide both USDZ and GLB formats for cross-platform compatibility:

```jsx
import { Model } from "@webspatial/react-sdk";

function MyScene() {
  return (
    <Model enable-xr>
      <source src="/modelasset/vehicle.usdz" type="model/vnd.usdz+zip" />
      <source src="/modelasset/vehicle.glb" type="model/gltf-binary" />
    </Model>
  );
}
```

### Using a `poster` image {#using-a-poster-image}

Display a poster image while the model is loading:

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

### Autoplay and loop {#autoplay-and-loop}

Automatically play the model's animation in a loop:

```jsx
import { Model } from "@webspatial/react-sdk";

function AnimatedModel() {
  return <Model src="/animated-robot.glb" autoPlay loop enable-xr />;
}
```

### Orbit interaction mode {#orbit-interaction-mode}

Enable built-in drag-to-rotate interaction:

```jsx
import { Model } from "@webspatial/react-sdk";

function OrbitingDuck() {
  return <Model src="/modelasset/Duck.glb" stagemode="orbit" enable-xr />;
}
```

### Lazy loading a model {#lazy-loading-a-model}

Defer loading until the model is scrolled into view:

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

## Availability {#availability}

Support for each API across spatial platforms and WebSpatial SDK versions:

### Attributes and elements {#availability-attributes}

| API | visionOS | Pico OS | WebSpatial SDK |
| --- | --- | --- | --- |
| `model` | 26 | Not supported | 1.1 |
| `enable-xr` | 26 | 6 α2.0 | 1.1 |
| `src` | 26 (USD/USDZ) | 6 α2.0 (USD/USDZ/GLB/GLTF) | 1.1 |
| `onLoad` | 26 | 6 α2.0 | 1.1 |
| `onError` | 26 | 6 α2.0 | 1.1 |
| `autoPlay` | 26 | 6 α2.1 | 1.6 |
| `loop` | 26 | 6 α2.1 | 1.6 |
| `<source>` | 26 (USD/USDZ) | 6 α2.1 (USD/USDZ/GLB/GLTF) | 1.6 |
| `poster` | 26 | 6 β2.0 | 1.7 |
| `loading` | 26 | 6 β2.1 | 1.7 |
| `stagemode` | 26 | 6 | TBD |

### CSS {#availability-css}

| Style | visionOS | Pico OS | WebSpatial SDK |
| --- | --- | --- | --- |
| [`--xr-depth`](../css-api/depth.md) | 26 | 6 α2.0 | 1.1 |
| [`--xr-back`](../css-api/back.md) | 26 | 6 α2.0 | 1.1 |
| `width`, `height` | 26 | 6 α2.0 | 1.1 |
| `translate`, `translateX`, `translateY`, `translateZ`, `translate3d` | 26 | 6 α2.0 | 1.1 |
| `rotate`, `rotateX`, `rotateY`, `rotateZ`, `rotate3d` | 26 | 6 α2.0 | 1.1 |
| `scale`, `scaleX`, `scaleY`, `scaleZ`, `scale3d` | 26 | 6 α2.0 | 1.1 |

### JavaScript {#availability-javascript}

| API | visionOS | Pico OS | WebSpatial SDK |
| --- | --- | --- | --- |
| `entityTransform` | 26 | 6 α2.0 | 1.2 |
| `currentSrc` | 26 | 6 α2.0 | 1.2 |
| `ready` | 26 | 6 α2.0 | 1.2 |
| `duration` | 26 | 6 α2.1 | 1.6 |
| `playbackRate` | 26 | 6 α2.1 | 1.6 |
| `paused` | 26 | 6 α2.1 | 1.6 |
| `play()` | 26 | 6 α2.1 | 1.6 |
| `pause()` | 26 | 6 α2.1 | 1.6 |
| `currentTime` | 26 | 6 β2.0 | 1.7 |
| `boundingBoxCenter` | 26 | 6 | TBD |
| `boundingBoxExtents` | 26 | 6 | TBD |

## References {#references}

- [A step into the spatial web: the HTML model element in Apple Vision Pro](https://webkit.org/blog/17118/a-step-into-the-spatial-web-the-html-model-element-in-apple-vision-pro/)
- [The model element explainer](https://github.com/immersive-web/model-element/blob/main/explainer.md)
- [The `<model>` element specification draft](https://immersive-web.github.io/model-element/)
