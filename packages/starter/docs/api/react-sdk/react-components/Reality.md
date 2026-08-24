<!--
sidebar_position: 3
description: 'Render dynamic 3D content inside a spatialized container with the unified-rendering engine API.'
-->

# `<Reality>`

## Overview

Like [`<Model>`](./Model.md), which is also a [3D content container element](../../../concepts/3d-content-containers.md), `<Reality>` has the capabilities of a [spatialized HTML element](../../../concepts/spatialized-html-elements.md). It is used as a 2D plane floating in space and participates in HTML/CSS layout. The difference is that `<Reality>` is a [dynamic 3D content container](../../../concepts/3d-content-containers.md#dynamic-3d-containers). Its 3D content is not implemented with prebuilt static 3D model files. Instead, arbitrary 3D content can be rendered dynamically in the local space in front of the 2D plane through a [3D Engine API](../../../concepts/3d-content-containers.md#3d-engine-api) that supports unified rendering.

These 3D engine APIs are provided by WebSpatial SDK as React components:

```js
import {
  Reality,
  Material,
  ModelAsset,
  AttachmentAsset,
  World,
  Entity,
  Box,
  Sphere,
  Plane,
  Cone,
  Cylinder,
  ModelEntity,
  AttachmentEntity,
} from "@webspatial/react-sdk";
```

```js
<Reality style={{ width: "500px", height: "500px", "--xr-depth": 100 }}>
  <Material type="unlit" id="red" color="#ff0000" />
  <ModelAsset id="teapot" src="https://example.com/model.usdz" />
  <World>
    <Box materials={["red"]} width={0.2} height={0.2} depth={0.2} />
  </World>
</Reality>
```

## Scene Graph

These 3D engine APIs include two categories:

The first is [3D Entity](#3d-entity). These React components can only be used inside `<World>`, which can also be written as `<SceneGraph>`. `<World>` is the root node of all 3D content inside a dynamic 3D container.

The second is [3D asset declarations](#3d-assets), such as `<Material>`. These React components can only be used as top-level children of `<Reality>`, outside `<World>`, and only affect actual rendering when referenced by a 3D Entity.

## 3D Assets

The following 3D asset declarations can appear among the top-level children of `<Reality>`:

1. Predeclared materials can be referenced.

```js
<Reality>
  <Material type="unlit" id="solid" color="#00ff00" />
  <Material type="unlit" id="glass" color="#0000ff" transparent opacity={0.5} />
  <World>
```

2. 3D model files can be declared.

```js
<Reality>
  <ModelAsset
    id="ship-blueprint"
    src="https://example.com/fighter.usdz"
    onLoad={() => {}}
    onError={() => {}} />
  <World>
```

3. 2D HTML/CSS content to be attached onto an Entity can be declared.

```js
<Reality>
  <AttachmentAsset name="info">
    <div style={{ width: '100%' }}>
      <p>Some text</p>
    </div>
  </AttachmentAsset>
  <World>
```

## 3D Entity

3D Entity components do not participate in HTML layout. They are rendered only inside the `<Reality>` container according to the 3D engine system. They do not support CSS styles. Instead, they use "Transform props" from the 3D engine system:

```js
<Entity
  // Position: x (left/right), y (down/up), z (away/toward), in meters
  position={{ x: 0.1, y: -0.2, z: 0.3 }}

  // Rotation: Euler angles in degrees (not radians)
  rotation={{ x: 0, y: 90, z: 0 }}  // quarter turn about the Y axis

  // Scale: 1 = normal, 2 = double, 0.5 = half
  scale={{ x: 1, y: 2, z: 1 }}  // stretched vertically
  >
```

| Prop | Value | Unit | Default | Meaning |
| --- | --- | --- | --- | --- |
| `position` | `{ x, y, z }` | meters (`m`) | `{ x: 0, y: 0, z: 0 }` | Offset of the entity's origin |
| `rotation` | `{ x, y, z }` | degrees (`deg`) | `{ x: 0, y: 0, z: 0 }` | Euler angles about the entity's own X, Y, and Z axes |
| `scale` | `{ x, y, z }` | ratio | `{ x: 1, y: 1, z: 1 }` | Multiplier along each axis |

Transform props use the coordinate system of the local 3D space in front of the 2D plane corresponding to `<Reality>` by default, with the origin at the center point of that space. It uses a right-handed coordinate system, with Y pointing upward, Z pointing toward the user, and lengths expressed by default in the physical world unit (`m`) oriented toward real-world objects.

> [!TIP]
> **Related APIs**
>
> The depth of this space can be set with [`depth`](../css-api/depth.md) and the current depth can be queried with [`clientDepth`](../dom-api/clientDepth.md).

For Entity nodes directly under `<World>`, the `position` value in Transform props is relative to the coordinate-system origin. For other Entity nodes used as children, the `position` value in Transform props is relative to the parent Entity's `position`.

The ready-to-use [Entities](../../../concepts/3d-content-containers.md#3d-engine-api) currently provided by WebSpatial SDK fall into four categories: [Base Entity](#base-entity), [Primitive Entities](#primitive-entities), [Model Entity](#model-entity), and [Attachment Entity](#attachment-entity).

### Rotation Axes

`rotation` is not a single axis-plus-angle value. Each field is an independent Euler angle applied about the matching local axis of the entity:

| Field | Axis | Positive angle turns |
| --- | --- | --- |
| `rotation.x` | local X (points right) | The top of the entity toward the user |
| `rotation.y` | local Y (points up) | The front of the entity toward the right |
| `rotation.z` | local Z (points toward the user) | The entity counter-clockwise as the user sees it |

The rules behind that table:

- **Unit is degrees.** `90` is a quarter turn. Radian-style values are not converted, so `Math.PI / 2` is read as roughly `1.57` degrees and looks like no rotation at all.
- **Direction follows the right-hand rule.** For each axis, a positive angle rotates counter-clockwise when you look from the positive end of that axis back toward the origin.
- **Order is fixed.** The three angles compose as `Rz * Ry * Rx`: X is applied first, then Y, then Z, about the entity's own axes. Setting more than one field at a time is therefore not commutative — `{ x: 90, y: 90, z: 0 }` and `{ x: 0, y: 90, z: 90 }` land in different orientations.
- **The pivot is the entity's own origin**, not the container center and not a bounding-box corner. Every [primitive entity](#primitive-entities) is generated centered on that origin, so a primitive with only `rotation` set spins in place.
- **Rotation is inherited.** A child entity's transform is composed with its parent's, so rotating a parent `<Entity>` orbits its children around the parent's origin.

> [!CAUTION]
> **Degrees, not radians**
>
> It is easy to assume radians here, and earlier revisions of this page said so. The value the SDK sends to the renderer is degrees, matching CSS `rotateX()` / `rotateY()` / `rotateZ()`. If your code already carries radian values, convert them with `deg = rad * 180 / Math.PI`.

### Base Entity

`<Entity>` is invisible and is used as a parent component and group container for other Entities. You can use it to include multiple Entities in one group.

```js
<Reality>
  <World>
    <Entity position={{ x: 1, y: 0, z: 0 }}>
      <Box />
      <Box />
    </Entity>
    <Box position={{ x: 2, y: 0, z: 0 }} />
  </World>
```

### Primitive Entities

Primitive entities are the built-in geometric shapes. Each one takes shape props in addition to the [Transform props](#3d-entity) every Entity accepts.

| Component | Required shape props | Optional shape props |
| --- | --- | --- |
| `<Box>` | `width`, `height`, `depth` | `cornerRadius`, `splitFaces` |
| `<Plane>` | `width`, `height` | `cornerRadius` |
| `<Sphere>` | `radius` | — |
| `<Cone>` | `radius`, `height` | — |
| `<Cylinder>` | `radius`, `height` | — |

All shape lengths are in meters, the same unit as `position`.

```js
<Box
  width={0.2}
  height={0.2}
  depth={0.2} // meters (0.1 = 10cm)
  cornerRadius={0.01} // rounded edges
/>
```

#### Required Props Are Required

The TypeScript types mark every shape prop as optional, but the mesh is built by the native renderer, which rejects a shape whose required props are missing. Leave one out and geometry creation fails with an error such as `missing required fields for ConeGeometry: radius, height`, and the entity renders nothing. There are no implicit size defaults.

```js
<Cone radius={0.1} height={0.2} />  // renders
<Cone radius={0.1} />               // fails: height is missing, nothing renders
```

`cornerRadius` and `splitFaces` are genuinely optional and default to `0` and `false`. Keep `cornerRadius` between `0` and half of the smallest dimension it rounds; larger values are not meaningful.

Changing any shape prop rebuilds the mesh. Changing Transform props does not, so animate `position` / `rotation` / `scale` rather than the shape props when you want a smooth result.

#### Local Axis Alignment

Each primitive is generated centered on the entity's own origin, so `rotation` spins it in place. Which axis a shape prop measures, and which way the shape points before any rotation, is fixed:

| Component | Axis alignment before rotation |
| --- | --- |
| `<Box>` | `width` spans local X, `height` spans local Y, `depth` spans local Z |
| `<Plane>` | Lies flat in the local XY plane with its front face pointing along +Z; `width` spans X, `height` spans Y. It is a single-sided quad rendered with back-face culling, so it is not visible from behind |
| `<Sphere>` | Radially symmetric; `rotation` has no visible effect unless a texture is applied |
| `<Cone>` | Central axis runs along local Y with the apex toward +Y and the circular base toward -Y; `radius` is measured in the local XZ plane |
| `<Cylinder>` | Central axis runs along local Y with both caps facing ±Y; `radius` is measured in the local XZ plane |

A `<Cone>` or `<Cylinder>` therefore stands upright by default. To lay one on its side, rotate it a quarter turn about X or Z:

```js
<Cylinder radius={0.05} height={0.4} rotation={{ x: 0, y: 0, z: 90 }} />
```

#### Materials

All of these primitive entities support the `materials` prop, which can reference [predeclared materials](#3d-assets).

```js
<Reality>
  <Material type="unlit" id="solid" color="#00ff00" />
  <Material type="unlit" id="glass" color="#0000ff" transparent opacity={0.5} />
  <World>
    <Box
      width={0.2}
      height={0.2}
      depth={0.2} // meters (0.1 = 10cm)
      materials={["glass"]}
      cornerRadius={0.01} // rounded edges
    />
  </World>
</Reality>
```

Two prerequisites apply to `materials`:

- Every id in the array must be declared by a `<Material>` that is a top-level child of the same `<Reality>`, outside `<World>`. The mesh is attached only after every referenced id resolves, so an id that is never declared leaves the entity waiting and nothing renders.
- A primitive has one material slot, so only the first entry is used. `<Box>` is the exception: set `splitFaces={true}` and the box exposes one slot per face, letting `materials` carry up to six entries, one for each of the six faces.

### Model Entity

`<ModelEntity>` is an Entity that renders content from a prebuilt 3D model file.

Using a "spaceship fleet" as an example: download and load the spaceship model into memory once, then reference it to create three separate Model Entities and render three spaceships:

```js
import { Reality, World, ModelAsset, ModelEntity } from "@webspatial/react-sdk";

function SpaceshipFleet() {
  return (
    <Reality style={{ width: "100%", height: "500px" }}>
      {/* --- 1. THE RESOURCE --- */}
      {/* This downloads the file once. It is INVISIBLE right now. */}
      <ModelAsset
        id="ship-blueprint"
        src="https://example.com/fighter-jet.usdz"
      />

      {/* --- 2. THE SCENE --- */}
      <World>
        {/* Leader Ship: Center, Normal Size */}
        <ModelEntity
          model="ship-blueprint" // Points to the ID above
          position={{ x: 0, y: 0, z: 0 }}
          scale={{ x: 1, y: 1, z: 1 }}
        />

        {/* Left Wingman: Moved left, slightly smaller */}
        <ModelEntity
          model="ship-blueprint" // Reuses the same loaded file!
          position={{ x: -0.5, y: -0.2, z: 0.3 }}
          scale={{ x: 0.8, y: 0.8, z: 0.8 }}
        />

        {/* Right Wingman: Moved right, slightly smaller */}
        <ModelEntity
          model="ship-blueprint" // Reuses the same loaded file
          position={{ x: 0.5, y: -0.2, z: 0.3 }}
          scale={{ x: 0.8, y: 0.8, z: 0.8 }}
        />
      </World>
    </Reality>
  );
}
```

For animation requirements, you can implement them by polling and updating Transform props with JS.
Example:

```js
const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });

useEffect(() => {
  let id;
  function animate() {
    // Degrees per frame: 1 deg at 60fps is one full turn every 6 seconds.
    setRotation(prev => ({ ...prev, y: (prev.y + 1) % 360 }));
    id = requestAnimationFrame(animate);
  }
  animate();
  return () => cancelAnimationFrame(id);
}, []);

<Box width={0.2} height={0.2} depth={0.2} rotation={rotation} />;
```

## Attachment Entity

`<AttachmentEntity>` is an Entity similar to `<Plane>`. It can reference [predeclared 2D HTML/CSS content](#3d-assets) and attach that content onto its own surface.

> [!CAUTION]
> **Current limitation**
>
> In a later version of WebSpatial SDK, `<AttachmentEntity>` will support `width` and `height` like `<Plane>` does, which it does not currently support, and full [Transform props](#3d-entity), whereas the current version only supports `position`. For now, you need to use the `size` prop to set the size, with the same `px` unit used by 2D content.

```js
<Reality>
  <AttachmentAsset name="info">
    <div style={{ width: "100%" }}>
      <p>Some text</p>
    </div>
  </AttachmentAsset>
  <World>
    <Box position={{ x: 0.5, y: -0.2, z: 0.3 }} />
    <Entity position={{ x: -0.5, y: -0.2, z: 0.3 }}>
      <AttachmentEntity
        attachment="info"
        position={{ x: 0, y: 0, z: 0 }}
        size={{ width: 100, height: 100 }}
      />
    </Entity>
  </World>
</Reality>
```
