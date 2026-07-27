---
sidebar_position: 3
description: '使用统一渲染的 3D 引擎 API，在空间化容器中渲染动态 3D 内容。'
---

# `<Reality>`

## 概述 {#overview}

`<Reality>` 跟同为 [3D 内容容器元素](../../../concepts/3d-content-containers.md)的 [`<Model>`](./Model.md) 一样具备[空间化 HTML 元素的能力](../../../concepts/spatialized-html-elements.md)，作为空间中悬浮的 2D 面片使用，参与 HTML/CSS 布局，跟`<Model>` 的区别是，`<Reality>` 是[动态 3D 内容容器](../../../concepts/3d-content-containers.md#dynamic-3d-containers)，它的 3D 内容不是用预先制作好的、静态的 3D 模型文件来实现，而是在 2D 面片前方的局部空间中可以用[支持统一渲染的 3D Engine API](../../../concepts/3d-content-containers.md#3d-engine-api) 动态渲染任意 3D 内容。

这些 3D 引擎 API 被 WebSpatial SDK 作为 React 组件提供：

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

## 场景图 {#scene-graph}

这些 3D 引擎 API 包含两类：

第一类是 [3D Entity](#3d-entity)，这种 React 组件只能在 `<World>`（也可写作 `<SceneGraph>`）里使用，`<World>` 是动态 3D 容器内所有 3D 内容的根节点。

第二类是 [3D 资产的声明](#3d-assets)，比如材质（`<Material>`），这种 React 组件只能作为 `<Reality>` 中的顶层子节点、在 `<World>` 外面使用，需要被 3D Entity 引用才能实际影响渲染结果。

## 3D 资产 {#3d-assets}

在 `<Reality>` 的顶层子节点中，可以包含以下 3D 资产声明：

1. 可以引用预先声明的材质。

```js
<Reality>
  <Material type="unlit" id="solid" color="#00ff00" />
  <Material type="unlit" id="glass" color="#0000ff" transparent opacity={0.5} />
  <World>
```

2. 可以声明 3D 模型文件。

```js
<Reality>
  <ModelAsset
    id="ship-blueprint"
    src="https://example.com/fighter.usdz"
    onLoad={() => {}}
    onError={() => {}} />
  <World>
```

3. 可以声明要附着在 Entity 上的 2D HTML/CSS 内容。

```js
<Reality>
  <AttachmentAsset name="info">
    <div style={{ width: '100%' }}>
      <p>Some text</p>
    </div>
  </AttachmentAsset>
  <World>
```

## 3D 实体 {#3d-entity}

3D Entity 组件不参与 HTML 布局，只在 `<Reality>` 容器内按照 3D 引擎体系来渲染，它们不支持 CSS 样式，而是采用 3D 引擎体系里的「Transform 属性」：

```js
<Entity
  // Position: x (left/right), y (down/up), z (away/toward)
  position={{ x: 0.1, y: -0.2, z: 0.3 }}

  // Rotation: radians (Math.PI = 180°)
  rotation={{ x: 0, y: Math.PI / 2, z: 0 }}  // 90° on Y-axis

  // Scale: 1 = normal, 2 = double, 0.5 = half
  scale={{ x: 1, y: 2, z: 1 }}  // stretched vertically
  >
```

Transform 属性默认使用 `<Reality>` 对应的 2D 面片前方局部 3D 空间的坐标系，原点是这个空间的中心点。采用右手坐标系，Y 轴朝上，Z 轴朝向用户，长度单位默认用面向现实世界物体的物理单位（`m`）。

:::tip[相关 API]
这个空间的深度可以用 [`depth`](../css-api/depth.md) 设置，可以用 [`clientDepth`](../dom-api/clientDepth.md) 查询当前的深度。
:::

对于 `<World>` 顶层的 Entity 节点，Transform 属性中 `position` 的值是相对于坐标系原点的，对于其他作为子节点的 Entity，Transform 属性中 `position` 的值是相对于父 Entity 的 `position`。

WebSpatial SDK 目前提供的[开箱即用的 Entity](../../../concepts/3d-content-containers.md#3d-engine-api) 有以下几类：

### 基础实体 {#base-entity}

`<Entity>` 不可见，作为其他 Entity 的父组件和 group container 使用，可以用它把多个 Entity 包含在一个 group 里。

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

### 几何实体 {#primitive-entities}

几何实体（primitive）包括以下几何形状，它们各自有不同的额外属性：

- `<Box>`
  - 属性：`width`,`height`,`depth`, `cornerRadius`
- `<Plane>`
  - 属性：`width`,`height`, `cornerRadius`
- `<Sphere>`
  - 属性：`radius`
- `<Cone>`
  - 属性：`height`, `radius`
- `<Cylinder>`
  - 属性：`height`, `radius`

示例：

```js
<Box
  width={0.2}
  height={0.2}
  depth={0.2} // meters (0.1 = 10cm)
  cornerRadius={0.01} // rounded edges
/>
```

这些几何实体都支持 `materials` 属性，可以引用[预先声明的材质](#3d-assets)。

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

### 模型实体 {#model-entity}

`<ModelEntity>` 是用预制好的 3D 模型文件渲染内容的 Entity。

以「飞船舰队」为例：将飞船模型下载和加载到内存中一次，然后引用它生成 3 个独立的 Model Entity，渲染出 3 艘飞船

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

对于动画需求，可以用 JS 轮询修改 Transform 属性来实现。
示例：

```js
const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });

useEffect(() => {
  let id;
  function animate() {
    setRotation(prev => ({ ...prev, y: prev.y + 0.02 }));
    id = requestAnimationFrame(animate);
  }
  animate();
  return () => cancelAnimationFrame(id);
}, []);

<Box rotation={rotation} />;
```

## 附着实体 {#attachment-entity}

Attachment（附着）能力可以把可交互的 2D HTML/React 内容——按钮、文字标签、HUD、信息面板等——作为浮动面板附着到 `<Reality>` 场景中的 3D Entity 上。附着的内容和宿主页面共享同一棵 React 组件树和状态：在 attachment 里点击按钮可以更新宿主页面的状态，宿主页面的状态变化也会实时反映到 attachment 里。

这套 API 由两个职责分离的组件组成：

- `<AttachmentAsset>` 声明**渲染什么**（2D 内容模板），属于 [3D 资产声明](#3d-assets)，作为 `<Reality>` 的顶层子节点放在 `<World>` 之外。
- `<AttachmentEntity>` 声明**渲染在哪里**（位置、大小、父 Entity），在 `<World>` 内使用。

这种「资产 vs 实体」的分离和 [`<ModelAsset>` / `<ModelEntity>`](#model-entity) 的模式一致，同样支持一对多渲染：同一个内容模板可以同时渲染到多个 3D 位置上。

:::caution[当前限制]
WebSpatial SDK 后续版本会让 `<AttachmentEntity>` 像 `<Plane>` 一样支持 `width` 和 `height`（当前版本暂不支持）和完整 [Transform 属性](#3d-entity)（当前版本只支持 `position`），需要临时用 `size` 属性设置大小（单位是跟 2D 内容一样的 `px`）。
:::

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

### `<AttachmentAsset>` 属性 {#attachmentasset-props}

`name`

必填。字符串标识符，把这个内容模板关联到一个或多个 `<AttachmentEntity>`，必须和对应实体上的 `attachment` 属性一致。

`children`

要渲染在 attachment 中的 React 内容，可以是任意合法的 React JSX——div、按钮、带样式的组件、有状态的组件等。这些内容共享宿主页面的 React 组件树，props、context 和状态都可以自然流动。

使用规则：

- `<AttachmentAsset>` 必须作为 `<Reality>` 的直接子节点，放在 `<World>` 之外。
- 如果没有任何 `<AttachmentEntity>` 引用这个 `name`，内容不会被渲染。
- 多个 `<AttachmentEntity>` 引用同一个 `name` 时，每个位置都会渲染一份相同的内容模板。

### `<AttachmentEntity>` 属性 {#attachmententity-props}

`attachment`

必填。字符串，需要和对应 `<AttachmentAsset>` 的 `name` 属性一致。

`position`

可选。attachment 相对父 Entity 的本地位置，和其他 [Transform 属性](#3d-entity)一样使用 `m` 单位。默认在原点。

`size`

必填。对象 `{ width: number, height: number }`，设置 attachment 的尺寸，单位是和 2D 内容一样的 `px`。

`<AttachmentEntity>` 必须放在 `<World>` 内、作为某个 Entity 的后代节点使用。它继承父 Entity 的变换：父 Entity 移动时，attachment 会跟随移动。

`attachment`、`position` 和 `size` 都可以在运行时动态修改，attachment 会相应切换到新的内容模板或更新位置和大小。组件卸载时，对应的原生 attachment 会被自动销毁。

### 共享状态与一对多渲染 {#shared-state-and-one-to-many-rendering}

同一个内容模板可以同时渲染到多个 3D 位置上，且附着的内容始终和宿主页面的状态保持连接：

```js
import { useState } from "react";
import {
  Reality,
  AttachmentAsset,
  World,
  Entity,
  Sphere,
  AttachmentEntity,
} from "@webspatial/react-sdk";

function LabeledSpheres() {
  const [count, setCount] = useState(0);

  return (
    <Reality style={{ width: "500px", height: "500px", "--xr-depth": 100 }}>
      {/* One content template, shared with the host page's state */}
      <AttachmentAsset name="counter">
        <button onClick={() => setCount(count + 1)}>Clicked {count}</button>
      </AttachmentAsset>
      <World>
        {/* The same template is rendered at two 3D positions */}
        <Entity position={{ x: -0.5, y: 0, z: 0.3 }}>
          <Sphere radius={0.1} />
          <AttachmentEntity
            attachment="counter"
            position={{ x: 0, y: 0.25, z: 0 }}
            size={{ width: 140, height: 48 }}
          />
        </Entity>
        <Entity position={{ x: 0.5, y: 0, z: 0.3 }}>
          <Sphere radius={0.1} />
          <AttachmentEntity
            attachment="counter"
            position={{ x: 0, y: 0.25, z: 0 }}
            size={{ width: 140, height: 48 }}
          />
        </Entity>
      </World>
    </Reality>
  );
}
```

:::info[样式自动继承]
attachment 里的 2D 内容会自动继承宿主页面的样式：

- 宿主页面的全局样式（如 `<link rel="stylesheet">` 和 `<style>`）会自动同步到 attachment 中。
- 根元素上的 class 名也会同步，因此 Tailwind 这类基于工具类的方案可以直接使用。
- 开发阶段由热更新（HMR）注入的新样式会被自动同步。
- attachment 内的相对 URL 会按宿主页面的地址正确解析。
- 直接写在元素上的内联样式正常生效。
:::

:::caution[attachment 只支持 2D 内容]
attachment 是纯 2D 渲染表面，不能在其中嵌套空间化内容。把以下组件放进 `<AttachmentAsset>` 时会自动降级：

| 组件 | 在 attachment 内的行为 |
| --- | --- |
| `<Reality>` | 不渲染（返回 null），并在控制台输出警告。 |
| `<SpatialDiv>` | 降级为普通 HTML 渲染；空间属性被忽略，布局和样式仍然生效。 |
| [`<Model>`](./Model.md) | 降级为标准 `<model>` 元素渲染，无空间化能力。 |

attachment 暂不支持 billboard（始终朝向用户）之类的朝向策略。
:::
