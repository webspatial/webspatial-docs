---
sidebar_position: 5
description: 'Attach window-level HTML UI, such as a toolbar or side panel, to the edges of the current spatial scene window.'
---

# `<Ornament>`

:::caution[Experimental API]
`<Ornament>` is exported only from the opt-in experimental entry `@webspatial/react-sdk/experimental`. Its name and props can still change before it graduates into the default `@webspatial/react-sdk` entry. It requires the `2.x` line of `@webspatial/react-sdk`, which introduced that entry.
:::

## Summary

An Ornament is 2D HTML UI that the [WebSpatial Runtime](../../../concepts/webspatial-app.md#webspatial-runtime) attaches to the outside edge of the current [Spatial Scene](../../../concepts/spatial-scenes.md#ornaments) window, for example a toolbar floating below the window or a control panel beside it. It is the Web counterpart of the ornaments that native spatial apps hang around their windows.

An Ornament is window-level UI, not page content:

- It does not participate in the page's HTML/CSS layout. It is positioned relative to the scene window's edges, not relative to any element in the page, and it is not clipped by the window bounds.
- It is not a [spatialized HTML element](../../../concepts/spatialized-html-elements.md), and it is not 3D content inside a [3D content container](../../../concepts/3d-content-containers.md) such as `<Reality>`.
- Its children render inside a separate document owned by the runtime. React portals the children into that document, so React state, context, and event handlers keep working as usual.
- It moves, scales, and hides together with the scene window.

```tsx
import { Ornament } from "@webspatial/react-sdk/experimental";

function PlayerToolbar() {
  return (
    <Ornament
      attachmentAnchor="bottom"
      contentAlignment="center"
      visibility="visible"
      width={360}
      height={64}
      cornerRadius={{
        topLeading: 32,
        topTrailing: 32,
        bottomLeading: 32,
        bottomTrailing: 32,
      }}
      style={{ "--xr-background-material": "translucent" }}
    >
      <nav className="toolbar">
        <button>Previous</button>
        <button>Play</button>
        <button>Next</button>
      </nav>
    </Ornament>
  );
}
```

Render `<Ornament>` anywhere inside [`<SpatialBoot>`](./SpatialBoot.md). Its position in the React tree only decides its lifecycle: the Ornament is created when the component mounts and destroyed when it unmounts. A page can render several Ornaments at once, each anchored independently.

## Availability

| Platform | Ornament | Minimum WebSpatial Runtime |
| --- | --- | --- |
| visionOS, as a [Packaged WebSpatial App](../../../concepts/webspatial-app.md#packaged-webspatial-app) | Supported | `WSAppShell/1.7.0` |
| PICO OS 6, in the [Web App Runtime](../../../concepts/webspatial-app.md#web-runtime) | Supported | `PicoWebApp/0.3.1` |
| Ordinary browsers on desktop and mobile | Not rendered | See [Fallback](#fallback) |

The runtime version is the one reported in the [User Agent string](../dom-api/userAgent.md). Older WebSpatial Runtimes behave like unsupported platforms.

## Props

```ts
import type { BackgroundMaterialType, CornerRadius } from "@webspatial/react-sdk";
import type { OrnamentPoint3D, OrnamentVisibility } from "@webspatial/react-sdk/experimental";

type OrnamentProps = {
  attachmentAnchor?: OrnamentPoint3D; // default: "bottom"
  contentAlignment?: OrnamentPoint3D; // default: "back"
  visibility?: OrnamentVisibility; // "visible" | "hidden", default: "visible"
  width?: number; // default: 200
  height?: number; // default: 150
  cornerRadius?: Partial<CornerRadius>; // default: 0 for every corner
  style?: React.CSSProperties & {
    "--xr-background-material"?: BackgroundMaterialType; // default: "none"
  };
  children: React.ReactNode;
};
```

Every prop can change while the Ornament is mounted. Changes are applied to the existing Ornament in place; the Ornament is not recreated and its children are not remounted.

### `attachmentAnchor`

The point on the scene window that the Ornament is attached to. The default is `bottom`, the center of the window's bottom edge.

`OrnamentPoint3D` names a point on the window's 3D bounding box by combining a vertical part (`top`, `bottom`, or none for the vertical center), a horizontal part (`leading`, `trailing`, or none for the horizontal center), and a depth part (`front`, `back`, or none for the depth center). `leading` is the left side and `trailing` is the right side in left-to-right layouts.

```ts
type OrnamentPoint3D =
  | "topLeadingFront" | "topLeading" | "topLeadingBack"
  | "topFront" | "top" | "topBack"
  | "topTrailingFront" | "topTrailing" | "topTrailingBack"
  | "leadingFront" | "leading" | "leadingBack"
  | "front" | "center" | "back"
  | "trailingFront" | "trailing" | "trailingBack"
  | "bottomLeadingFront" | "bottomLeading" | "bottomLeadingBack"
  | "bottomFront" | "bottom" | "bottomBack"
  | "bottomTrailingFront" | "bottomTrailing" | "bottomTrailingBack";
```

:::caution[Top-center anchors are reserved]
`top`, `topFront`, and `topBack` are not accepted as `attachmentAnchor` values. The top edge of a scene window is occupied by the [built-in scene menu](../../../concepts/spatial-scenes.md). If one of these values is passed, the SDK falls back to the default `bottom`. Use `topLeading*` or `topTrailing*` to place an Ornament near the top corners instead.
:::

### `contentAlignment`

The point on the Ornament's own content box that is placed at the [`attachmentAnchor`](#attachmentanchor). It accepts the same `OrnamentPoint3D` values, with no reserved values. The default is `back`: the Ornament is centered on the anchor point horizontally and vertically, and its back face sits in the plane of the window.

Combine the two props to control where the Ornament ends up relative to the window edge. For example, with `attachmentAnchor="bottom"`:

- `contentAlignment="top"` hangs the whole Ornament below the window edge.
- `contentAlignment="center"` straddles the edge, half inside and half outside the window.
- `contentAlignment="bottom"` overlaps the window, with the Ornament's bottom edge on the window's bottom edge.

### `visibility`

Either `visible` (default) or `hidden`. A hidden Ornament stays created and its children stay mounted, but it is not drawn and does not receive input. Toggle `visibility` when the Ornament will be shown again soon; conditionally rendering `<Ornament>` instead destroys and recreates it.

### `width` and `height`

The size of the Ornament's content area, in the same `px` unit used by the page layout. The defaults are `200` by `150`. Values must be positive finite numbers; anything else falls back to the default. The Ornament does not size itself to its content: children are laid out in a document whose viewport has exactly this size, and the document body is stretched to fill it.

### `cornerRadius`

Rounds the corners of the Ornament's backplate and clips its content to the same shape. Pass any subset of `topLeading`, `topTrailing`, `bottomLeading`, and `bottomTrailing`, in `px`, each `0` or greater. Corners that are omitted keep their current value (`0` initially). This is separate from any CSS `border-radius` you set on elements inside the Ornament.

### `style`

Applied to the root `<html>` element of the Ornament's document, not to a wrapper element around your children. Values are serialized like React inline styles: numbers become `px` where the property expects a length, and camelCase names are converted to CSS names.

Two uses matter in practice:

- `--xr-background-material` sets the Ornament's backplate material, the same way [`background-material`](../css-api/background-material.md) does for scene windows and spatialized HTML elements. Accepted values are `none` (default), `transparent`, `translucent`, `thin`, `regular`, and `thick`. `none` and `transparent` show only the HTML content with no backplate; the others render a real-time material behind the content.
- Any other property, for example `color`, `fontFamily`, or a custom property such as `--accent`, becomes a document-level style that the Ornament's content inherits. Because it is set on the Ornament document's root element, `backgroundColor` here paints the entire Ornament area, in front of the material backplate.

## Content Rules

Ornament children are ordinary 2D HTML:

- Page styles are available inside the Ornament. `<style>` and `<link rel="stylesheet">` elements in the page `<head>`, including style tags injected at runtime by CSS-in-JS libraries, are synchronized into the Ornament document, so global CSS, class names, and CSS variables work as they do in the page.
- Links with a `target` other than `_self`, such as `<a href target="_blank">`, open a [new scene](../../../concepts/spatial-scenes.md#new-scenes), the same as in the page.
- Spatial primitives are not supported inside Ornament content, because the Ornament document is not a Spatial Scene of its own. An element with the [`enable-xr` marker](./jsx-marker.md#enable-xr) renders as plain HTML, [`<Model>`](./Model.md) falls back to the standard `<model>` element, and [`<Reality>`](./Reality.md) renders nothing. Development builds log a warning in each case.
- Nesting is not supported. An `<Ornament>` declared inside another Ornament's children, or inside `<AttachmentAsset>` content, is ignored and logs a warning in development builds.

## Fallback

In environments where Ornament is not supported, including ordinary browsers, `<Ornament>` renders `null`. Its children are not rendered anywhere in the page, and no 2D overlay is created in their place. If the UI inside an Ornament is essential, render an in-page alternative when Ornament is unavailable. `WebSpatialRuntime.supports("Ornament")` from `@webspatial/react-sdk` returns whether the current runtime supports it, and [User Agent detection](../dom-api/userAgent.md) identifies the platform.

:::tip[Using SSR?]
`<Ornament>` is client-only. Keep it inside [`<SpatialBoot>`](./SpatialBoot.md) in client-rendered code, as described in [How to enable WebSpatial in SSR-enabled projects](../../../how-to/ssr.md). If it mounts before the spatial capabilities have loaded, development builds show an on-page diagnostic instead of the Ornament.
:::
