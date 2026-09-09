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

  // Rotation: degrees (360 = full turn)
  rotation={{ x: 0, y: 90, z: 0 }}  // 90° on Y-axis

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

`<ModelEntity>` 支持和其他 Entity 相同的 [Transform 属性](#3d-entity)，因此可以像几何实体一样被定位、旋转、缩放和[做动画](#animation)。它不提供模型文件内部自带动画的播放控制。要播放那种动画，请改用 [`<Model>`](./Model.md#animation-playback-api)。

## 动画 {#animation}

在 `<Reality>` 内部和周围，有三种不同的东西可以做动画。它们使用不同的 API，不能互相替代。

| 我想做的事 | 用什么 |
| --- | --- |
| 播放 3D 模型文件内部自带的动画，例如 GLB 或 USDZ 文件中导出的骨骼动画或关键帧动画 | [`<Model>` 的播放 API](./Model.md#animation-playback-api)。当前版本的 `<ModelEntity>` 不提供内嵌动画的播放控制。 |
| 让 `<Reality>` 内的 Entity 随时间移动、旋转或缩放 | [`useEntityAnimation()`](../js-api/useEntityAnimation.md) 搭配 Entity 的 `animation` 属性。实验性 API。 |
| 用动画 API 覆盖不到的自定义逻辑驱动 Transform 属性，例如物理模拟、跟随手势、程序化运动 | 普通的 React state 更新，例如在 `requestAnimationFrame` 中更新。 |

### Entity Transform 动画 {#entity-transform-animation}

[`useEntityAnimation()`](../js-api/useEntityAnimation.md) 在 WebSpatial Runtime 的原生层为任意 Entity 的 `position`、`rotation`、`scale` 做动画。只需描述一次起点姿态、终点姿态、时长和缓动，运行时会逐帧插值，不需要重新渲染 React 组件。

```jsx
import { Reality, World, ModelAsset, ModelEntity } from "@webspatial/react-sdk";
import { useEntityAnimation } from "@webspatial/react-sdk/experimental";

function SpinningShip() {
  const [animation, api, entityProps] = useEntityAnimation({
    from: { rotation: { y: 0 } },
    to: { rotation: { y: 360 } },
    duration: 4,
    timingFunction: "linear",
    loop: true,
  });

  return (
    <Reality style={{ width: "100%", height: "500px" }}>
      <ModelAsset id="ship-blueprint" src="https://example.com/fighter-jet.usdz" />
      <World>
        <ModelEntity
          model="ship-blueprint"
          position={{ x: 0, y: 0, z: 0 }}
          {...entityProps}
          animation={animation}
        />
      </World>
    </Reality>
  );
}
```

- 把返回的 `animation` 传给 Entity 的 `animation` 属性。一个 animation 只能绑定到一个 Entity。
- 把 `entityProps` 展开在静态 Transform 属性之后，这样动画停止后 Entity 会停在最近确认的姿态上。
- 用 `api.play()`、`api.pause()`、`api.stop()`、`api.reset()`、`api.finish()` 控制播放。
- 动画在播放中、延迟中或暂停中时，运行时拥有这个 Entity 的完整 transform，会忽略普通的 Transform 属性更新。

:::caution[实验性 API，运行环境支持情况不同]
`useEntityAnimation` 从 `@webspatial/react-sdk/experimental` 导入，仍可能变化。运行环境的支持情况也不同：渲染调用这个 Hook 的组件之前，先用 `WebSpatialRuntime.supports("useEntityAnimation")` 检查；返回 `false` 时，用静态属性把 Entity 直接渲染在最终姿态上。完整 API、播放状态和限制见 [`useEntityAnimation`](../js-api/useEntityAnimation.md) 页面。
:::

### 自定义逐帧动画 {#custom-frame-by-frame-animation}

对于动画 API 不提供的逻辑，例如响应手势、物理模拟、程序化运动，或者用同一个时钟驱动多个 Entity，仍然可以直接用 React 更新 Transform 属性。每次 state 更新都会向运行时发送一次新的 transform，因此要尽量减少每帧的工作量。

```js
const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });

useEffect(() => {
  let id;
  function animate() {
    setRotation((prev) => ({ ...prev, y: prev.y + 1 })); // 每帧 1 度
    id = requestAnimationFrame(animate);
  }
  animate();
  return () => cancelAnimationFrame(id);
}, []);

<Box rotation={rotation} />;
```

不要在同一个 Entity 上把这种方式和正在播放的 `useEntityAnimation` 混用。只要运动可以用起点姿态、终点姿态和关键帧表达，就优先使用 `useEntityAnimation`。

:::note[让容器本身动起来]
Transform 属性和 `useEntityAnimation` 移动的是 `<Reality>` 3D 空间内部的内容。把 `<Reality>` 元素本身当作页面中的 2D 面片来做动画（和其他空间化 HTML 元素一样），是另一项实验性能力：`@webspatial/react-sdk/experimental` 中的 `useAnimation()` Hook，通过元素的 `xr-animation` 属性绑定，并由 `WebSpatialRuntime.supports("useAnimation")` 控制是否可用。
:::

## 附着实体 {#attachment-entity}

`<AttachmentEntity>` 是一个类似 `<Plane>` 的 Entity，可以引用[预先声明好的 2D HTML/CSS 内容](#3d-assets)，让它附着在自己表面上。

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
